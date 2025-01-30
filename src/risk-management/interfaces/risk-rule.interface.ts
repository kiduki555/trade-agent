/**
 * 리스크 관리 전략의 기본 인터페이스
 *
 * 역할/기능:
 * - 모든 리스크 관리 전략이 구현해야 하는 기본 구조를 정의합니다.
 * - 전략의 이름, 설명, 계산 메서드를 포함합니다.
 */

export type TradeSignal = 'long' | 'short' | 'none';

export interface RiskRule {
  name: string;
  description: string;
  calculate(signal: TradeSignal, balance: number, params: RiskParams): RiskResult;
}

// 리스크 관리에 필요한 파라미터 타입 정의
export interface RiskParams {
  riskPercent: number; // 계좌에서 리스크로 설정할 비율 (예: 2%)
  entryPrice: number; // 진입 가격
  stopLossPrice: number; // 손절 가격
  takeProfitPrice?: number; // 목표 수익 가격 (선택적)
}

// 리스크 계산 결과 타입
export interface RiskResult {
  positionSize: number; // 포지션 크기
  stopLoss: number; // 스톱로스 가격
  takeProfit: number; // 테이크 프로핏 가격
}
