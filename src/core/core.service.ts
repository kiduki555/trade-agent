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

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemState, SystemStatus } from './schemas/system-state.schema';
import { BacktestService } from '../backtest/backtest.service';
import { RiskManagementService } from '../risk-management/risk-management.service';
import { StrategiesService } from '../strategies/strategies.service';
import { BacktestConfig, BacktestResult } from '../backtest/interfaces/backtest.interface';
import { SavedBacktestResult } from './interfaces/backtest-result.interface';
import { TradingConfig } from './interfaces/trading-config.interface';

@Injectable()
export class CoreService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CoreService.name);
  private systemCheckInterval: NodeJS.Timeout;

  constructor(
    @InjectModel(SystemState.name) private readonly systemStateModel: Model<SystemState>,
    private readonly backtestService: BacktestService,
    private readonly riskManagementService: RiskManagementService,
    private readonly strategiesService: StrategiesService,
  ) {}

  async onModuleInit() {
    await this.initializeSystemState();
    this.startSystemMonitoring();
  }

  onModuleDestroy() {
    if (this.systemCheckInterval) {
      clearInterval(this.systemCheckInterval);
    }
  }

  /**
   * 시스템 상태 초기화
   */
  private async initializeSystemState(): Promise<void> {
    try {
      const initialState = new this.systemStateModel({
        status: 'IDLE' as SystemStatus,
        activeProcesses: {
          backtests: 0,
          paperTrading: 0,
          simulation: 0,
        },
        resourceUsage: {
          cpuUsage: 0,
          memoryUsage: 0,
          lastUpdate: new Date(),
        },
        activeStrategies: [],
        performance: {
          avgResponseTime: 0,
          requestCount: 0,
          errorRate: 0,
        },
      });

      await initialState.save();
      this.logger.log('System state initialized');
    } catch (error) {
      this.logger.error('Failed to initialize system state', error);
      throw error;
    }
  }

  /**
   * 시스템 모니터링 시작
   */
  private startSystemMonitoring(): void {
    this.systemCheckInterval = setInterval(() => {
      void this.updateSystemState();
    }, 60000); // 1분마다 상태 업데이트
  }

  /**
   * 시스템 상태 업데이트
   */
  private async updateSystemState(): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      await this.systemStateModel.updateOne(
        {},
        {
          $set: {
            resourceUsage: {
              cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000,
              memoryUsage: memoryUsage.heapUsed / 1024 / 1024,
              lastUpdate: new Date(),
            },
          },
        },
      );
    } catch (error) {
      this.logger.error('Failed to update system state', error);
    }
  }

  /**
   * 현재 시스템 상태 조회
   */
  async getSystemStatus(): Promise<SystemState> {
    try {
      const status = await this.systemStateModel.findOne().exec();
      if (!status) {
        throw new Error('System state not found');
      }
      return status;
    } catch (error) {
      this.logger.error('Failed to get system status', error);
      throw error;
    }
  }

  /**
   * 시스템 성능 지표 조회
   */
  async getSystemPerformance() {
    try {
      const status = await this.getSystemStatus();
      return status.performance;
    } catch (error) {
      this.logger.error('Failed to get system performance', error);
      throw error;
    }
  }

  /**
   * 백테스트 실행을 위한 메서드
   *
   * @param config - 백테스트 설정
   * @returns Promise<BacktestResult> - 백테스트 결과
   * @throws Error - 설정이 유효하지 않거나 전략/리스크 규칙을 찾을 수 없는 경우
   */
  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    try {
      const startTime = Date.now();
      this.logger.log('Starting backtest execution');

      // 1. 설정 유효성 검증
      await this.validateBacktestConfig(config);

      // 2. 전략과 리스크 관리 규칙 유효성 검증
      await this.validateStrategy(config.strategyName);
      await this.validateRiskRule(config.riskRuleName);

      // 3. 백테스트 실행
      const result = await this.backtestService.runBacktest(config, config.strategyName, config.riskRuleName);

      // 4. 결과 저장 및 분석
      const executionTime = Date.now() - startTime;
      await this.saveBacktestResult(result, config, executionTime);

      this.logger.log(`Backtest completed for strategy: ${config.strategyName}`);
      return {
        ...result,
        strategyName: config.strategyName,
        riskRuleName: config.riskRuleName,
      };
    } catch (error) {
      this.handleError('Backtest execution failed', error as Error);
      throw error;
    }
  }

  /**
   * 백테스트 설정 유효성 검증
   */
  private async validateBacktestConfig(config: BacktestConfig): Promise<void> {
    if (!config.data || config.data.length === 0) {
      throw new Error('Backtest data is required');
    }

    if (config.initialBalance <= 0) {
      throw new Error('Initial balance must be greater than 0');
    }

    if (config.riskPercent <= 0 || config.riskPercent > 100) {
      throw new Error('Risk percent must be between 0 and 100');
    }

    if (config.startDate >= config.endDate) {
      throw new Error('Start date must be before end date');
    }

    await Promise.resolve(); // 비동기 검증을 위한 더미 프로미스
  }

  /**
   * 전략 유효성 검증
   */
  private async validateStrategy(strategyName: string): Promise<void> {
    const strategies = await this.strategiesService.getAvailableStrategies();
    if (!strategies.includes(strategyName)) {
      throw new Error(`Strategy ${strategyName} not found`);
    }
  }

  /**
   * 리스크 관리 규칙 유효성 검증
   */
  private async validateRiskRule(riskRuleName: string): Promise<void> {
    const riskRules = await this.riskManagementService.getAvailableRiskStrategies();
    if (!riskRules.includes(riskRuleName)) {
      throw new Error(`Risk rule ${riskRuleName} not found`);
    }
  }

  /**
   * 백테스트 결과 저장
   */
  private async saveBacktestResult(result: BacktestResult, config: BacktestConfig, executionTime: number): Promise<SavedBacktestResult> {
    const savedResult: SavedBacktestResult = {
      ...result,
      id: this.generateBacktestId(),
      strategyName: config.strategyName,
      riskRuleName: config.riskRuleName,
      executedAt: new Date(),
      config,
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        executionTime,
      },
    };

    await this.persistBacktestResult(savedResult);
    return savedResult;
  }

  /**
   * 백테스트 ID 생성
   */
  private generateBacktestId(): string {
    return `BT_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 백테스트 결과 DB 저장
   */
  private async persistBacktestResult(result: SavedBacktestResult): Promise<void> {
    try {
      // TODO: MongoDB나 다른 DB에 저장하는 로직 구현
      this.logger.debug(`Saving backtest result: ${result.id}`);
      await Promise.resolve(); // 비동기 저장을 위한 더미 프로미스
    } catch (error) {
      this.logger.error('Failed to save backtest result', error);
      throw error;
    }
  }

  /**
   * 에러 처리
   */
  private handleError(message: string, error: Error): void {
    this.logger.error(message, error?.stack);
    // TODO: 에러 모니터링 시스템 연동
  }

  /**
   * 페이퍼 트레이딩 실행
   */
  async startPaperTrading(config: TradingConfig): Promise<void> {
    try {
      await this.validateTradingConfig(config);
      await this.updateSystemState();

      this.logger.log('Starting paper trading');
      // TODO: 페이퍼 트레이딩 로직 구현
      await Promise.resolve(); // 비동기 실행을 위한 더미 프로미스
    } catch (error) {
      this.logger.error('Failed to start paper trading', error);
      throw error;
    }
  }

  /**
   * 페이퍼 트레이딩 중지
   */
  async stopPaperTrading(): Promise<void> {
    try {
      this.logger.log('Stopping paper trading');
      // TODO: 페이퍼 트레이딩 중지 로직 구현
      await Promise.resolve(); // 비동기 실행을 위한 더미 프로미스
    } catch (error) {
      this.logger.error('Failed to stop paper trading', error);
      throw error;
    }
  }

  /**
   * 트레이딩 설정 유효성 검증
   */
  private async validateTradingConfig(config: TradingConfig): Promise<void> {
    if (!config.strategyName || !config.riskRuleName) {
      throw new Error('Strategy and risk rule names are required');
    }

    await this.validateStrategy(config.strategyName);
    await this.validateRiskRule(config.riskRuleName);

    if (config.initialBalance <= 0) {
      throw new Error('Initial balance must be greater than 0');
    }
  }
}
