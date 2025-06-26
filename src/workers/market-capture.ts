import {dates} from '$lib/dates';
import type {TDatePriceMap} from '$lib/price-history';

export const downsideMarketCaptureRatio = (
  phMap: TDatePriceMap,
  benchPhMap: TDatePriceMap,
  startDate: string,
  endDate: string,
) => {
  let benchSum = 0;
  let fundSum = 0;

  const startIndex = dates.endOfMonth.getIndex(startDate);
  const endIndex = dates.endOfMonth.getIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];
    const dateBefore = dates.endOfMonth.array[index - 1];

    const priceBench = benchPhMap.get(date);
    const priceBenchBefore = benchPhMap.get(dateBefore);

    if (typeof priceBench === 'undefined' || typeof priceBenchBefore === 'undefined') {
      console.error(`bench map entry not found: ${date} or ${dateBefore}`);
      continue;
    }

    if (priceBench >= priceBenchBefore) {
      continue;
    }

    const price = phMap.get(date);
    const priceBefore = phMap.get(dateBefore);

    if (typeof price === 'undefined' || typeof priceBefore === 'undefined') {
      console.error(`map entry not found: ${date} or ${dateBefore}`);
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

  const startIndex = dates.endOfMonth.getIndex(startDate);
  const endIndex = dates.endOfMonth.getIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];
    const dateBefore = dates.endOfMonth.array[index - 1];

    const priceBench = benchPhMap.get(date);
    const priceBenchBefore = benchPhMap.get(dateBefore);

    if (typeof priceBench === 'undefined' || typeof priceBenchBefore === 'undefined') {
      console.error(`bench map entry not found: ${date} or ${dateBefore}`);
      continue;
    }

    if (priceBench <= priceBenchBefore) {
      continue;
    }

    const price = phMap.get(date);
    const priceBefore = phMap.get(dateBefore);

    if (typeof price === 'undefined' || typeof priceBefore === 'undefined') {
      console.error(`map entry not found: ${date} or ${dateBefore}`);
      continue;
    }

    benchSum += ((priceBench - priceBenchBefore) / priceBenchBefore) * 100;
    fundSum += ((price - priceBefore) / priceBefore) * 100;
  }

  return (fundSum / benchSum) * 100;
};
