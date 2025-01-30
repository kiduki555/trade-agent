/**
 * 고정 비율 리스크 관리 전략
 *
 * 역할/기능:
 * - 계좌 잔고의 일정 비율을 리스크로 설정합니다.
 * - 설정된 리스크 비율과 진입가, 손절가를 기반으로 포지션 크기를 계산합니다.
 * - 리스크 대비 수익 비율을 계산하여 포지션의 목표가를 설정합니다.
 */

import { RiskManagementStrategy, RiskParameters, RiskResult } from '../interfaces/risk.interface';
import { TradeSignal } from '../../backtest/interfaces/backtest.interface';
import { Logger } from '@nestjs/common';

export class FixedPercentRiskStrategy implements RiskManagementStrategy {
  private readonly logger = new Logger(FixedPercentRiskStrategy.name);

  /**
   * 고정 비율 리스크 전략을 실행합니다.
   *
   * @param signal - 매매 신호 (long/short)
   * @param balance - 현재 계좌 잔고
   * @param params - 리스크 계산 파라미터
   * @returns RiskResult - 리스크 계산 결과
   */
  execute(signal: TradeSignal, balance: number, params: RiskParameters): RiskResult {
    this.logger.log(`Executing Fixed Percent Risk Strategy with params: ${JSON.stringify(params)}`);

    const { riskPercent, entryPrice, stopLossPrice } = params;
    const riskAmount = (balance * riskPercent) / 100;

    // 손실 금액 기준으로 포지션 크기 계산
    const priceDiff = Math.abs(entryPrice - stopLossPrice);
    const positionSize = riskAmount / priceDiff;

    // 목표가 계산 (리스크:리워드 = 1:2)
    const riskRewardRatio = 2;
    const takeProfit = signal === 'long' ? entryPrice + priceDiff * riskRewardRatio : entryPrice - priceDiff * riskRewardRatio;

    return {
      positionSize,
      stopLoss: stopLossPrice,
      takeProfit,
      riskAmount,
      riskPercent,
      riskRewardRatio,
    };
  }
}
