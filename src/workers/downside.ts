import {downsideDev} from '$lib/aggregates';
import {dates} from '$lib/dates';
import type {TDatePriceMap} from '$lib/price-history';

const getMonthlyMar = (annualReturn: number) => (Math.pow(1 + annualReturn / 100, 1 / 12) - 1) * 100;

const ROOT_MONTHLY = Math.sqrt(12);

export const downside = (phMap: TDatePriceMap, startDate: string, endDate: string, mar: number) => {
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

  const result = downsideDev(values, getMonthlyMar(mar));

  return result * ROOT_MONTHLY;
};
