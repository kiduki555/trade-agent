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

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StrategiesService } from '../strategies/strategies.service';
import { RiskManagementService } from '../risk-management/risk-management.service';
import {
  BacktestConfig,
  BacktestResult,
  Trade,
  Position,
  MarketData,
  TradeSignal,
  RiskParameters,
  RiskResult,
} from './interfaces/backtest.interface';
import { BacktestDocument } from './schemas/backtest.schema';

@Injectable()
export class BacktestService {
  private readonly logger = new Logger(BacktestService.name);

  constructor(
    @InjectModel('Backtest') private readonly backtestModel: Model<BacktestDocument>,
    private readonly strategiesService: StrategiesService,
    private readonly riskManagementService: RiskManagementService,
  ) {}

  /**
   * 특정 기간의 백테스트 결과를 조회합니다.
   *
   * @param startDate - 조회 시작일
   * @param endDate - 조회 종료일
   * @returns Promise<BacktestResult[]> - 백테스트 결과 목록
   */
  async getBacktestResults(startDate: Date, endDate: Date): Promise<BacktestResult[]> {
    this.logger.debug(`Fetching backtest results from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const results = await this.backtestModel
      .find({
        executedAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ executedAt: -1 })
      .lean()
      .exec();

    return results as BacktestResult[];
  }

  /**
   * 특정 ID의 백테스트 결과를 조회합니다.
   *
   * @param id - 백테스트 ID
   * @returns Promise<BacktestResult | null> - 백테스트 결과
   */
  async getBacktestResult(id: string): Promise<BacktestResult | null> {
    this.logger.debug(`Fetching backtest result with ID: ${id}`);
    const result = await this.backtestModel.findById(id).lean().exec();
    return result as BacktestResult | null;
  }

  /**
   * 백테스트를 실행하는 메서드
   *
   * @param config - 백테스트 설정 (기간, 초기 자본, 수수료 등)
   * @param strategyName - 사용할 전략 이름
   * @param riskRuleName - 사용할 리스크 관리 규칙 이름
   * @returns Promise<BacktestResult> - 백테스트 결과
   * @throws Error - 설정이 유효하지 않거나 전략/리스크 규칙을 찾을 수 없는 경우
   */
  async runBacktest(config: BacktestConfig, strategyName: string, riskRuleName: string): Promise<BacktestResult> {
    this.logger.log(`Starting backtest for strategy: ${strategyName} with risk rule: ${riskRuleName}`);

    const { initialBalance, data, fees, strategyParams, riskParams } = config;
    let balance = initialBalance;
    const trades: Trade[] = [];
    let position: Position | null = null;

    for (const candle of data) {
      const signal = await this.strategiesService.executeStrategy(strategyName, candle, strategyParams);

      if ((signal === 'long' || signal === 'short') && !position) {
        const riskResult = await this.riskManagementService.executeRiskStrategy(riskRuleName, signal, balance, {
          ...riskParams,
          entryPrice: candle.price,
        } as RiskParameters);

        position = this.openPosition(signal, riskResult, candle);
        trades.push(this.createTradeRecord(position, 'OPEN'));
      }

      if (position && this.shouldClosePosition(position, candle)) {
        const closeResult = this.closePosition(position, candle, fees, balance);
        balance = closeResult.newBalance;
        position = this.updateAndClosePosition(position, candle, balance);
        trades.push(this.createTradeRecord(position, 'CLOSE'));
        position = null;
      }
    }

    // 남은 포지션 강제 청산
    if (position) {
      const lastCandle = data[data.length - 1];
      const closeResult = this.closePosition(position, lastCandle, fees, balance);
      balance = closeResult.newBalance;
      position = this.updateAndClosePosition(position, lastCandle, balance);
      trades.push(this.createTradeRecord(position, 'CLOSE'));
    }

    const result = this.calculateBacktestResult(trades, initialBalance, balance);
    await this.saveBacktestResult(result);

    return result;
  }

  /**
   * 새로운 포지션을 생성합니다.
   *
   * @param signal - 매매 신호 (long/short)
   * @param riskResult - 리스크 계산 결과
   * @param candle - 현재 캔들 데이터
   * @returns Position - 생성된 포지션 객체
   */
  private openPosition(signal: TradeSignal, riskResult: RiskResult, candle: MarketData): Position {
    return {
      type: signal,
      entryPrice: candle.price,
      size: riskResult.positionSize,
      stopLoss: riskResult.stopLoss,
      takeProfit: riskResult.takeProfit,
      entryTime: candle.timestamp,
      entryBalance: riskResult.riskAmount,
      status: 'OPEN',
    };
  }

  /**
   * 포지션 청산 조건을 확인합니다.
   *
   * @param position - 현재 포지션
   * @param candle - 현재 캔들 데이터
   * @returns boolean - 청산해야 하는지 여부
   */
  private shouldClosePosition(position: Position, candle: MarketData): boolean {
    const currentPrice = candle.price;

    if (position.type === 'long') {
      return currentPrice <= position.stopLoss || currentPrice >= position.takeProfit;
    } else {
      return currentPrice >= position.stopLoss || currentPrice <= position.takeProfit;
    }
  }

  /**
   * 포지션을 청산하고 결과를 계산합니다.
   *
   * @param position - 청산할 포지션
   * @param candle - 현재 캔들 데이터
   * @param feeRate - 거래 수수료율
   * @param currentBalance - 현재 계좌 잔고
   * @returns { newBalance: number } - 업데이트된 계좌 잔고
   */
  private closePosition(position: Position, candle: MarketData, feeRate: number, currentBalance: number): { newBalance: number } {
    const exitPrice = candle.price;
    const fee = feeRate * position.size * (position.entryPrice + exitPrice);
    const pnl =
      position.type === 'long' ? (exitPrice - position.entryPrice) * position.size : (position.entryPrice - exitPrice) * position.size;

    return { newBalance: currentBalance + pnl - fee };
  }

  /**
   * 포지션 상태를 업데이트하고 청산합니다.
   */
  private updateAndClosePosition(position: Position, candle: MarketData, balance: number): Position {
    return {
      ...position,
      status: 'CLOSED',
      exitPrice: candle.price,
      exitTime: candle.timestamp,
      exitBalance: balance,
    };
  }

  /**
   * 거래 기록을 생성합니다.
   */
  private createTradeRecord(position: Position, type: 'OPEN' | 'CLOSE'): Trade {
    return {
      type: position.type,
      action: type,
      price: type === 'OPEN' ? position.entryPrice : (position.exitPrice ?? position.entryPrice),
      size: position.size,
      timestamp: type === 'OPEN' ? position.entryTime : (position.exitTime ?? position.entryTime),
      balance: type === 'OPEN' ? position.entryBalance : (position.exitBalance ?? position.entryBalance),
      pnl: type === 'CLOSE' ? (position.pnl ?? 0) : 0,
    };
  }

  /**
   * 백테스트 결과를 계산합니다.
   */
  private calculateBacktestResult(trades: Trade[], initialBalance: number, finalBalance: number): BacktestResult {
    const totalReturn = ((finalBalance - initialBalance) / initialBalance) * 100;
    const totalTrades = trades.length / 2;
    const winningTrades = trades.filter((t) => t.action === 'CLOSE' && t.pnl > 0).length;
    const winRate = (winningTrades / totalTrades) * 100;

    return {
      trades,
      totalTrades,
      winningTrades,
      winRate,
      initialBalance,
      finalBalance,
      totalReturn,
      maxDrawdown: this.calculateMaxDrawdown(trades),
      executedAt: new Date(),
    };
  }

  /**
   * 최대 낙폭(MDD)을 계산합니다.
   */
  private calculateMaxDrawdown(trades: Trade[]): number {
    let peak = -Infinity;
    let mdd = 0;

    trades.forEach((trade) => {
      if (trade.balance > peak) {
        peak = trade.balance;
      }
      const drawdown = ((peak - trade.balance) / peak) * 100;
      mdd = Math.max(mdd, drawdown);
    });

    return mdd;
  }

  /**
   * 백테스트 결과를 저장합니다.
   */
  private async saveBacktestResult(result: BacktestResult): Promise<void> {
    try {
      const backtestResult = (await this.backtestModel.create(result)) as BacktestDocument;
      this.logger.debug('Saved backtest result with ID: ' + backtestResult.id);
    } catch (error) {
      this.logger.error('Failed to save backtest result', error);
      throw error;
    }
  }
}
