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
) => tMaybePromise<TDerivedValue[]>;
