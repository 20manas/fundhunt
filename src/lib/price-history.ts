import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as Ri from 'radashi';

import {dates, getDateStr, isDateWithinRange} from '$lib/dates';
import {kyGet} from '$lib/fetch';
import {indexDataURL} from '$lib/index-funds';
import {EFundType, type TFund} from '$types/funds';
import type {TPriceHistoryItem} from '$types/price-history';

dayjs.extend(customParseFormat);

export const fillMissingData = (data: TPriceHistoryItem[]) => {
  if (data.length === 0) return [];

  data.sort((entry1, entry2) => dayjs(entry1.date).unix() - dayjs(entry2.date).unix());

  const newData: TPriceHistoryItem[] = [];

  const startIndex = dates.dayWiseIndex(data[0].date.replace(/[\d]{2}$/, '01'));
  const endIndex = dates.dayWiseIndex(data[data.length - 1].date);

  for (let index = startIndex, phIndex = 0; index <= endIndex; index++) {
    const date = dates.dayWise[index];

    newData.push({
      date: date,
      price: data[phIndex].price,
    });

    if (date === data[phIndex].date) {
      phIndex++;
    }
  }

  return newData;
};

export type TDatePriceMap = Map<string, number>;

export const getDatePriceMap = (data: TPriceHistoryItem[]): TDatePriceMap => {
  const map = new Map<string, number>();

  for (const entry of data) {
    map.set(entry.date, entry.price);
  }

  return map;
};

const fetchIndexPriceHistory = (fund: TFund, signal: AbortSignal) =>
  kyGet<TPriceHistoryItem[]>(indexDataURL`index-tri-data/${encodeURIComponent(fund.value)}.json`, undefined, {
    signal,
  });

interface tMfNavData {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
    isin_growth: string;
    isin_div_reinvestment: unknown;
  };
  data: Array<{
    status: string;
    date: string;
    nav: string;
  }>;
}

const fetchMfPriceHistory = (fund: TFund, signal: AbortSignal) =>
  kyGet<tMfNavData>(`https://api.mfapi.in/mf/${fund.value}`, undefined, {signal}).then(data => {
    fund.title = data.meta.scheme_name;

    return data.data.map<TPriceHistoryItem>(entry => ({
      price: parseFloat(entry.nav),
      date: getDateStr(dayjs(entry.date, 'DD-MM-YYYY')),
    }));
  });

export const fetchPriceHistory = Ri.memo(
  async (fund: TFund, signal: AbortSignal) => {
    const data = await (fund.type === EFundType.Index
      ? fetchIndexPriceHistory(fund, signal)
      : fetchMfPriceHistory(fund, signal));

    return fillMissingData(data.filter(entry => isDateWithinRange(entry.date)));
  },
  {key: (fund: TFund) => fund.value.toString()},
);
