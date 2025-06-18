import type {TPriceHistoryItem} from './price-history';

export const enum EMetric {
  Xirr = 'r-xirr',
  Cagr = 'r-cagr',
  SdMonthly = 'r-sdm',
  SdDaily = 'r-sdd',
  DdMonthly = 'r-ddm',
  DdDaily = 'r-ddd',
  Sharpe = 'r-sharpe',
  Sortino = 'r-sortino',
  DMC = 'r-dmc',
  UMC = 'r-umc',
}

export interface TMetricConfig {
  metric: EMetric;
  benchmark?: TPriceHistoryItem[];
  riskFreeReturn?: number;
}
