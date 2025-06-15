import type {EMetric} from '$types/metrics';
import type {TPriceHistoryItem} from '$types/price-history';

export interface TDerivedValue {
  date: string;
  value: number | null;
}

type tMaybePromise<T> = T | Promise<T>;

export type TRollingReturns = (
  metric: EMetric,
  period: number,
  priceHistory: TPriceHistoryItem[],
  benchmarkHistory?: TPriceHistoryItem[],
) => tMaybePromise<TDerivedValue[]>;

export type TAlltimeReturns = (
  metric: EMetric,
  priceHistory: TPriceHistoryItem[],
  benchmarkHistory?: TPriceHistoryItem[],
) => tMaybePromise<null | {value: number; startDate: string; endDate: string}>;
