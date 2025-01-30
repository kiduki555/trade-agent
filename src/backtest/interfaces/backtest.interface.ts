/**
 * 백테스트 관련 인터페이스 정의
 *
 * 역할/기능:
 * - 백테스트에 필요한 모든 타입과 인터페이스를 정의합니다.
 * - 백테스트 설정, 결과, 거래 기록 등의 구조를 명시합니다.
 */

export interface BacktestConfig {
  initialBalance: number;
  startDate: Date;
  endDate: Date;
  data: MarketData[];
  strategyParams: Record<string, any>;
  riskPercent: number;
  fees?: {
    maker: number;
    taker: number;
  };
}

export interface Position {
  type: 'long' | 'short';
  entryPrice: number;
  size: number;
  stopLoss: number;
  takeProfit: number;
  openTime: Date;
}

export interface Trade {
  type: 'OPEN' | 'CLOSE';
  position: Position;
  price: number;
  time: Date;
  pnl?: number;
}

export interface BacktestResult {
  trades: Trade[];
  metrics: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
    initialBalance: number;
    finalBalance: number;
    totalReturn: number;
  };
}
