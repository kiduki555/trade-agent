// src/strategies/strategies.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Strategy, StrategySchema } from './schemas/strategy.schema';
import { StrategiesService } from './strategies.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Strategy.name, schema: StrategySchema }])],
  providers: [StrategiesService],
  exports: [StrategiesService],
})
export class StrategiesModule {}
