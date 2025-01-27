import { Module } from '@nestjs/common';
import { RiskManagementService } from './risk-management.service';
import { RiskManagementController } from './risk-management.controller';

@Module({
  providers: [RiskManagementService],
  controllers: [RiskManagementController]
})
export class RiskManagementModule {}
