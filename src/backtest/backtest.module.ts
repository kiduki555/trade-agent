import { Module } from '@nestjs/common';
import { BacktestService } from './backtest.service';
import { BacktestController } from './backtest.controller';
import { StrategiesModule } from '../strategies/strategies.module';
import { RiskManagementModule } from '../risk-management/risk-management.module';

@Module({
  imports: [StrategiesModule, RiskManagementModule],
  providers: [BacktestService],
  controllers: [BacktestController],
  exports: [BacktestService],
})
export class BacktestModule {}
