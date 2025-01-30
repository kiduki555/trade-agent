# 트레이딩 시스템 (Trading System)

## 프로젝트 개요

이 프로젝트는 NestJS 기반의 트레이딩 시스템으로, 백테스팅, 페이퍼 트레이딩, 실시간 트레이딩을 지원하는 종합 트레이딩 플랫폼입니다.

### 핵심 기능

1. **백테스트 엔진**

   - 과거 데이터를 사용한 전략 테스트
   - 상세한 성과 분석 및 리포트 생성
   - 다양한 시장 조건에서의 전략 검증

2. **리스크 관리**

   - 포지션 크기 자동 계산
   - 손절/익절 수준 설정
   - 계좌 리스크 관리

3. **전략 관리**

   - 커스텀 전략 개발 및 등록
   - 동적 전략 로딩
   - 전략 백테스트 및 최적화

4. **시스템 모니터링**
   - 실시간 성능 모니터링
   - 리소스 사용량 추적
   - 오류 로깅 및 알림

## 시스템 아키텍처

### 1. Core 모듈

```1:13:src/core/core.service.ts
/**
 * 코어 서비스
 *
 * 역할/기능:
 * - 트레이딩 시스템의 핵심 로직을 관리합니다.
 * - 시스템 상태를 모니터링하고 업데이트합니다.
 * - 각 모듈 간의 상호작용을 조정합니다.
 *
 * 주요 기능:
 * 1. 백테스트 실행 및 결과 관리
 * 2. 페이퍼 트레이딩 실행
 * 3. 시스템 상태 모니터링
 */
```

핵심 기능:

- 시스템 상태 관리
- 모듈 간 통합 조정
- 전체 시스템 모니터링

### 2. 백테스트 모듈

```1:14:src/backtest/backtest.service.ts
/**
 * 백테스트 서비스
 *
 * 역할/기능:
 * - 트레이딩 전략과 리스크 관리 전략을 결합하여 백테스트를 실행합니다.
 * - 백테스트 결과를 분석하고 성과 지표를 계산합니다.
 * - 백테스트 과정에서 발생하는 모든 거래 기록을 저장합니다.
 *
 * 주요 기능:
 * 1. 백테스트 실행 및 결과 저장
 * 2. 거래 기록 생성 및 관리
 * 3. 성과 지표 계산 (수익률, 승률, MDD 등)
 * 4. 포지션 관리 (진입/청산)
 */
```

주요 기능:

- 전략 백테스팅
- 성과 분석
- 결과 저장 및 관리

### 3. 리스크 관리 모듈

```1:8:src/risk-management/risk-management.service.ts
/**
 * 리스크 관리 서비스
 *
 * 역할/기능:
 * - 리스크 관리 전략의 실행과 관리를 담당합니다.
 * - 리스크 전략 목록 조회 및 상세 정보 제공
 * - 리스크 계산 결과를 반환합니다.
 */
```

핵심 기능:

- 리스크 계산
- 포지션 사이징
- 손절/익절 관리

### 4. 전략 모듈

```1:13:src/strategies/strategies.service.ts
/**
 * 트레이딩 전략 서비스
 *
 * 역할/기능:
 * - 트레이딩 전략의 실행과 관리를 담당합니다.
 * - 전략 목록 조회 및 상세 정보 제공
 * - 전략 실행 결과를 반환합니다.
 *
 * 주요 기능:
 * 1. 전략 실행: 지정된 전략을 시장 데이터와 파라미터로 실행
 * 2. 전략 정보 조회: 사용 가능한 전략 목록과 상세 정보 제공
 * 3. 전략 파라미터 관리: 각 전략의 설정 가능한 파라미터 정보 제공
 */
```

주요 기능:

- 전략 실행
- 전략 관리
- 신호 생성

## 설치 및 실행

### 요구사항

- Node.js v16 이상
- MongoDB v4.4 이상
- TypeScript 4.5 이상

### 설치

```bash
# 저장소 클론
git clone https://github.com/kiduki555/trade-agent.git

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

### 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 모드
npm run build
npm run start:prod
```

## API 엔드포인트

### 백테스트 API

```8:15:src/backtest/backtest.controller.ts
/**
 * 백테스트 컨트롤러
 *
 * 역할/기능:
 * - 백테스트 실행 및 결과 조회를 위한 API 엔드포인트 제공
 * - 백테스트 설정 검증 및 전처리
 * - 백테스트 결과 조회 및 분석 기능 제공
 */
```

