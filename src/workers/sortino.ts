import dayjs from 'dayjs';

import {average} from '$lib/aggregates';
import {dates} from '$lib/dates';
import type {TDatePriceMap} from '$lib/price-history';

import {downside} from './downside';

const MONTHLY_RISK_FREE_RETURN = (Math.pow(1.065, 1 / 12) - 1) * 100;

const monthBeforeMap = new Map<string, string>();

const getMonthBeforeDate = (date: string) => {
  if (monthBeforeMap.has(date)) {
    return monthBeforeMap.get(date) as string;
  }

  const monthBefore = dayjs(date).subtract(1, 'month').format('YYYY-MM-DD');
  monthBeforeMap.set(date, monthBefore);

  return monthBefore;
};

export const sortinoRatio = (phMap: TDatePriceMap, startDate: string, endDate: string) => {
  const values: number[] = [];

  const startIndex = dates.dayWiseIndex(startDate);
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];
    const dateBefore = getMonthBeforeDate(date);
    const price = phMap.get(date);
    const priceBefore = phMap.get(dateBefore);

    if (typeof price === 'undefined' || typeof priceBefore === 'undefined') {
      console.error(`map entry not found: ${date} or ${dateBefore}`);
      continue;
    }

    values.push(((price - priceBefore) / priceBefore) * 100);
  }

  const monthlyReturn = average(values);

  if (monthlyReturn === null) return null;

  const netReturn = monthlyReturn - MONTHLY_RISK_FREE_RETURN;
  // console.info('net return', monthlyReturn, netReturn, values);
  const annualReturn = (Math.pow(1 + netReturn / 100, 12) - 1) * 100;

  const downsideDeviation = downside('monthly', phMap, startDate, endDate);

  // if (stdDeviation === null) return null;

  return annualReturn / downsideDeviation;
};
