/**
 * 백테스트 관련 인터페이스 정의
 *
 * 역할/기능:
 * - 백테스트에 필요한 모든 타입과 인터페이스를 정의합니다.
 * - 백테스트 설정, 결과, 거래 기록 등의 구조를 명시합니다.
 */

import { Document } from 'mongoose';

export type TradeSignal = 'long' | 'short' | 'none';

export interface MarketData {
  timestamp: Date;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

export interface StrategyParameters {
  stopLossPercent: number;
  takeProfitPercent?: number;
  timeframe?: string;
  [key: string]: number | string | boolean | undefined;
}

export interface RiskParameters {
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  [key: string]: number | string | boolean;
}

export interface BacktestConfig {
  initialBalance: number;
  startDate: Date;
  endDate: Date;
  data: MarketData[];
  strategyName: string;
  riskRuleName: string;
  strategyParams: StrategyParameters;
  riskParams: RiskParameters;
  riskPercent: number;
  fees: number;
}

export interface Position {
  type: TradeSignal;
  entryPrice: number;
  exitPrice?: number;
  size: number;
  stopLoss: number;
  takeProfit: number;
  entryTime: Date;
  exitTime?: Date;
  entryBalance: number;
  exitBalance?: number;
  status: 'OPEN' | 'CLOSED';
  pnl?: number;
}

export interface Trade {
  type: TradeSignal;
  action: 'OPEN' | 'CLOSE';
  price: number;
  size: number;
  timestamp: Date;
  balance: number;
  pnl: number;
}

export interface RiskResult {
  positionSize: number;
  stopLoss: number;
  takeProfit: number;
  riskAmount: number;
  riskPercent: number;
  riskRewardRatio: number;
}

export interface BacktestResult {
  initialBalance: number;
  finalBalance: number;
  totalReturn: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  maxDrawdown: number;
  trades: Trade[];
  executedAt: Date;
  strategyName?: string;
  riskRuleName?: string;
}

export interface BacktestDocument extends BacktestResult, Document {}
