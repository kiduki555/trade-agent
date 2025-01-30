/**
 * 리스크 관리 서비스
 *
 * 역할/기능:
 * - 리스크 관리 전략의 실행과 관리를 담당합니다.
 * - 리스크 전략 목록 조회 및 상세 정보 제공
 * - 리스크 계산 결과를 반환합니다.
 */

import { Injectable, Logger } from '@nestjs/common';
import { RiskLoader } from './risk-loader';
import { RiskDocument, RiskParameter, RiskResult, RiskParameters } from './interfaces/risk.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TradeSignal } from '../backtest/interfaces/backtest.interface';

interface RiskStrategyDetails {
  name: string;
  parameters: RiskParameter[];
}

@Injectable()
export class RiskManagementService {
  private riskLoader: RiskLoader;
  private readonly logger = new Logger(RiskManagementService.name);

  constructor(@InjectModel('Risk') private readonly riskModel: Model<RiskDocument>) {
    this.riskLoader = new RiskLoader(this.riskModel);
  }

  /**
   * 리스크 관리 전략을 실행하고 결과를 반환합니다.
   *
   * @param name - 실행할 리스크 전략 이름
   * @param signal - 매매 신호 (long/short/none)
   * @param balance - 현재 계좌 잔고
   * @param params - 리스크 계산 파라미터
   * @returns Promise<RiskResult> - 리스크 계산 결과
   */
  async executeRiskStrategy(name: string, signal: TradeSignal, balance: number, params: RiskParameters): Promise<RiskResult> {
    const riskStrategy = await this.riskLoader.getRiskStrategy(name);

    if (typeof riskStrategy.execute !== 'function') {
      throw new Error(`Risk strategy ${name} does not have a valid execute method`);
    }

    this.logger.log(`Executing risk strategy: ${name}`);
    return riskStrategy.execute(signal, balance, params);
  }

  /**
   * 리스크 관리 전략의 파라미터 정보를 반환합니다.
   *
   * @param name - 리스크 전략 이름
   * @returns Promise<RiskParameter[]> - 파라미터 정보 목록
   */
  async getRiskParameters(name: string): Promise<RiskParameter[]> {
    const strategy = await this.riskModel.findOne({ name }).exec();
    return strategy?.parameters ?? [];
  }

  /**
   * 사용 가능한 모든 리스크 관리 전략의 이름을 반환합니다.
   *
   * @returns Promise<string[]> - 리스크 전략 이름 목록
   */
  async getAvailableRiskStrategies(): Promise<string[]> {
    const strategies = await this.riskModel.find().exec();
    return strategies.map((strategy) => strategy.name);
  }

  /**
   * 사용 가능한 리스크 관리 전략 목록과 상세 정보를 반환합니다.
   *
   * @returns Promise<RiskStrategyDetails[]> - 리스크 전략 상세 정보 목록
   */
  async getAvailableRiskStrategiesWithDetails(): Promise<RiskStrategyDetails[]> {
    const strategies = await this.getAvailableRiskStrategies();
    return Promise.all(
      strategies.map(async (strategy) => ({
        name: strategy,
        parameters: await this.getRiskParameters(strategy),
      })),
    );
  }
}
