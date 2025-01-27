// 전략 로더: 모든 전략을 로드하고 관리하며, 이름을 기반으로 전략을 검색할 수 있습니다.

import { TradingStrategy } from './interfaces/trading-strategy.interface';
import { RsiMacdStrategy } from './custom-strategy/rsi_macd.strategy';

export class StrategyLoader {
  // 등록된 전략을 저장하는 객체 (전략 이름을 키로 사용)
  private strategies: Record<string, TradingStrategy> = {};

  constructor() {
    this.loadStrategies(); // 생성자에서 전략을 로드
  }

  // 모든 전략을 초기화하고 등록하는 메서드
  private loadStrategies() {
    this.strategies['rsi_macd'] = new RsiMacdStrategy(); // RSI + MACD 전략 등록
  }

  // 전략 이름을 기반으로 전략을 반환
  getStrategy(name: string): TradingStrategy {
    const strategy = this.strategies[name]; // 이름으로 전략 검색
    if (!strategy) {
      throw new Error(`Strategy ${name} not found`); // 전략이 없으면 오류 발생
    }
    return strategy; // 전략 반환
  }
}
