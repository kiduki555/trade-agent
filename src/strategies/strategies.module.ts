// src/strategies/strategies.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Strategy, StrategySchema } from './schemas/strategy.schema';
import { StrategiesController } from './strategies.controller';
import { StrategiesService } from './strategies.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Strategy.name, schema: StrategySchema },
    ]),
  ],
  controllers: [StrategiesController],
  providers: [StrategiesService],
})
export class StrategiesModule {}
