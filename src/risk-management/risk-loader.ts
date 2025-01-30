/**
 * 리스크 관리 전략 로더 모듈
 *
 * 역할/기능:
 * - 데이터베이스에서 리스크 관리 전략을 로드하고 관리합니다.
 * - 리스크 관리 클래스를 동적으로 로드하고 인스턴스화합니다.
 * - 리스크 계산에 필요한 인터페이스를 제공합니다.
 */

import { Model } from 'mongoose';
import { NotFoundException, Logger } from '@nestjs/common';
import { RiskDocument, RiskInfo } from './schemas/risk.schema';
import { Risk, RiskResult, RiskManagementStrategy, RiskParameters } from './interfaces/risk.interface';
import { TradeSignal } from '../backtest/interfaces/backtest.interface';

export class RiskLoader {
  private loadedRisks: Map<string, Risk> = new Map();
  private readonly logger = new Logger(RiskLoader.name);

  constructor(private readonly riskModel: Model<RiskDocument>) {}

  async getRiskStrategy(name: string): Promise<Risk> {
    if (this.loadedRisks.has(name)) {
      return this.loadedRisks.get(name)!;
    }

    const riskInfo = (await this.riskModel.findOne({ name }).lean()) as RiskInfo;
    if (!riskInfo) {
      throw new NotFoundException(`Risk strategy ${name} not found`);
    }

    const RiskClass = await this.loadRiskClass(riskInfo.filePath, riskInfo.className);
    if (!RiskClass) {
      throw new Error(`Risk class ${riskInfo.className} could not be loaded`);
    }

    const riskInstance = new RiskClass();
    if (!this.isValidRiskStrategy(riskInstance)) {
      throw new Error(`Loaded risk strategy ${name} does not implement the required interface`);
    }

    const risk: Risk = {
      name: riskInfo.name,
      parameters: riskInfo.parameters,
      execute: (signal: TradeSignal, balance: number, params: RiskParameters): RiskResult => {
        return riskInstance.execute(signal, balance, params);
      },
    };

    this.loadedRisks.set(name, risk);
    return risk;
  }

  private async loadRiskClass(filePath: string, className: string): Promise<(new () => RiskManagementStrategy) | undefined> {
    try {
      const module = (await import(filePath)) as Record<string, new () => RiskManagementStrategy>;
      const RiskClass = module[className] || module.default;

      if (!RiskClass || typeof RiskClass !== 'function') {
        throw new Error(`Invalid class definition for ${className}`);
      }

      return RiskClass;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to load risk class from ${filePath}: ${errorMessage}`);
      return undefined;
    }
  }

  private isValidRiskStrategy(instance: unknown): instance is RiskManagementStrategy {
    return (
      instance !== null &&
      typeof instance === 'object' &&
      'execute' in instance &&
      typeof (instance as RiskManagementStrategy).execute === 'function'
    );
  }

  getAllRiskStrategies(): string[] {
    return Array.from(this.loadedRisks.keys());
  }
}
