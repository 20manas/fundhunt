import type {TPriceHistoryItem} from './price-history';

export const enum EMetric {
  Xirr = 'r-xirr',
  Cagr = 'r-cagr',
  StdDev = 'r-sd',
  Downside = 'r-dd',
  Sharpe = 'r-sharpe',
  Sortino = 'r-sortino',
  DMC = 'r-dmc',
  UMC = 'r-umc',
}

export interface TMetricConfig {
  metric: EMetric;
  benchmark?: TPriceHistoryItem[];
  riskFreeReturn?: number;
  mar?: number;
}
