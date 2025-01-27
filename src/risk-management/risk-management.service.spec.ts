import { Test, TestingModule } from '@nestjs/testing';
import { RiskManagementService } from './risk-management.service';

describe('RiskManagementService', () => {
  let service: RiskManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskManagementService],
    }).compile();

    service = module.get<RiskManagementService>(RiskManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
