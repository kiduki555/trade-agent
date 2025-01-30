/**
 * 리스크 관리 전략 스키마
 *
 * 역할/기능:
 * - 리스크 관리 전략의 메타데이터를 MongoDB에 저장하기 위한 스키마를 정의합니다.
 * - 전략의 이름, 클래스명, 파일 경로, 파라미터 등을 저장합니다.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Risk {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  className: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ type: Object })
  parameters?: Record<string, any>;
}

export type RiskDocument = Risk & Document;
export const RiskSchema = SchemaFactory.createForClass(Risk);
