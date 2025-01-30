/**
 * 리스크 관리 전략 로더
 *
 * 역할/기능:
 * - DB에 저장된 리스크 관리 전략을 동적으로 로드합니다.
 * - 전략의 인스턴스화와 파라미터 적용을 관리합니다.
 * - 전략의 유효성을 검증하고 에러 처리를 담당합니다.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RiskDocument } from './schemas/risk.schema';
import { RiskRule } from './interfaces/risk-rule.interface';

type RiskRuleConstructor = new () => RiskRule;

@Injectable()
export class RiskLoader {
  private riskRules: Map<string, RiskRule> = new Map();

  constructor(@InjectModel('Risk') private readonly riskModel: Model<RiskDocument>) {
    void this.loadRiskRulesFromDB();
  }

  /**
   * DB에서 리스크 관리 전략을 로드하고 초기화합니다.
   */
  private async loadRiskRulesFromDB(): Promise<void> {
    try {
      const rulesFromDB = await this.riskModel.find().exec();

      for (const ruleData of rulesFromDB) {
        try {
          const ruleModule = (await import(ruleData.filePath)) as Record<string, RiskRuleConstructor>;
          const RuleClass = ruleModule[ruleData.className];

          if (!RuleClass) {
            console.error(`Invalid risk rule class: ${ruleData.className}`);
            continue;
          }

          const ruleInstance = new RuleClass();

          if (ruleData.parameters) {
            Object.assign(ruleInstance, ruleData.parameters);
          }

          this.riskRules.set(ruleData.name, ruleInstance);
        } catch (error) {
          console.error(`Error loading risk rule ${ruleData.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading risk rules from DB:', error);
    }
  }

  /**
   * 특정 이름의 리스크 관리 전략을 반환합니다.
   *
   * @param name - 리스크 관리 전략의 이름
   * @returns RiskRule - 요청된 리스크 관리 전략
   * @throws Error - 전략을 찾을 수 없는 경우
   */
  getRiskRule(name: string): RiskRule {
    const rule = this.riskRules.get(name);
    if (!rule) {
      throw new Error(`Risk rule '${name}' not found`);
    }
    return rule;
  }

  /**
   * 사용 가능한 모든 리스크 관리 전략의 이름을 반환합니다.
   *
   * @returns string[] - 리스크 관리 전략 이름 목록
   */
  getAllRiskRules(): string[] {
    return Array.from(this.riskRules.keys());
  }
}
