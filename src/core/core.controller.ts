/**
 * 코어 컨트롤러
 *
 * 역할/기능:
 * - 시스템 상태 조회 및 관리를 위한 API 엔드포인트를 제공합니다.
 * - 트레이딩 설정 및 실행을 위한 인터페이스를 제공합니다.
 * - 시스템 모니터링 및 제어 기능을 제공합니다.
 */

import { Controller, Get, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoreService } from './core.service';
import { TradingConfig } from './interfaces/trading-config.interface';

@ApiTags('core')
@Controller('core')
export class CoreController {
  private readonly logger = new Logger(CoreController.name);

  constructor(private readonly coreService: CoreService) {}

  @ApiOperation({ summary: '시스템 상태 조회', description: '현재 시스템의 상태 정보를 반환합니다.' })
  @ApiResponse({ status: 200, description: '시스템 상태 정보' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Get('status')
  async getSystemStatus() {
    try {
      return await this.coreService.getSystemStatus();
    } catch (error) {
      this.logger.error('Failed to fetch system status', error);
      throw new HttpException('Failed to fetch system status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: '페이퍼 트레이딩 시작', description: '설정된 전략으로 페이퍼 트레이딩을 시작합니다.' })
  @ApiResponse({ status: 201, description: '트레이딩 시작 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @Post('paper-trading/start')
  async startPaperTrading(@Body() config: TradingConfig) {
    try {
      return await this.coreService.startPaperTrading(config);
    } catch (error) {
      this.logger.error('Failed to start paper trading', error);
      throw new HttpException(error instanceof Error ? error.message : 'Failed to start paper trading', HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: '페이퍼 트레이딩 중지', description: '현재 실행 중인 페이퍼 트레이딩을 중지합니다.' })
  @ApiResponse({ status: 201, description: '트레이딩 중지 성공' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Post('paper-trading/stop')
  async stopPaperTrading() {
    try {
      return await this.coreService.stopPaperTrading();
    } catch (error) {
      this.logger.error('Failed to stop paper trading', error);
      throw new HttpException('Failed to stop paper trading', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: '시스템 성능 지표 조회', description: '시스템의 성능 지표를 반환합니다.' })
  @ApiResponse({ status: 200, description: '시스템 성능 정보' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Get('performance')
  async getSystemPerformance() {
    try {
      return await this.coreService.getSystemPerformance();
    } catch (error) {
      this.logger.error('Failed to fetch system performance', error);
      throw new HttpException('Failed to fetch system performance', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
