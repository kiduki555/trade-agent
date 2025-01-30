import { TradingStrategy } from './interfaces/trading-strategy.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StrategyDocument } from './schemas/strategy.schema';

/**
 * 트레이딩 전략을 로드하고 관리하는 클래스
 *
 * 역할/기능:
 * - DB에 저장된 트레이딩 전략들을 동적으로 로드하고 관리합니다.
 * - 전략의 인스턴스화, 파라미터 적용, 에러 처리를 담당합니다.
 */
export class StrategyLoader {
  private strategies: Record<string, TradingStrategy> = {}; // 등록된 전략을 저장하는 객체

  constructor(
    @InjectModel('Strategy') private readonly strategyModel: Model<StrategyDocument>, // DB 모델 주입
  ) {
    void this.loadStrategiesFromDB(); // 생성자에서 전략 로드
  }

  /**
   * DB에서 모든 트레이딩 전략을 로드하고 인스턴스화하는 메서드
   *
   * 역할/기능:
   * - DB에서 전략 정보를 조회하고 동적으로 전략 클래스를 import합니다.
   * - 각 전략을 인스턴스화하고 파라미터를 적용합니다.
   *
   * 매개변수: 없음
   *
   * 반환값:
   * @returns {Promise<void>} - 비동기 작업 완료를 나타내는 Promise
   *
   * 예외:
   * - DB 조회 실패시 에러 로깅
   * - 전략 import 실패시 개별 전략에 대한 에러 로깅
   *
   * 주의사항:
   * - 전략 파일 경로가 올바르지 않으면 import가 실패할 수 있습니다.
   * - 전략 클래스가 TradingStrategy 인터페이스를 구현해야 합니다.
   */
  private async loadStrategiesFromDB(): Promise<void> {
    try {
      const strategiesFromDB = await this.strategyModel.find(); // DB에서 전략 목록 조회

      for (const strategyData of strategiesFromDB) {
        try {
          // 전략 파일 동적 import (모듈의 타입을 명확히 지정)
          const strategyModule = (await import(strategyData.filePath)) as Record<string, any>;
          const StrategyClass = strategyModule[strategyData.className] as new () => TradingStrategy;

          // StrategyClass가 TradingStrategy를 구현했는지 확인
          if (!StrategyClass) {
            console.error(`Invalid strategy class ${strategyData.className} in ${strategyData.filePath}`);
            continue;
          }

          // 전략 인스턴스 생성
          const strategyInstance: TradingStrategy = new StrategyClass();

          // 파라미터가 있는 경우 적용
          if (strategyData.parameters) {
            Object.assign(strategyInstance, strategyData.parameters);
          }

          // 전략 등록
          this.strategies[strategyData.name] = strategyInstance;
        } catch (importError) {
          console.error(`Error loading strategy ${strategyData.name}:`, importError);
        }
      }
    } catch (error) {
      console.error('Error loading strategies from DB:', error);
    }
  }

  /**
   * 특정 이름의 트레이딩 전략을 반환하는 메서드
   *
   * 역할/기능:
   * - 로드된 전략들 중에서 요청된 이름의 전략을 찾아 반환합니다.
   * - 전략 실행 시 필요한 전략 인스턴스를 제공합니다.
   *
   * 매개변수:
   * @param name - 찾고자 하는 전략의 이름
   *
   * 반환값:
   * @returns {TradingStrategy} - 요청된 전략의 인스턴스
   *
   * 예외:
   * @throws Error - 요청된 이름의 전략이 존재하지 않을 경우
   *
   * 사용 예:
   * const macdStrategy = strategyLoader.getStrategy('MACD');
   */
  getStrategy(name: string): TradingStrategy {
    const strategy = this.strategies[name];
    if (!strategy) {
      throw new Error(`Strategy ${name} not found`);
    }
    return strategy;
  }

  /**
   * 현재 로드된 모든 전략의 이름 목록을 반환하는 메서드
   *
   * 역할/기능:
   * - 시스템에 등록된 모든 전략의 이름을 배열로 반환합니다.
   * - 사용 가능한 전략 목록 조회에 활용됩니다.
   *
   * 매개변수: 없음
   *
   * 반환값:
   * @returns {string[]} - 등록된 모든 전략의 이름 배열
   *
   * 사용 예:
   * const availableStrategies = strategyLoader.getAllStrategies();
   * console.log('Available strategies:', availableStrategies);
   */
  getAllStrategies(): string[] {
    return Object.keys(this.strategies);
  }
}
