/**
 * 트레이딩 설정 인터페이스
 *
 * 역할/기능:
 * - 트레이딩 시스템 설정에 필요한 모든 파라미터를 정의합니다.
 * - 백테스트, 실시간 트레이딩, 페이퍼 트레이딩에 공통으로 사용됩니다.
 */

import { ApiProperty } from '@nestjs/swagger';
import { StrategyParameters, RiskParameters, MarketData } from '../../backtest/interfaces/backtest.interface';

export class TradingConfig {
  @ApiProperty({
    description: '사용할 전략의 이름',
    example: 'MovingAverageCrossover',
  })
  strategyName!: string;

  @ApiProperty({
    description: '사용할 리스크 관리 규칙의 이름',
    example: 'StopLossRule',
  })
  riskRuleName!: string;

  @ApiProperty({
    description: '초기 투자 금액',
    example: 10000000,
  })
  initialBalance!: number;

  @ApiProperty({
    description: '거래 수수료 비율',
    example: 0.0025,
    required: false,
  })
  feeRate?: number;

  @ApiProperty({
    description: '거래 페어',
    example: 'BTC/USDT',
  })
  tradingPair!: string;

  @ApiProperty({
    description: '거래소 이름',
    example: 'Binance',
  })
  exchange!: string;

  @ApiProperty({
    description: '전략 파라미터',
    type: 'object',
    additionalProperties: true,
  })
  strategyParameters!: StrategyParameters;

  @ApiProperty({
    description: '리스크 관리 파라미터',
    type: 'object',
    additionalProperties: true,
  })
  riskParameters!: RiskParameters;

  @ApiProperty({
    description: '거래 시간 간격',
    example: '1h',
  })
  timeframe!: string;
}

export interface BacktestConfig extends TradingConfig {
  startDate: Date;
  endDate: Date;
  data: MarketData[];
  fees: number;
  riskPercent: number;
}
