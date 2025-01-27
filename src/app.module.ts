import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StrategiesModule } from './strategies/strategies.module';
import { RiskManagementModule } from './risk-management/risk-management.module';
import { BacktestModule } from './backtest/backtest.module';
import { SimulationModule } from './simulation/simulation.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [StrategiesModule, RiskManagementModule, BacktestModule, SimulationModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
