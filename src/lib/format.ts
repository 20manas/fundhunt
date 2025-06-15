import {EMetric} from '$types/metrics';

export const formatNumber = (num: number) => parseFloat(num.toFixed(2)).toLocaleString();

export const formatPercentage = (num: number) => formatNumber(num) + '%';

export const formatMetric = (metric: EMetric) =>
  [EMetric.Sharpe, EMetric.Sortino].includes(metric) ? formatNumber : formatPercentage;
