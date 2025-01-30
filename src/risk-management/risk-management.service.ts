/**
 * 리스크 관리 서비스
 *
 * 역할/기능:
 * - 리스크 관리 전략을 로드하고 실행합니다.
 * - 트레이딩 시스템에 리스크 관리 기능을 제공합니다.
 * - 포지션 크기, 손절가, 목표가 등을 계산합니다.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RiskDocument } from './schemas/risk.schema';
import { RiskLoader } from './risk-loader';
import { TradeSignal, RiskParams, RiskResult } from './interfaces/risk.interface';

@Injectable()
export class RiskManagementService {
  private readonly riskLoader: RiskLoader;

  constructor(@InjectModel('Risk') private readonly riskModel: Model<RiskDocument>) {
    this.riskLoader = new RiskLoader(this.riskModel);
  }

  /**
   * 지정된 리스크 관리 전략을 사용하여 리스크를 계산합니다.
   *
   * @param ruleName - 사용할 리스크 관리 전략의 이름
   * @param signal - 매매 신호 ('long' | 'short')
   * @param balance - 계좌 잔고
   * @param params - 리스크 계산에 필요한 파라미터
   * @returns RiskResult - 계산된 리스크 관리 결과
   */
  calculateRisk(ruleName: string, signal: TradeSignal, balance: number, params: RiskParams): RiskResult {
    const rule = this.riskLoader.getRiskRule(ruleName);
    return rule.calculate(signal, balance, params) as RiskResult;
  }

  /**
   * 사용 가능한 모든 리스크 관리 전략의 이름을 반환합니다.
   *
   * @returns string[] - 리스크 관리 전략 이름 목록
   */
  getAvailableRiskRules(): string[] {
    return this.riskLoader.getAllRiskRules();
  }
}
