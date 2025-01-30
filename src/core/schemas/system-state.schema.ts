/**
 * 시스템 상태 스키마
 *
 * 역할/기능:
 * - 트레이딩 시스템의 현재 상태를 저장합니다.
 * - 실행 중인 프로세스와 리소스 사용량을 추적합니다.
 * - 시스템 에러와 경고를 기록합니다.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemStatus = 'IDLE' | 'RUNNING' | 'ERROR';

@Schema({ timestamps: true })
export class SystemState extends Document {
  @Prop({ required: true })
  status: SystemStatus;

  @Prop({ required: true, type: Object })
  activeProcesses: {
    backtests: number;
    paperTrading: number;
    simulation: number;
  };

  @Prop({ type: Object })
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    lastUpdate: Date;
  };

  @Prop({ type: [String] })
  activeStrategies: string[];

  @Prop({ type: Object })
  systemErrors?: {
    message: string;
    timestamp: Date;
    stack?: string;
  };

  @Prop({ type: Object })
  performance?: {
    avgResponseTime: number;
    requestCount: number;
    errorRate: number;
  };
}

export const SystemStateSchema = SchemaFactory.createForClass(SystemState);
