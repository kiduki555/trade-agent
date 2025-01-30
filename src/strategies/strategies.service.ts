/**
 * 트레이딩 전략 서비스
 *
 * 역할/기능:
 * - 트레이딩 전략의 실행과 관리를 담당합니다.
 * - 전략 목록 조회 및 상세 정보 제공
 * - 전략 실행 결과를 반환합니다.
 *
 * 주요 기능:
 * 1. 전략 실행: 지정된 전략을 시장 데이터와 파라미터로 실행
 * 2. 전략 정보 조회: 사용 가능한 전략 목록과 상세 정보 제공
 * 3. 전략 파라미터 관리: 각 전략의 설정 가능한 파라미터 정보 제공
 */

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { StrategyLoader } from './strategy-loader';
import { StrategyDocument, StrategyDetails, StrategyParameter } from './interfaces/strategy.interface';
import { MarketData, TradeSignal } from '../backtest/interfaces/backtest.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StrategiesService {
  private strategyLoader: StrategyLoader;
  private readonly logger = new Logger(StrategiesService.name);

  constructor(@InjectModel('Strategy') private readonly strategyModel: Model<StrategyDocument>) {
    this.strategyLoader = new StrategyLoader(this.strategyModel);
  }

  /**
   * 지정된 전략을 실행하고 매매 신호를 반환합니다.
   *
   * 역할/기능:
   * - 전략을 로드하고 주어진 시장 데이터로 실행합니다.
   * - 전략의 실행 결과(매매 신호)를 반환합니다.
   *
   * @param name - 실행할 전략 이름
   * @param data - 시장 데이터
   * @param params - 전략 파라미터
   * @returns Promise<TradeSignal> - 매매 신호 (long/short/none)
   * @throws Error - 전략이 유효하지 않거나 실행 실패 시
   */
  async executeStrategy(name: string, data: MarketData, params: Record<string, any>): Promise<TradeSignal> {
    const strategy = await this.strategyLoader.getStrategy(name);

    if (typeof strategy.execute !== 'function') {
      throw new Error(`Strategy ${name} does not have a valid execute method`);
    }

    this.logger.log(`Executing strategy: ${name}`);
    return strategy.execute(data, params);
  }

  /**
   * 전략의 설명을 반환합니다.
   *
   * @param name - 전략 이름
   * @returns Promise<string> - 전략 설명
   * @throws NotFoundException - 전략을 찾을 수 없는 경우
   */
  async getStrategyDescription(name: string): Promise<string> {
    const strategy = await this.strategyModel.findOne({ name }).exec();
    if (!strategy) throw new NotFoundException(`Strategy ${name} not found`);
    return strategy.description;
  }

  /**
   * 전략의 파라미터 정보를 반환합니다.
   *
   * @param name - 전략 이름
   * @returns Promise<StrategyParameter[]> - 파라미터 정보 목록
   */
  async getStrategyParameters(name: string): Promise<StrategyParameter[]> {
    const strategy = await this.strategyModel.findOne({ name }).exec();
    return strategy?.parameters ?? [];
  }

  /**
   * 사용 가능한 모든 전략의 이름을 반환합니다.
   *
   * @returns Promise<string[]> - 전략 이름 목록
   */
  async getAvailableStrategies(): Promise<string[]> {
    const strategies = await this.strategyModel.find().exec();
    return strategies.map((strategy) => strategy.name);
  }

  /**
   * 사용 가능한 전략 목록과 상세 정보를 반환합니다.
   *
   * 역할/기능:
   * - 모든 전략의 이름, 설명, 파라미터 정보를 포함한 상세 정보를 제공합니다.
   *
   * @returns Promise<StrategyDetails[]> - 전략 상세 정보 목록
   */
  async getAvailableStrategiesWithDetails(): Promise<StrategyDetails[]> {
    const strategies = await this.getAvailableStrategies();
    return Promise.all(
      strategies.map(async (strategy) => ({
        name: strategy,
        description: await this.getStrategyDescription(strategy),
        parameters: await this.getStrategyParameters(strategy),
      })),
    );
  }
}
