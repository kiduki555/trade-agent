import { TradingStrategy, TradeSignal, MarketData } from '../interfaces/trading-strategy.interface';
import { Logger } from '@nestjs/common';

export class RsiMacdStrategy implements TradingStrategy {
  name = 'rsi_macd';
  private readonly logger = new Logger(RsiMacdStrategy.name);

  execute(data: MarketData, params: Record<string, any>): TradeSignal {
    this.logger.log(`Executing RSI+MACD Strategy with params: ${JSON.stringify(params)}`);
    const { rsi, macd } = this.calculateIndicators(data);

    if (rsi < 30 && macd > 0) return 'long';
    if (rsi > 70 && macd < 0) return 'short';
    return 'null';
  }

  private calculateIndicators(data: MarketData) {
    console.log(data);
    return { rsi: 25, macd: 0.5 };
  }
}
