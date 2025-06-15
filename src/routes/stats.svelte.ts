import {createQueries} from '@tanstack/svelte-query';
import {type Readable, derived} from 'svelte/store';

import {fetchPriceHistory} from '$lib/price-history';
import {isNotNull, isNotUndefined} from '$lib/type';
import type {TFund} from '$types/funds';
import type {EMetric} from '$types/metrics';
import type {TDerivedValue} from '$types/rolling';

const rollingWorker = new ComlinkWorker<typeof import('../workers/rolling')>(
  new URL('../workers/rolling.ts', import.meta.url),
);

export interface TStatsRequestData {
  metric: EMetric;
  periods: Array<number | 'all-time'>;
  funds: TFund[];
  benchmark: TFund | null;
}

type tResult = TFund &
  (
    | {
        period: number;
        data: TDerivedValue[];
      }
    | {
        period: 'all-time';
        data?: number;
        startDate?: string;
        endDate?: string;
      }
  );

type tCombinedResult =
  | {
      period: number;
      list: Array<TFund & {data: TDerivedValue[]}>;
    }
  | {
      period: 'all-time';
      list: Array<TFund & {data?: number; startDate?: string; endDate?: string}>;
    };

const getCombinedData = (resultList: tResult[]): tCombinedResult[] => {
  const map = new Map<number, Array<TFund & {data: TDerivedValue[]}>>();
  const allTime: Array<TFund & {data?: number; startDate?: string; endDate?: string}> = [];

  for (const result of resultList) {
    const key = result.period;

    if (key === 'all-time') {
      allTime.push(result);
      continue;
    }

    if (map.has(key)) {
      map.get(key)?.push(result);
    } else {
      map.set(key, [result]);
    }
  }

  return Array.from(map.entries())
    .map(
      ([key, value]): tCombinedResult => ({
        period: key,
        list: value,
      }),
    )
    .concat([{period: 'all-time', list: allTime}]);
};

export const getStats = (requestData: Readable<TStatsRequestData>) =>
  createQueries({
    queries: derived(requestData, $requestData => {
      const list: Array<{period: number | 'all-time'; metric: EMetric; funds: TFund[]; benchmark: TFund | null}> = [];

      for (const period of $requestData.periods) {
        list.push({
          period,
          metric: $requestData.metric,
          funds: $requestData.funds,
          benchmark: $requestData.benchmark,
        });
      }

      type tQueryKey = Readonly<[{fund: TFund; period: number | 'all-time'; metric: EMetric}]>;

      return list
        .flatMap(item => item.funds.map(fund => ({fund, ...item})))
        .map(item => ({
          queryKey: [item] as const,
          queryFn: async ({signal}: {queryKey: tQueryKey; signal: AbortSignal}) => {
            const benchmark = isNotNull(item.benchmark) ? await fetchPriceHistory(item.benchmark, signal) : undefined;
            const data = await fetchPriceHistory(item.fund, signal);

            if (item.period === 'all-time') {
              const allTime = await rollingWorker.allTimeReturns(item.metric, data, benchmark);

              return {
                ...item.fund,
                startDate: allTime?.startDate,
                endDate: allTime?.endDate,
                data: allTime?.value,
                period: item.period,
              };
            } else {
              return {
                ...item.fund,
                period: item.period,
                data: await rollingWorker.rollingReturns(item.metric, item.period, data, benchmark),
              };
            }
          },
          staleTime: Infinity,
        }));
    }),
    combine: resultList => ({
      data: getCombinedData(resultList.map(result => result.data).filter(isNotUndefined)),
      isLoading: resultList.length > 0 && resultList.some(res => res.isLoading),
      isFetching: resultList.some(res => res.isFetching),
      someSuccess: resultList.length > 0 && resultList.some(res => res.isSuccess),
    }),
  });
