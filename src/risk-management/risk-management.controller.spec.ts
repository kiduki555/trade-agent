import { Test, TestingModule } from '@nestjs/testing';
import { RiskManagementController } from './risk-management.controller';

describe('RiskManagementController', () => {
  let controller: RiskManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiskManagementController],
    }).compile();

    controller = module.get<RiskManagementController>(RiskManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
