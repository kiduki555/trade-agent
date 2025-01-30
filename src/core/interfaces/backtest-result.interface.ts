/**
 * 백테스트 결과 저장을 위한 인터페이스
 *
 * 역할/기능:
 * - 백테스트 실행 결과를 저장하기 위한 확장된 인터페이스를 정의합니다.
 * - 기본 백테스트 결과에 메타데이터와 설정 정보를 추가합니다.
 */

import { BacktestResult, BacktestConfig } from '../../backtest/interfaces/backtest.interface';

export interface SavedBacktestResult extends BacktestResult {
  id: string;
  strategyName: string;
  riskRuleName: string;
  executedAt: Date;
  config: BacktestConfig;
  metadata: {
    version: string;
    environment: string;
    executionTime: number;
  };
}
