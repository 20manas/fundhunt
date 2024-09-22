import {dates} from '$lib/dates';
import type {TDatePriceMap} from '$lib/price-history';

import type {XIRREntry} from './xirr';

export const getSellingPrice = (map: TDatePriceMap, startDate: string, endDate: string, investment: number) => {
  let unitsBought = 0;

  const startIndex = dates.monthWiseIndex(startDate);
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];
    const price = map.get(date);

    if (typeof price === 'undefined') {
      console.error(`map entry not found: ${date}`);
      throw new Error(`map entry not found: ${date}`);
    }

    unitsBought += investment / price;
  }

  const sellingDatePrice = map.get(endDate);

  if (typeof sellingDatePrice !== 'undefined') {
    return unitsBought * sellingDatePrice;
  } else {
    return null;
  }
};

export const generateXirrData = (startDate: string, endDate: string, investment: number, sellingPrice: number) => {
  const data: XIRREntry[] = [];

  const startIndex = dates.monthWiseIndex(startDate);
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    data.push({
      value: investment * -1,
      date: dates.monthWise[index],
    });
  }

  data.push({
    value: sellingPrice,
    date: endDate,
  });

  return data;
};
