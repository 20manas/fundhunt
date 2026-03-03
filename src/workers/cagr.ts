import dayjs from 'dayjs';

import type {TDatePriceMap} from '$lib/price-history';
import {isUndefined} from '$lib/type';

export const cagr = (phMap: TDatePriceMap, periodStart: string, periodEnd: string) => {
  const price = phMap.get(periodEnd);
  const priceBefore = phMap.get(periodStart);

  if (isUndefined(price) || isUndefined(priceBefore)) {
    console.error(`map entry not found: ${periodEnd} or ${periodStart}`);
    return 0;
  }

  const totalReturn = price / priceBefore;
  const yearDiff = dayjs(periodEnd).diff(dayjs(periodStart), 'years', true);

  return (Math.pow(totalReturn, 1 / yearDiff) - 1) * 100;
};
