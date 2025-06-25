import {average} from '$lib/aggregates';
import {dates} from '$lib/dates';
import type {TDatePriceMap} from '$lib/price-history';

import {sd} from './sd';

const getMonthlyRiskFreeReturn = (annualReturn: number) => (Math.pow(1 + annualReturn / 100, 1 / 12) - 1) * 100;

export const sharpeRatio = (phMap: TDatePriceMap, startDate: string, endDate: string, riskFreeReturn: number) => {
  const values: number[] = [];

  const startIndex = dates.monthWiseIndex(startDate);
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];
    const dateBefore = dates.monthWise[index - 1];

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

  const netReturn = monthlyReturn - getMonthlyRiskFreeReturn(riskFreeReturn);
  // console.info('net return', monthlyReturn, netReturn, values);
  const annualReturn = (Math.pow(1 + netReturn / 100, 12) - 1) * 100;

  const stdDeviation = sd(phMap, startDate, endDate);

  if (stdDeviation === null) return null;

  return annualReturn / stdDeviation;
};
