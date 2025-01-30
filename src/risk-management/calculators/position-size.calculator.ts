/**
 * 포지션 크기 계산기
 *
 * 역할/기능:
 * - 설정된 리스크 비율을 기반으로 포지션 크기를 계산합니다.
 * - 계좌 잔고와 리스크 비율을 고려하여 적절한 포지션 크기를 결정합니다.
 * - 진입가와 손절가 차이를 기반으로 리스크 금액을 계산합니다.
 */

import { RiskManagementStrategy, RiskParameters, RiskResult } from '../interfaces/risk.interface';
import { TradeSignal } from '../../backtest/interfaces/backtest.interface';
import { Logger } from '@nestjs/common';

export class PositionSizeCalculator implements RiskManagementStrategy {
  private readonly logger = new Logger(PositionSizeCalculator.name);

  /**
   * 포지션 크기를 계산합니다.
   *
   * @param signal - 매매 신호 (long/short)
   * @param balance - 현재 계좌 잔고
   * @param params - 리스크 계산 파라미터
   * @returns RiskResult - 리스크 계산 결과
   */
  execute(signal: TradeSignal, balance: number, params: RiskParameters): RiskResult {
    this.logger.log(`Calculating position size with params: ${JSON.stringify(params)}`);

    const { riskPercent, entryPrice, stopLossPrice } = params;
    const riskAmount = (balance * riskPercent) / 100;

    // 진입가와 손절가 차이 계산
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
