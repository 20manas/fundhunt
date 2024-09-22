import {createQuery} from '@tanstack/svelte-query';
import * as Ri from 'radashi';
import {derived, type Readable} from 'svelte/store';

import {kyGetFetcher, type TQueryKey} from '$lib/fetch';
import {indexDataURL} from '$lib/index-funds';
import {EFundType, type TFund} from '$types/funds';

type tListRaw = string[];

const getTitle = (value: string) => Ri.title(value.replaceAll(/([-A-Za-z]+)(\d+)/g, '$1 $2').toLowerCase());

export const getIndexFundList = () =>
  createQuery<tListRaw, Error, TFund[], TQueryKey<undefined>>({
    queryKey: [indexDataURL`index-list.json`, undefined, undefined],
    queryFn: kyGetFetcher<tListRaw>,
    select: data =>
      Array.from(new Set(data))
        .map<TFund>(f => ({type: EFundType.Index, value: f, title: getTitle(f)}))
        .toSorted((f1, f2) => f1.title.localeCompare(f2.title)),
  });

type tMFApiRaw = Array<{schemeCode: number; schemeName: string}>;

export const queryMFApi = (query: Readable<string>) =>
  createQuery<tMFApiRaw, Error, TFund[], TQueryKey<{q: string}>>(
    derived(query, $query => ({
      queryKey: ['https://api.mfapi.in/mf/search', {q: $query}, undefined] satisfies TQueryKey<{q: string}>,
      enabled: $query.length > 0,
      queryFn: kyGetFetcher<tMFApiRaw, {q: string}>,
      select: (data: tMFApiRaw) =>
        data
          .map(fund => ({
            type: EFundType.MutualFund,
            value: fund.schemeCode.toString(),
            title: fund.schemeName,
          }))
          .toSorted((f1, f2) => f1.title.localeCompare(f2.title)),
    })),
  );
