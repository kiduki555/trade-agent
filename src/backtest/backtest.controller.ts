import { Controller, Post, Body, Get, Param, Query, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { BacktestService } from './backtest.service';
import { StrategiesService } from '../strategies/strategies.service';
import { RiskManagementService } from '../risk-management/risk-management.service';
import { BacktestConfig, BacktestResult } from './interfaces/backtest.interface';
import { RiskDetails } from '../risk-management/interfaces/risk.interface';

/**
 * 백테스트 컨트롤러
 *
 * 역할/기능:
 * - 백테스트 실행 및 결과 조회를 위한 API 엔드포인트 제공
 * - 백테스트 설정 검증 및 전처리
 * - 백테스트 결과 조회 및 분석 기능 제공
 */
@Controller('backtest')
export class BacktestController {
  private readonly logger = new Logger(BacktestController.name);

  constructor(
    private readonly backtestService: BacktestService,
    private readonly strategiesService: StrategiesService,
    private readonly riskManagementService: RiskManagementService,
  ) {}

  /**
   * 백테스트 실행 API
   *
   * 역할/기능:
   * - 주어진 설정으로 백테스트를 실행하고 결과를 반환합니다.
   * - 전략, 리스크 관리 규칙, 기간 등을 설정하여 백테스트를 수행합니다.
   *
   * @endpoint POST /backtest/run
   *
   * @param config - 백테스트 설정
   * @param config.strategyName - 사용할 전략 이름
   * @param config.riskRuleName - 사용할 리스크 관리 규칙 이름
   * @param config.initialBalance - 초기 자본금
   * @param config.startDate - 백테스트 시작 날짜
   * @param config.endDate - 백테스트 종료 날짜
   * @param config.data - 백테스트에 사용할 시장 데이터
   * @param config.strategyParams - 전략 파라미터
   * @param config.riskPercent - 리스크 비율
   * @param config.fees - 거래 수수료
   *
   * @returns BacktestResult - 백테스트 실행 결과
   * @returns result.trades - 백테스트 중 발생한 모든 거래 기록
   * @returns result.metrics - 백테스트 성과 지표 (수익률, 승률 등)
   *
   * @throws BadRequestException - 잘못된 설정값이 입력된 경우
   */
  @Post('run')
  async runBacktest(@Body() config: BacktestConfig): Promise<BacktestResult> {
    try {
      return await this.backtestService.runBacktest(config, config.strategyName, config.riskRuleName);
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  /**
   * 백테스트 결과 목록 조회 API
   *
   * 역할/기능:
   * - 지정된 기간 동안의 백테스트 결과 목록을 반환합니다.
   * - 날짜 기반 필터링을 지원합니다.
   *
   * @endpoint GET /backtest/results
   *
   * @param startDate - 조회 시작 날짜 (YYYY-MM-DD 형식)
   * @param endDate - 조회 종료 날짜 (YYYY-MM-DD 형식)
   *
   * @returns BacktestResult[] - 백테스트 결과 목록
   * @returns results[].executedAt - 백테스트 실행 시간
   * @returns results[].trades - 거래 기록 목록
   * @returns results[].metrics - 성과 지표
   *
   * @throws BadRequestException - 잘못된 날짜 형식이 입력된 경우
   */
  @Get('results')
  async getBacktestResults(@Query('startDate') startDate: string, @Query('endDate') endDate: string): Promise<BacktestResult[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      return await this.backtestService.getBacktestResults(start, end);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch backtest results');
    }
  }

  /**
   * 특정 백테스트 결과 상세 조회 API
   *
   * 역할/기능:
   * - 특정 백테스트의 상세 결과를 반환합니다.
   * - 거래 기록, 성과 지표, 설정값 등 모든 정보를 포함합니다.
   *
   * @endpoint GET /backtest/results/:id
   *
   * @param id - 조회할 백테스트 실행 ID
   *
   * @returns BacktestResult - 백테스트 상세 결과
   * @returns result.initialBalance - 초기 자본금
   * @returns result.finalBalance - 최종 자본금
   * @returns result.totalReturn - 총 수익률
   * @returns result.totalTrades - 총 거래 횟수
   * @returns result.winRate - 승률
   * @returns result.maxDrawdown - 최대 낙폭
   * @returns result.trades - 거래 기록 목록
   *
   * @throws NotFoundException - 해당 ID의 백테스트 결과를 찾을 수 없는 경우
   */
  @Get('results/:id')
  async getBacktestResult(@Param('id') id: string): Promise<BacktestResult> {
    const result = await this.backtestService.getBacktestResult(id);
    if (!result) {
      throw new NotFoundException(`Backtest result with ID ${id} not found`);
    }
    return result;
  }

  /**
   * 사용 가능한 전략 목록 조회 API
   *
   * 역할/기능:
   * - 시스템에 등록된 모든 트레이딩 전략 목록을 반환합니다.
   * - 각 전략의 설명과 필요한 파라미터 정보를 포함합니다.
   *
   * @endpoint GET /backtest/strategies
   *
   * @returns Strategy[] - 사용 가능한 전략 목록
   * @returns strategies[].name - 전략 이름
   * @returns strategies[].description - 전략 설명
   * @returns strategies[].parameters - 필요한 파라미터 정보
   *
   * @throws BadRequestException - 전략 목록 조회 실패 시
   */
  @Get('strategies')
  async getAvailableStrategies() {
    try {
      return await this.strategiesService.getAvailableStrategiesWithDetails();
    } catch {
      throw new BadRequestException('Failed to fetch available strategies');
    }
  }

  /**
   * 사용 가능한 리스크 관리 규칙 목록 조회 API
   *
   * 역할/기능:
   * - 시스템에 등록된 모든 리스크 관리 규칙 목록을 반환합니다.
   * - 각 규칙의 설명과 설정 가능한 파라미터 정보를 포함합니다.
   *
   * @endpoint GET /backtest/risk-rules
   *
   * @returns RiskRule[] - 사용 가능한 리스크 관리 규칙 목록
   * @returns rules[].name - 규칙 이름
   * @returns rules[].description - 규칙 설명
   * @returns rules[].parameters - 설정 가능한 파라미터 정보
   *
   * @throws BadRequestException - 리스크 규칙 목록 조회 실패 시
   */
  @Get('risk-rules')
  async getAvailableRiskRules(): Promise<RiskDetails[]> {
    try {
      return await this.riskManagementService.getAvailableRiskRulesWithDetails();
    } catch (error) {
      this.logger.error(`Failed to fetch available risk rules: ${error}`);
      throw new BadRequestException(`Failed to fetch available risk rules: ${error}`);
    }
  }
}
