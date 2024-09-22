import type {TPriceHistoryItem} from '$types/price-history';

export interface TXirrEntry {
  date: string;
  xirr: number | null;
}

type tMaybePromise<T> = T | Promise<T>;

export type TRollingReturns = (period: number, priceHistory: TPriceHistoryItem[]) => tMaybePromise<TXirrEntry[]>;
