// 전략 정보를 MongoDB에 저장하기 위한 스키마 정의
// NestJS와 Mongoose를 함께 사용하여 데이터베이스 작업을 처리합니다.

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { StrategyParameter } from '../interfaces/strategy.interface';

/**
 * 트레이딩 전략 정보를 저장하는 MongoDB 스키마
 *
 * 역할/기능:
 * - 트레이딩 전략의 메타데이터와 설정을 DB에 저장하기 위한 구조를 정의합니다.
 * - 전략의 동적 로딩에 필요한 정보를 체계적으로 관리합니다.
 */
@Schema()
export class Strategy {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  className: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ type: Array, required: true })
  parameters: StrategyParameter[];
}

export type StrategyDocument = Strategy & Document;
export const StrategySchema = SchemaFactory.createForClass(Strategy);
