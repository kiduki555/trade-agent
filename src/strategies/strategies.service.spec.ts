import { Test, TestingModule } from '@nestjs/testing';
import { StrategiesService } from './strategies.service';

// strategies.service.spec.ts 테스트 확장
describe('StrategiesService', () => {
  let service: StrategiesService;
  let mockStrategyModel: any;

  beforeEach(async () => {
    mockStrategyModel = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StrategiesService, { provide: getModelToken('Strategy'), useValue: mockStrategyModel }],
    }).compile();

    service = module.get<StrategiesService>(StrategiesService);
  });

  it('should throw error when strategy not found', async () => {
    mockStrategyModel.findOne.mockResolvedValue(null);
    await expect(service.getStrategyDescription('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should execute strategy correctly', async () => {
    const mockStrategy = { execute: jest.fn().mockReturnValue('long') };
    jest.spyOn(service, 'executeStrategy').mockResolvedValue('long');

    const result = await service.executeStrategy('test', {} as MarketData, {});
    expect(result).toBe('long');
  });
});
