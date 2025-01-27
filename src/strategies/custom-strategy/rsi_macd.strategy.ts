// RSI + MACD를 활용한 매매 전략
// 특정 조건에서 long 또는 short 신호를 생성합니다.

import {
  TradingStrategy,
  TradeSignal,
  MarketData,
} from '../interfaces/trading-strategy.interface';

export class RsiMacdStrategy implements TradingStrategy {
  name = 'rsi_macd'; // 전략 이름 정의

  // 전략 실행 메서드
  execute(data: MarketData, params: Record<string, any>): TradeSignal {
    console.log(params);
    const { rsi, macd } = this.calculateIndicators(data); // RSI 및 MACD 계산
    if (rsi < 30 && macd > 0) return 'long'; // 매수 신호: RSI < 30, MACD > 0
    if (rsi > 70 && macd < 0) return 'short'; // 매도 신호: RSI > 70, MACD < 0
    return 'null'; // 조건에 맞지 않으면 신호 없음
  }

  // RSI와 MACD를 계산하는 헬퍼 메서드
  private calculateIndicators(data: MarketData) {
    console.log(data);
    // 실제 계산 로직은 생략하고 예제 데이터 반환
    return { rsi: 25, macd: 0.5 };
  }
}
