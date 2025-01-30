import { BacktestModule } from 'src/backtest/backtest.module';
import { RiskManagementModule } from 'src/risk-management/risk-management.module';
import { SimulationModule } from 'src/simulation/simulation.module';
import { StrategiesModule } from 'src/strategies/strategies.module';
import { CoreService } from './core.service';
import { Module } from '@nestjs/common';

/**
 * 코어 모듈
 *
 * 역할/기능:
 * - 트레이딩 시스템의 핵심 모듈들을 통합합니다.
 * - 전략, 리스크 관리, 백테스트 등의 모듈들을 조율합니다.
 */
@Module({
  imports: [StrategiesModule, RiskManagementModule, BacktestModule, SimulationModule],
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule {}
