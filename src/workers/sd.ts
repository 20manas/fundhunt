import {stdDev} from '$lib/aggregates';
import {dates} from '$lib/dates';
import type {TDatePriceMap} from '$lib/price-history';

const ROOT_MONTHLY = Math.sqrt(12);

export const sd = (phMap: TDatePriceMap, startDate: string, endDate: string) => {
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

    values.push((price - priceBefore) / priceBefore);
  }

  const result = stdDev(values);

  if (result === null) return null;

  return result * 100 * ROOT_MONTHLY;
};
