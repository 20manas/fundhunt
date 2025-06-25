import dayjs from 'dayjs';

import {DEFAULT_RISK_FREE_RETURN} from '$lib/constants';
import {dates, getDateStr} from '$lib/dates';
import {getDatePriceMap, getPriceHistoryDateRange, type TDatePriceMap} from '$lib/price-history';
import {isNull} from '$lib/type';
import {EMetric} from '$types/metrics';
import type {TAlltimeReturns, TRollingReturns} from '$types/rolling';

import {cagr} from './cagr';
import {downside} from './downside';
import {
  downsideMarketCaptureRatio as downMarketCapture,
  upsideMarketCaptureRatio as upMarketCapture,
} from './market-capture';
import {sd} from './sd';
import {sharpeRatio} from './sharpe';
import {sortinoRatio} from './sortino';
import {xirr} from './xirr';

const rollingXirr = (phMap: TDatePriceMap, startDate: string, endDate: string, period: number) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.monthWiseIndex(startDate);
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: xirr(phMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingSd = (phMap: TDatePriceMap, startDate: string, endDate: string, period: number) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.monthWiseIndex(startDate) + 1;
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: sd(phMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingDd = (phMap: TDatePriceMap, startDate: string, endDate: string, period: number, mar: number) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.monthWiseIndex(startDate) + 1;
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: downside(phMap, periodStart, periodEnd, mar),
    });
  }

  return data;
};

const rollingSharpeRatio = (
  phMap: TDatePriceMap,
  startDate: string,
  endDate: string,
  period: number,
  riskFreeReturn: number,
) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.monthWiseIndex(startDate) + 1;
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: sharpeRatio(phMap, periodStart, periodEnd, riskFreeReturn),
    });
  }

  return data;
};

const rollingSortinoRatio = (
  phMap: TDatePriceMap,
  startDate: string,
  endDate: string,
  period: number,
  riskFreeReturn: number,
  mar: number,
) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.monthWiseIndex(startDate) + 1;
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    let value = sortinoRatio(phMap, periodStart, periodEnd, riskFreeReturn, mar);

    if (isNull(value) || isNaN(value) || value === Infinity || value === -Infinity) value = null;

    data.push({
      date,
      value,
    });
  }

  return data;
};

const rollingDownMarketCapture = (
  phMap: TDatePriceMap,
  benchMap: TDatePriceMap,
  startDate: string,
  endDate: string,
  period: number,
) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.monthWiseIndex(startDate) + 1;
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: downMarketCapture(phMap, benchMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingUpMarketCapture = (
  phMap: TDatePriceMap,
  benchMap: TDatePriceMap,
  startDate: string,
  endDate: string,
  period: number,
) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.monthWiseIndex(startDate) + 1;
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: upMarketCapture(phMap, benchMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingCagr = (phMap: TDatePriceMap, startDate: string, endDate: string, period: number) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.monthWiseIndex(startDate);
  const endIndex = dates.monthWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.monthWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: cagr(phMap, periodStart, periodEnd),
    });
  }

  return data;
};

export const rollingReturns: TRollingReturns = (period, phData, options) => {
  if (phData.length === 0) return [];

  const phMap = getDatePriceMap(phData);

  const dateRange = getPriceHistoryDateRange(phData);
  const startDate = getDateStr(dayjs(dateRange.min).add(period, 'years'));
  const endDate = dateRange.max;

  const mar = options.mar ?? DEFAULT_RISK_FREE_RETURN;
  const rfr = options.riskFreeReturn ?? DEFAULT_RISK_FREE_RETURN;

  if (options.metric === EMetric.Xirr) {
    return rollingXirr(phMap, startDate, endDate, period);
  } else if (options.metric === EMetric.StdDev) {
    return rollingSd(phMap, startDate, endDate, period);
  } else if (options.metric === EMetric.Downside) {
    return rollingDd(phMap, startDate, endDate, period, mar);
  } else if (options.metric === EMetric.Sharpe) {
    return rollingSharpeRatio(phMap, startDate, endDate, period, rfr);
  } else if (options.metric === EMetric.Sortino) {
    return rollingSortinoRatio(phMap, startDate, endDate, period, rfr, mar);
  } else if (options.metric === EMetric.Cagr) {
    return rollingCagr(phMap, startDate, endDate, period);
  } else {
    const benchMap = getDatePriceMap(options.benchmark ?? []);

    if (options.metric === EMetric.DMC) {
      return rollingDownMarketCapture(phMap, benchMap, startDate, endDate, period);
    } else {
      return rollingUpMarketCapture(phMap, benchMap, startDate, endDate, period);
    }
  }
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

export const allTimeReturns: TAlltimeReturns = (phData, options) => {
  if (phData.length === 0) return null;

  const phMap = getDatePriceMap(phData);

  const monthlyMetrics = [EMetric.StdDev, EMetric.Downside, EMetric.Sharpe, EMetric.Sortino];

  const dateRange = getPriceHistoryDateRange(phData);
  const startDate = getDateStr(dayjs(dateRange.min).add(1, monthlyMetrics.includes(options.metric) ? 'month' : 'day'));
  const endDate = dateRange.max;

  const mar = options.mar ?? DEFAULT_RISK_FREE_RETURN;
  const rfr = options.riskFreeReturn ?? DEFAULT_RISK_FREE_RETURN;

  let value: number | null = null;

  if (options.metric === EMetric.Xirr) {
    value = xirr(phMap, startDate, endDate);
  } else if (options.metric === EMetric.StdDev) {
    value = sd(phMap, startDate, endDate);
  } else if (options.metric === EMetric.Downside) {
    value = downside(phMap, startDate, endDate, mar);
  } else if (options.metric === EMetric.Sharpe) {
    value = sharpeRatio(phMap, startDate, endDate, rfr);
  } else if (options.metric === EMetric.Sortino) {
    value = sortinoRatio(phMap, startDate, endDate, rfr, mar);
  } else if (options.metric === EMetric.Cagr) {
    value = cagr(phMap, startDate, endDate);
  } else {
    const benchMap = getDatePriceMap(options.benchmark ?? []);

    if (options.metric === EMetric.DMC) {
      value = downMarketCapture(phMap, benchMap, startDate, endDate);
    } else {
      value = upMarketCapture(phMap, benchMap, startDate, endDate);
    }
  }

  if (isNull(value)) return null;

  return {value, startDate, endDate};
};