### 시뮬레이션 API

```1:35:src/simulation/simulation.controller.ts
import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { TradingConfig } from '../core/interfaces/trading-config.interface';

@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  /**
   * 페이퍼 트레이딩 시작
   * POST /simulation/start
   */
  @Post('start')
  async startSimulation(@Body() config: TradingConfig) {
    // 시뮬레이션 시작 로직 구현 필요
  }

  /**
   * 진행 중인 시뮬레이션 상태 조회
   * GET /simulation/status/:id
   */
  @Get('status/:id')
  async getSimulationStatus(@Param('id') id: string) {
    // 시뮬레이션 상태 조회 로직 구현 필요
  }

  /**
   * 시뮬레이션 중지
   * DELETE /simulation/:id
   */
  @Delete(':id')
  async stopSimulation(@Param('id') id: string) {
    // 시뮬레이션 중지 로직 구현 필요
  }
}
```

## 데이터 구조

### 트레이딩 설정

```1:28:src/core/interfaces/trading-config.interface.ts
/**
 * 트레이딩 설정 인터페이스
 *
 * 역할/기능:
 * - 트레이딩 시스템 설정에 필요한 모든 파라미터를 정의합니다.
 * - 백테스트, 실시간 트레이딩, 페이퍼 트레이딩에 공통으로 사용됩니다.
 */
export interface TradingConfig {
import { MarketData, StrategyParameters, RiskParameters } from '../../backtest/interfaces/backtest.interface';
  riskRuleName: string;
export interface TradingConfig {
  strategyName: string;
  riskRuleName: string;
  initialBalance: number;
  tradingPair: string;
  exchange: string;
  strategyParams: StrategyParameters;
  riskParams: RiskParameters;
  timeframe: string;
}
}
export interface BacktestConfig extends TradingConfig {
  startDate: Date;
  endDate: Date;
  data: MarketData[];
  fees: number;
  riskPercent: number;
}
```

### 백테스트 결과

```1:63:src/backtest/interfaces/backtest.interface.ts
/**
 * 백테스트 관련 인터페이스 정의
 *
 * 역할/기능:
 * - 백테스트에 필요한 모든 타입과 인터페이스를 정의합니다.
 * - 백테스트 설정, 결과, 거래 기록 등의 구조를 명시합니다.
 */

import { Document } from 'mongoose';
  initialBalance: number;
export type TradeSignal = 'long' | 'short' | 'none';
  endDate: Date;
export interface MarketData {
  timestamp: Date;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}
export interface Position {
export interface StrategyParameters {
  stopLossPercent: number;
  takeProfitPercent?: number;
  timeframe?: string;
  [key: string]: number | string | boolean | undefined;
}
}
export interface RiskParameters {
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  [key: string]: number | string | boolean;
}
  pnl?: number;
export interface BacktestConfig {
  initialBalance: number;
  startDate: Date;
  endDate: Date;
  data: MarketData[];
  strategyName: string;
  riskRuleName: string;
  strategyParams: StrategyParameters;
  riskParams: RiskParameters;
  riskPercent: number;
  fees: number;
}
    initialBalance: number;
export interface Position {
  type: TradeSignal;
  entryPrice: number;
  exitPrice?: number;
  size: number;
  stopLoss: number;
  takeProfit: number;
  entryTime: Date;
  exitTime?: Date;
  entryBalance: number;
  exitBalance?: number;
  status: 'OPEN' | 'CLOSED';
  pnl?: number;
}
```

## 테스트

### 단위 테스트

```1:34:src/strategies/strategies.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { StrategiesService } from './strategies.service';

// strategies.service.spec.ts 테스트 확장
describe('StrategiesService', () => {
  let service: StrategiesService;
  let mockStrategyModel: any;
    const module: TestingModule = await Test.createTestingModule({
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
```

### 테스트 실행

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 개발 가이드라인

### 1. 전략 개발

- `src/strategies/custom-strategies` 디렉토리에 새로운 전략 추가
- `TradingStrategy` 인터페이스 구현
- 전략 등록을 위한 메타데이터 제공

### 2. 리스크 관리 규칙 추가

- `src/risk-management/custom-rules` 디렉토리에 새로운 규칙 추가
- `RiskRule` 인터페이스 구현
- 규칙 등록을 위한 메타데이터 제공

### 3. 백테스트 실행

- 적절한 설정 파라미터 제공
- 결과 분석 및 최적화
- 성과 지표 확인
