import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BacktestService } from './backtest.service';
import { BacktestController } from './backtest.controller';
import { StrategiesModule } from '../strategies/strategies.module';
import { RiskManagementModule } from '../risk-management/risk-management.module';
import { Backtest, BacktestSchema } from './schemas/backtest.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Backtest.name, schema: BacktestSchema }]), StrategiesModule, RiskManagementModule],
  controllers: [BacktestController],
  providers: [BacktestService],
  exports: [BacktestService],
})
export class BacktestModule {}
