/**
 * 트레이딩 전략 관련 인터페이스 정의
 *
 * 역할/기능:
 * - 트레이딩 전략의 구조와 설정을 정의합니다.
 * - 전략 실행 결과와 파라미터 타입을 명시합니다.
 */

import { Document } from 'mongoose';
import { MarketData, TradeSignal } from '../../backtest/interfaces/backtest.interface';

export interface Strategy {
  name: string;
  description: string;
  parameters: StrategyParameter[];
  execute: (data: MarketData, params: Record<string, any>) => TradeSignal;
}

export interface StrategyInstance {
  execute(data: MarketData, params: Record<string, any>): TradeSignal;
}

export interface StrategyParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  description: string;
  defaultValue?: any;
  required: boolean;
}

export interface StrategyDetails {
  name: string;
  description: string;
  parameters: StrategyParameter[];
}

export interface StrategyInfo {
  name: string;
  description: string;
  className: string;
  filePath: string;
  parameters: StrategyParameter[];
}

export interface StrategyDocument extends StrategyInfo, Document {}
