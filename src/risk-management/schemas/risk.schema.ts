/**
 * 리스크 관리 전략 정보를 저장하는 MongoDB 스키마
 *
 * 역할/기능:
 * - 리스크 관리 전략의 메타데이터와 설정을 DB에 저장하기 위한 구조를 정의합니다.
 * - 전략의 동적 로딩에 필요한 정보를 체계적으로 관리합니다.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RiskParameter } from '../interfaces/risk.interface';

@Schema()
export class Risk {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  className: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ type: Array, required: true })
  parameters: RiskParameter[];
}

export type RiskDocument = Risk & Document;
export const RiskSchema = SchemaFactory.createForClass(Risk);

export interface RiskInfo {
  name: string;
  className: string;
  filePath: string;
  parameters: RiskParameter[];
}
