/**
 * 고정 비율 리스크 관리 전략
 *
 * 역할/기능:
 * - 계좌 잔고의 일정 비율로 리스크를 설정하여 포지션 크기를 계산합니다.
 * - 설정된 리스크 대비 수익 비율(RR)에 따라 목표가를 설정합니다.
 * - 안정적인 자금 관리를 위한 기본적인 리스크 관리 전략을 제공합니다.
 *
 * 매개변수:
 * @param signal - 매매 신호 ('long' | 'short')
 * @param balance - 계좌 잔고
 * @param params - 리스크 계산에 필요한 파라미터 (riskPercent, entryPrice, stopLossPrice, riskRewardRatio)
 *
 * 반환값:
 * @returns {RiskResult} - 포지션 크기, 손절가, 목표가를 포함한 결과
 *
 * 예외:
 * @throws Error - 잘못된 파라미터가 입력된 경우
 *
 * 사용 예:
 * const riskManager = new FixedPercentRisk();
 * const result = riskManager.calculate('long', 10000, {
 *   riskPercent: 2,
 *   entryPrice: 100,
 *   stopLossPrice: 98,
 *   riskRewardRatio: 2
 * });
 *
 * 주의사항:
 * - riskPercent는 1~3% 사이를 권장합니다.
 * - stopLossPrice는 진입가격과 너무 가깝지 않아야 합니다.
 * - riskRewardRatio는 일반적으로 2 이상을 권장합니다.
 */

import { RiskRule, RiskParams, RiskResult, TradeSignal } from '../interfaces/risk-rule.interface';

export class FixedPercentRisk implements RiskRule {
  name = 'fixed_percent';
  description = '계좌 잔고의 고정 비율로 리스크를 관리하는 전략';

  calculate(signal: TradeSignal, balance: number, params: RiskParams): RiskResult {
    const { riskPercent, entryPrice, stopLossPrice, riskRewardRatio = 2 } = params;

    // 입력값 검증
    if (!riskPercent || !entryPrice || !stopLossPrice) {
      throw new Error('Required parameters are missing');
    }

    if (riskPercent <= 0 || riskPercent > 100) {
      throw new Error('Risk percent must be between 0 and 100');
    }

    // 리스크 금액 계산 (계좌 잔고의 riskPercent%)
    const riskAmount = balance * (riskPercent / 100);

    // 진입가격과 손절가 사이의 차이
    const priceDifference = Math.abs(entryPrice - stopLossPrice);

    if (priceDifference === 0) {
      throw new Error('Entry price cannot be equal to stop loss price');
    }

    // 포지션 크기 계산
    const positionSize = riskAmount / priceDifference;

    // 목표가 계산 (RR ratio 기반)
    const takeProfitDistance = priceDifference * riskRewardRatio;
    const takeProfit = signal === 'long' ? entryPrice + takeProfitDistance : entryPrice - takeProfitDistance;

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
