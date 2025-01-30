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
