// 포지션 크기 계산기
// 설정된 리스크 비율을 기반으로 포지션 크기를 계산합니다.

import { RiskRule, RiskParams, RiskResult, TradeSignal } from '../interfaces/risk-rule.interface';

export class PositionSizeCalculator implements RiskRule {
  name = 'position_size';
  description = '설정된 리스크 비율을 기반으로 포지션 크기를 계산하는 전략';

  calculate(signal: TradeSignal, balance: number, params: RiskParams): RiskResult {
    const { riskPercent, entryPrice, stopLossPrice } = params;

    // 리스크 금액 계산 (전체 계좌의 riskPercent% 만큼 위험 감수)
    const riskAmount = balance * (riskPercent / 100);

    // 진입 가격과 스톱로스 가격 차이 계산
    const priceDifference = Math.abs(entryPrice - stopLossPrice);

    // 포지션 크기 계산
    const positionSize = riskAmount / priceDifference;

    return {
      positionSize, // 계산된 포지션 크기
      stopLoss: stopLossPrice, // 설정된 스톱로스 가격
      takeProfit: entryPrice + priceDifference * 2, // 2:1 리스크-리워드 비율
    };
  }
}
