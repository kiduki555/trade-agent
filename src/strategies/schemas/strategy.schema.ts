// 전략 정보를 MongoDB에 저장하기 위한 스키마 정의
// NestJS와 Mongoose를 함께 사용하여 데이터베이스 작업을 처리합니다.

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// 전략 문서 타입 정의
export type StrategyDocument = Strategy & Document;

@Schema({ timestamps: true }) // 생성 및 업데이트 시간 자동 추가
export class Strategy {
  @Prop({ required: true, unique: true }) // 필수 및 유니크 조건
  name: string; // 전략 이름

  @Prop({ type: Object, required: true }) // 필수 필드
  parameters: Record<string, any>; // 전략 실행 파라미터

  @Prop({ required: true }) // 필수 필드
  description: string; // 전략 설명
}

// Mongoose 스키마 생성
export const StrategySchema = SchemaFactory.createForClass(Strategy);
