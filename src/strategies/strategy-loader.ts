/**
 * 트레이딩 전략 로더 모듈
 *
 * 역할/기능:
 * - 데이터베이스에서 전략 정보를 로드하고 관리합니다.
 * - 전략 클래스를 동적으로 로드하고 인스턴스화합니다.
 * - 전략 실행에 필요한 인터페이스를 제공합니다.
 *
 * 주요 기능:
 * 1. 전략 동적 로딩: DB에 저장된 전략 정보를 기반으로 실제 전략 클래스를 동적으로 로드
 * 2. 캐싱: 이미 로드된 전략을 메모리에 캐싱하여 성능 최적화
 * 3. 유효성 검증: 로드된 전략이 필요한 인터페이스를 구현하는지 검증
 */

import { Model } from 'mongoose';
import { StrategyDocument, Strategy, StrategyInstance } from './interfaces/strategy.interface';
import { MarketData, TradeSignal } from '../backtest/interfaces/backtest.interface';
import { NotFoundException, Logger } from '@nestjs/common';

export class StrategyLoader {
  private loadedStrategies: Map<string, Strategy> = new Map();
  private readonly logger = new Logger(StrategyLoader.name);

  constructor(private readonly strategyModel: Model<StrategyDocument>) {}

  /**
   * 전략을 로드하고 반환합니다.
   *
   * 역할/기능:
   * - 요청된 전략을 캐시에서 찾거나 DB에서 로드합니다.
   * - 전략 클래스를 동적으로 로드하고 인스턴스화합니다.
   *
   * @param name - 로드할 전략의 이름
   * @returns Promise<Strategy> - 로드된 전략 객체
   * @throws NotFoundException - 전략을 찾을 수 없는 경우
   * @throws Error - 전략 로드나 인스턴스화 실패 시
   */
  async getStrategy(name: string): Promise<Strategy> {
    if (this.loadedStrategies.has(name)) {
      return this.loadedStrategies.get(name)!;
    }

    const strategyInfo = await this.strategyModel.findOne({ name }).lean();
    if (!strategyInfo) {
      throw new NotFoundException(`Strategy ${name} not found`);
    }

    const StrategyClass = await this.loadStrategyClass(strategyInfo.filePath, strategyInfo.className);
    if (!StrategyClass) {
      throw new Error(`Strategy class ${strategyInfo.className} could not be loaded`);
    }

    const strategyInstance = new StrategyClass();
    if (!this.isValidStrategy(strategyInstance)) {
      throw new Error(`Loaded strategy ${name} does not implement the required interface`);
    }

    const strategy: Strategy = {
      name: strategyInfo.name,
      description: strategyInfo.description,
      parameters: strategyInfo.parameters,
      execute: (data: MarketData, params: Record<string, any>): TradeSignal => {
        return strategyInstance.execute(data, params);
      },
    };

    this.loadedStrategies.set(name, strategy);
    return strategy;
  }

  /**
   * 전략 클래스를 동적으로 로드합니다.
   *
   * 역할/기능:
   * - 파일 경로와 클래스 이름을 기반으로 전략 클래스를 동적으로 임포트합니다.
   * - 로드된 클래스의 유효성을 검증합니다.
   *
   * @param filePath - 전략 클래스 파일 경로
   * @param className - 전략 클래스 이름
   * @returns Promise<(new () => StrategyInstance) | undefined> - 전략 클래스 생성자
   */
  private async loadStrategyClass(filePath: string, className: string): Promise<(new () => StrategyInstance) | undefined> {
    try {
      const module = (await import(filePath)) as Record<string, new () => StrategyInstance>;
      const StrategyClass = module[className] || module.default;

      if (!StrategyClass || typeof StrategyClass !== 'function') {
        throw new Error(`Invalid class definition for ${className}`);
      }

      return StrategyClass;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to load strategy class from ${filePath}: ${errorMessage}`);
      return undefined;
    }
  }

  /**
   * 인스턴스가 전략 인터페이스를 구현하는지 검증합니다.
   *
   * 역할/기능:
   * - 로드된 전략 인스턴스가 필요한 메서드와 속성을 가지고 있는지 확인합니다.
   * - 타입 가드 역할을 수행합니다.
   *
   * @param instance - 검증할 인스턴스
   * @returns boolean - 인스턴스가 전략 인터페이스를 구현하는지 여부
   */
  private isValidStrategy(instance: unknown): instance is StrategyInstance {
    return (
      instance !== null &&
      typeof instance === 'object' &&
      'execute' in instance &&
      typeof (instance as StrategyInstance).execute === 'function'
    );
  }

  /**
   * 현재 로드된 모든 전략의 이름을 반환합니다.
   *
   * 역할/기능:
   * - 메모리에 캐시된 전략 목록을 제공합니다.
   *
   * @returns string[] - 로드된 전략 이름 목록
   */
  getAllStrategies(): string[] {
    return Array.from(this.loadedStrategies.keys());
  }
}
