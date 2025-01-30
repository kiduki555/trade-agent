import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BacktestModule } from './backtest/backtest.module';
import { CoreModule } from './core/core.module';
import { StrategiesModule } from './strategies/strategies.module';
import { RiskManagementModule } from './risk-management/risk-management.module';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost:27017/trading'),
    BacktestModule,
    CoreModule,
    StrategiesModule,
    RiskManagementModule,
    SimulationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
