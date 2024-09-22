import dayjs from 'dayjs';

import {dates, getDateStr} from '$lib/dates';
import {getDatePriceMap} from '$lib/price-history';
import type {TPriceHistoryItem} from '$types/price-history';
import type {TRollingReturns} from '$types/rolling';

import {generateXirrData, getSellingPrice} from './sip';
import {calcXIRR} from './xirr';

const INVESTMENT = 10000;

const getPriceHistoryDateRange = (phData: TPriceHistoryItem[]) => {
  if (phData.length === 0) {
    console.error('no price history data in getPriceHistoryDateRange');
    throw new Error('no price history data in getPriceHistoryDateRange');
  }

  let minDate = phData[0].date;
  let maxDate = phData[0].date;

  for (const item of phData) {
    if (minDate.localeCompare(item.date) > 0) {
      minDate = item.date;
    }

    if (maxDate.localeCompare(item.date) < 0) {
      maxDate = item.date;
    }
  }

  return {min: minDate, max: maxDate};
};

export const rollingReturns: TRollingReturns = (period, phData) => {
  if (phData.length === 0) return [];

  const data: ReturnType<TRollingReturns> = [];

  const dateRange = getPriceHistoryDateRange(phData);
  const startDate = getDateStr(dayjs(dateRange.min).add(period, 'years'));
  const endDate = dateRange.max;

  const startIndex = dates.dayWiseIndex(startDate);
  const endIndex = dates.dayWiseIndex(endDate);

  const phMap = getDatePriceMap(phData);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    const sellingPrice = getSellingPrice(phMap, periodStart, periodEnd, INVESTMENT);

    if (sellingPrice === null) {
      console.log('no selling price', date);
      continue;
    }

    const xirrData = generateXirrData(periodStart, periodEnd, INVESTMENT, sellingPrice);
    const xirr = calcXIRR(xirrData);

    data.push({
      date,
      xirr: xirr !== null ? xirr * 100 : null,
    });
  }

  return data;
};

// export const rollingReturns2 = (period: number, phData: TPriceHistoryItem[]) => {
//   const data = [];

//   const startDate = getDateStr(dayjs('2015-01-01'));
//   const endDate = getDateStr(dayjs('2024-01-02'));

//   const startIndex = dates.dayWiseIndex(startDate);
//   const endIndex = dates.dayWiseIndex(endDate);

//   console.time('phMap');
//   const phMap = getDatePriceMap(phData);
//   console.timeEnd('phMap');

//   // console.time('datesGen');
//   // const dateList = [];
//   // for (let date = dayjs('2023-01-01'); date.isBefore(endDate); date = date.add(1, 'day')) {
//   //   const periodEnd = date;
//   //   const periodStart = date.subtract(period, 'years');

//   //   dateList.push([periodStart, periodEnd]);
//   // }
//   // console.timeEnd('datesGen');

//   console.time('sellingPrices');
//   const sellingPrices = [];
//   for (let index = startIndex; index <= endIndex; index++) {
//     const date = dates.dayWise[index];

//     const periodEnd = date;
//     const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

//     const sellingPrice = getSellingPrice(phMap, periodStart, periodEnd, INVESTMENT);
//     sellingPrices.push(sellingPrice);
//   }
//   console.timeEnd('sellingPrices');

//   console.time('xirrDataAll');
//   const xirrDataAll = [];
//   for (let index = startIndex; index <= endIndex; index++) {
//     const date = dates.dayWise[index];

//     const periodEnd = date;
//     const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

//     const sellingPrice = sellingPrices[index - startIndex];

//     if (!sellingPrice) {
//       console.log('no selling price', periodEnd);
//       xirrDataAll.push([]);
//       continue;
//     }

//     const xirrData = generateXirrData(periodStart, periodEnd, INVESTMENT, sellingPrice);

//     xirrDataAll.push(xirrData);
//   }
//   console.timeEnd('xirrDataAll');

//   console.time('xirr');
//   for (let index = startIndex; index <= endIndex; index++) {
//     const date = dates.dayWise[index];

//     const periodEnd = date;
//     const xirr = calcXIRR(xirrDataAll[index - startIndex]);

//     data.push({
//       date: periodEnd,
//       xirr: xirr ? `${(xirr * 100).toFixed(2)}%` : null,
//     });
//   }
//   console.timeEnd('xirr');

//   return data;
// };
