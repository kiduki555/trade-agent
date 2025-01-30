/**
 * 리스크 관리 관련 인터페이스 정의
 *
 * 역할/기능:
 * - 리스크 관리 전략의 구조와 설정을 정의합니다.
 * - 리스크 계산 결과와 파라미터 타입을 명시합니다.
 */

import { Document } from 'mongoose';
import { TradeSignal } from '../../backtest/interfaces/backtest.interface';

export interface Risk {
  name: string;
  parameters: RiskParameter[];
  execute: (signal: TradeSignal, balance: number, params: RiskParameters) => RiskResult;
}

export interface RiskManagementStrategy {
  execute(signal: TradeSignal, balance: number, params: RiskParameters): RiskResult;
}

export interface RiskParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  description: string;
  defaultValue?: any;
  required: boolean;
}

export interface RiskParameters {
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  [key: string]: number | string | boolean;
}

export interface RiskResult {
  positionSize: number;
  stopLoss: number;
  takeProfit: number;
  riskAmount: number;
  riskPercent: number;
  riskRewardRatio: number;
}

export interface RiskInfo {
  name: string;
  description: string;
  className: string;
  filePath: string;
  parameters: RiskParameter[];
}

export interface RiskDocument extends RiskInfo, Document {}

export interface RiskDetails {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
    defaultValue?: any;
  }[];
}
