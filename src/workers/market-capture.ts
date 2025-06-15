import dayjs from 'dayjs';

import {dates} from '$lib/dates';
import type {TDatePriceMap} from '$lib/price-history';

const monthBeforeMap = new Map<string, string>();

const getMonthBeforeDate = (date: string) => {
  if (monthBeforeMap.has(date)) {
    return monthBeforeMap.get(date) as string;
  }

  const monthBefore = dayjs(date).subtract(1, 'month').format('YYYY-MM-DD');
  monthBeforeMap.set(date, monthBefore);

  return monthBefore;
};

export const downsideMarketCaptureRatio = (
  phMap: TDatePriceMap,
  benchPhMap: TDatePriceMap,
  startDate: string,
  endDate: string,
) => {
  let benchSum = 0;
  let fundSum = 0;

  const startIndex = dates.dayWiseIndex(startDate);
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];
    const dateBefore = getMonthBeforeDate(date);

    const priceBench = benchPhMap.get(date);
    const priceBenchBefore = benchPhMap.get(dateBefore);

    if (typeof priceBench === 'undefined' || typeof priceBenchBefore === 'undefined') {
      // console.error(`bench map entry not found: ${date} or ${dateBefore}`);
      continue;
    }

    if (priceBench >= priceBenchBefore) {
      continue;
    }

    const price = phMap.get(date);
    const priceBefore = phMap.get(dateBefore);

    if (typeof price === 'undefined' || typeof priceBefore === 'undefined') {
      // console.error(`map entry not found: ${date} or ${dateBefore}`);
      continue;
    }

    benchSum += ((priceBench - priceBenchBefore) / priceBenchBefore) * 100;
    fundSum += ((price - priceBefore) / priceBefore) * 100;
  }

  return (fundSum / benchSum) * 100;
};

export const upsideMarketCaptureRatio = (
  phMap: TDatePriceMap,
  benchPhMap: TDatePriceMap,
  startDate: string,
  endDate: string,
) => {
  let benchSum = 0;
  let fundSum = 0;

  const startIndex = dates.dayWiseIndex(startDate);
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];
    const dateBefore = getMonthBeforeDate(date);

    const priceBench = benchPhMap.get(date);
    const priceBenchBefore = benchPhMap.get(dateBefore);

    if (typeof priceBench === 'undefined' || typeof priceBenchBefore === 'undefined') {
      // console.error(`bench map entry not found: ${date} or ${dateBefore}`);
      continue;
    }

    if (priceBench <= priceBenchBefore) {
      continue;
    }

    const price = phMap.get(date);
    const priceBefore = phMap.get(dateBefore);

    if (typeof price === 'undefined' || typeof priceBefore === 'undefined') {
      // console.error(`map entry not found: ${date} or ${dateBefore}`);
      continue;
    }

    benchSum += ((priceBench - priceBenchBefore) / priceBenchBefore) * 100;
    fundSum += ((price - priceBefore) / priceBefore) * 100;
  }

  return (fundSum / benchSum) * 100;
};
