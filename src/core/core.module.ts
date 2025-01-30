/**
 * 코어 모듈
 *
 * 역할/기능:
 * - 트레이딩 시스템의 핵심 모듈들을 통합합니다.
 * - 시스템 상태 관리 및 모니터링을 담당합니다.
 * - 각 모듈 간의 상호작용을 조정합니다.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BacktestModule } from '../backtest/backtest.module';
import { RiskManagementModule } from '../risk-management/risk-management.module';
import { StrategiesModule } from '../strategies/strategies.module';
import { CoreService } from './core.service';
import { CoreController } from './core.controller';
import { SystemState, SystemStateSchema } from './schemas/system-state.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SystemState.name, schema: SystemStateSchema }]),
    BacktestModule,
    RiskManagementModule,
    StrategiesModule,
  ],
  controllers: [CoreController],
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule {}
