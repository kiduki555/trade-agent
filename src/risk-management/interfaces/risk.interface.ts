/**
 * 리스크 관리 관련 타입 정의
 *
 * 역할/기능:
 * - 리스크 관리에 필요한 모든 타입을 정의합니다.
 * - 매매 신호, 리스크 파라미터, 계산 결과 등의 타입을 포함합니다.
 */

export type TradeSignal = 'long' | 'short';

export interface RiskParams {
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  riskRewardRatio?: number;
}

export interface RiskResult {
  positionSize: number;
  stopLoss: number;
  takeProfit: number;
  riskAmount: number;
  riskPercent: number;
  riskRewardRatio: number;
}
