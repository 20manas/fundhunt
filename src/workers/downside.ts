import dayjs from 'dayjs';

import {downsideDev} from '$lib/aggregates';
import {dates} from '$lib/dates';
import type {TDatePriceMap} from '$lib/price-history';

const getMonthlyMar = (annualReturn: number) => (Math.pow(1 + annualReturn / 100, 1 / 12) - 1) * 100;
const getDailyMar = (annualReturn: number) => (Math.pow(1 + annualReturn / 100, 1 / 252) - 1) * 100;

const ROOT_DAILY = Math.sqrt(252);
const ROOT_MONTHLY = Math.sqrt(12);

const monthBeforeMap = new Map<string, string>();

const getMonthBeforeDate = (date: string) => {
  if (monthBeforeMap.has(date)) {
    return monthBeforeMap.get(date) as string;
  }

  const monthBefore = dayjs(date).subtract(1, 'month').format('YYYY-MM-DD');
  monthBeforeMap.set(date, monthBefore);

  return monthBefore;
};

export const downside = (
  returnsPeriod: 'daily' | 'monthly',
  phMap: TDatePriceMap,
  startDate: string,
  endDate: string,
  mar: number,
) => {
  const values: number[] = [];

  const startIndex = dates.dayWiseIndex(startDate);
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];
    const dateBefore = returnsPeriod === 'daily' ? dates.dayWise[index - 1] : getMonthBeforeDate(date);

    const price = phMap.get(date);
    const priceBefore = phMap.get(dateBefore);

    if (typeof price === 'undefined' || typeof priceBefore === 'undefined') {
      console.error(`map entry not found: ${date} or ${dateBefore}`);
      continue;
    }

    values.push(((price - priceBefore) / priceBefore) * 100);
  }

  const result = downsideDev(values, returnsPeriod === 'daily' ? getDailyMar(mar) : getMonthlyMar(mar));

  return result * (returnsPeriod === 'daily' ? ROOT_DAILY : ROOT_MONTHLY);
};
