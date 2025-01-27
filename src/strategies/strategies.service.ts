// StrategiesService: Core 모듈이 호출하여 전략을 실행하는 서비스

import { Injectable } from '@nestjs/common';
import { StrategyLoader } from './strategy-loader';
import {
  TradeSignal,
  MarketData,
} from './interfaces/trading-strategy.interface';

@Injectable()
export class StrategiesService {
  private strategyLoader: StrategyLoader; // 전략 로더 인스턴스

  constructor() {
    this.strategyLoader = new StrategyLoader(); // 로더 초기화
  }

  // 주어진 전략 이름과 데이터를 사용하여 전략 실행
  executeStrategy(
    name: string,
    data: MarketData,
    params: Record<string, any>,
  ): TradeSignal {
    const strategy = this.strategyLoader.getStrategy(name); // 전략 로드
    return strategy.execute(data, params); // 전략 실행 및 신호 반환
  }
}
