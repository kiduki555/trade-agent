/**
 * 백테스트 스키마 정의
 *
 * 역할/기능:
 * - 백테스트 결과를 MongoDB에 저장하기 위한 스키마를 정의합니다.
 * - 백테스트 결과의 구조와 타입을 명시합니다.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Trade } from '../interfaces/backtest.interface';

@Schema()
export class BacktestResult extends Document {
  @Prop({ required: true })
  initialBalance: number;

  @Prop({ required: true })
  finalBalance: number;

  @Prop({ required: true })
  totalReturn: number;

  @Prop({ required: true })
  totalTrades: number;

  @Prop({ required: true })
  winningTrades: number;

  @Prop({ required: true })
  winRate: number;

  @Prop({ required: true })
  maxDrawdown: number;

  @Prop({ type: [Object], required: true })
  trades: Trade[];

  @Prop({ required: true })
  executedAt: Date;

  @Prop({ required: true })
  strategyName: string;

  @Prop({ required: true })
  riskRuleName: string;
}

export type BacktestDocument = BacktestResult & Document;
export const BacktestSchema = SchemaFactory.createForClass(BacktestResult);
