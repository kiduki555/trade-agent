// 각 전략이 구현해야 하는 인터페이스를 정의
// 모든 전략은 execute 메서드를 구현해야 하며, 이를 통해 신호를 생성합니다.

export type TradeSignal = 'long' | 'short' | 'null'; // 매매 신호 타입 정의

export interface TradingStrategy {
  name: string; // 전략의 이름
  execute(data: MarketData, params: Record<string, any>): TradeSignal; // 전략 실행 메서드
}

// 시장 데이터를 나타내는 타입
export interface MarketData {
  price: number; // 현재 가격
  volume: number; // 거래량
  [key: string]: any; // 추가 데이터는 동적으로 정의 가능
}
