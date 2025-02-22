import {createQueries} from '@tanstack/svelte-query';
import {type Readable, derived} from 'svelte/store';

import {fetchPriceHistory} from '$lib/price-history';
import {isNotUndefined} from '$lib/type';
import type {TFund} from '$types/funds';
import type {TXirrEntry} from '$types/rolling';

const rollingWorker = new ComlinkWorker<typeof import('../workers/rolling')>(
  new URL('../workers/rolling.ts', import.meta.url),
);

export type TStatsRequestData = Array<{
  period: number;
  list: TFund[];
}>;

interface tResult extends TFund {
  period: number;
  data: TXirrEntry[];
}

const getCombinedData = (resultList: tResult[]) => {
  const map = new Map<number, Array<TFund & {data: TXirrEntry[]}>>();

  for (const result of resultList) {
    const key = result.period;

    if (map.has(key)) {
      map.get(key)?.push(result);
    } else {
      map.set(key, [result]);
    }
  }

  return Array.from(map.entries()).map(([key, value]) => ({
    period: key,
    list: value,
  }));
};

export const getStats = (requestData: Readable<TStatsRequestData>) =>
  createQueries({
    queries: derived(requestData, $requestData =>
      $requestData
        .flatMap(item => item.list.map(fund => ({fund, period: item.period})))
        .map(item => ({
          queryKey: [item] as const,
          queryFn: async ({signal}: {queryKey: Readonly<[{fund: TFund; period: number}]>; signal: AbortSignal}) => {
            const data = await fetchPriceHistory(item.fund, signal);

            return {
              ...item.fund,
              period: item.period,
              data: await rollingWorker.rollingReturns(item.period, data),
            };
          },
          staleTime: Infinity,
        })),
    ),
    combine: resultList => ({
      data: getCombinedData(resultList.map(result => result.data).filter(isNotUndefined)),
      isLoading: resultList.length > 0 && resultList.some(res => res.isLoading),
      isFetching: resultList.some(res => res.isFetching),
    }),
  });
