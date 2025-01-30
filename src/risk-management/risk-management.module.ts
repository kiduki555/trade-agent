/**
 * 리스크 관리 모듈
 *
 * 역할/기능:
 * - 리스크 관리 관련 컴포넌트들을 하나의 모듈로 구성합니다.
 * - MongoDB 연결과 리스크 관리 서비스를 설정합니다.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RiskManagementService } from './risk-management.service';
import { Risk, RiskSchema } from './schemas/risk.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Risk.name, schema: RiskSchema }])],
  providers: [RiskManagementService],
  exports: [RiskManagementService],
})
export class RiskManagementModule {}
