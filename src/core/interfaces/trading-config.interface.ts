/**
 * 트레이딩 설정 인터페이스
 *
 * 역할/기능:
 * - 트레이딩 시스템 설정에 필요한 모든 파라미터를 정의합니다.
 * - 백테스트, 실시간 트레이딩, 페이퍼 트레이딩에 공통으로 사용됩니다.
 */
export interface TradingConfig {
  strategyName: string;
  riskRuleName: string;
  initialBalance: number;
  tradingPair: string;
  exchange: string;
  strategyParams: Record<string, any>;
  riskParams: {
    riskPercent: number;
    maxDrawdown?: number;
    maxPositions?: number;
  };
  timeframe: string;
}

export interface BacktestConfig extends TradingConfig {
  startDate: Date;
  endDate: Date;
  data: MarketData[];
  fees?: {
    maker: number;
    taker: number;
  };
}
