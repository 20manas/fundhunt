import type {TMetricConfig} from '$types/metrics';
import type {TPriceHistoryItem} from '$types/price-history';

export interface TDerivedValue {
  date: string;
  value: number | null;
}

type tMaybePromise<T> = T | Promise<T>;

export type TRollingReturns = (
  period: number,
  priceHistory: TPriceHistoryItem[],
  metricConfig: TMetricConfig,
) => tMaybePromise<TDerivedValue[]>;

export type TAlltimeReturns = (
  priceHistory: TPriceHistoryItem[],
  metricConfig: TMetricConfig,
) => tMaybePromise<null | {value: number; startDate: string; endDate: string}>;
