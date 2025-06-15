import dayjs from 'dayjs';

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

  const startIndex = dates.dayWiseIndex(startDate);
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: xirr(phMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingSd = (
  metric: EMetric.SdDaily | EMetric.SdMonthly,
  phMap: TDatePriceMap,
  startDate: string,
  endDate: string,
  period: number,
) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.dayWiseIndex(
    dayjs(startDate)
      .add(1, metric === EMetric.SdDaily ? 'day' : 'month')
      .format('YYYY-MM-DD'),
  );

  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: sd(metric === EMetric.SdDaily ? 'daily' : 'monthly', phMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingDd = (
  metric: EMetric.DdDaily | EMetric.DdMonthly,
  phMap: TDatePriceMap,
  startDate: string,
  endDate: string,
  period: number,
) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.dayWiseIndex(
    dayjs(startDate)
      .add(1, metric === EMetric.DdDaily ? 'day' : 'month')
      .format('YYYY-MM-DD'),
  );

  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: downside(metric === EMetric.DdDaily ? 'daily' : 'monthly', phMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingSharpeRatio = (phMap: TDatePriceMap, startDate: string, endDate: string, period: number) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.dayWiseIndex(dayjs(startDate).add(1, 'month').format('YYYY-MM-DD'));
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: sharpeRatio(phMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingSortinoRatio = (phMap: TDatePriceMap, startDate: string, endDate: string, period: number) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.dayWiseIndex(dayjs(startDate).add(1, 'month').format('YYYY-MM-DD'));
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: sortinoRatio(phMap, periodStart, periodEnd),
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

  const startIndex = dates.dayWiseIndex(dayjs(startDate).add(1, 'month').format('YYYY-MM-DD'));
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];

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

  const startIndex = dates.dayWiseIndex(dayjs(startDate).add(1, 'month').format('YYYY-MM-DD'));
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];

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

  const startIndex = dates.dayWiseIndex(startDate);
  const endIndex = dates.dayWiseIndex(endDate);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.dayWise[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years'));

    data.push({
      date,
      value: cagr(phMap, periodStart, periodEnd),
    });
  }

  return data;
};

export const rollingReturns: TRollingReturns = (metric, period, phData, benchData) => {
  if (phData.length === 0) return [];

  const phMap = getDatePriceMap(phData);

  const dateRange = getPriceHistoryDateRange(phData);
  const startDate = getDateStr(dayjs(dateRange.min).add(period, 'years'));
  const endDate = dateRange.max;

  if (metric === EMetric.Xirr) {
    return rollingXirr(phMap, startDate, endDate, period);
  } else if (metric === EMetric.SdDaily || metric === EMetric.SdMonthly) {
    return rollingSd(metric, phMap, startDate, endDate, period);
  } else if (metric === EMetric.DdDaily || metric === EMetric.DdMonthly) {
    return rollingDd(metric, phMap, startDate, endDate, period);
  } else if (metric === EMetric.Sharpe) {
    return rollingSharpeRatio(phMap, startDate, endDate, period);
  } else if (metric === EMetric.Sortino) {
    return rollingSortinoRatio(phMap, startDate, endDate, period);
  } else if (metric === EMetric.Cagr) {
    return rollingCagr(phMap, startDate, endDate, period);
  } else {
    const benchMap = getDatePriceMap(benchData ?? []);

    if (metric === EMetric.DMC) {
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

export const allTimeReturns: TAlltimeReturns = (metric, phData, benchData) => {
  if (phData.length === 0) return null;

  const phMap = getDatePriceMap(phData);

  const monthlyMetrics = [EMetric.SdMonthly, EMetric.DdMonthly, EMetric.Sharpe, EMetric.Sortino];

  const dateRange = getPriceHistoryDateRange(phData);
  const startDate = getDateStr(dayjs(dateRange.min).add(1, monthlyMetrics.includes(metric) ? 'month' : 'day'));
  const endDate = dateRange.max;

  let value: number | null = null;

  if (metric === EMetric.Xirr) {
    value = xirr(phMap, startDate, endDate);
  } else if (metric === EMetric.SdDaily || metric === EMetric.SdMonthly) {
    value = sd(metric === EMetric.SdDaily ? 'daily' : 'monthly', phMap, startDate, endDate);
  } else if (metric === EMetric.DdDaily || metric === EMetric.DdMonthly) {
    value = downside(metric === EMetric.DdDaily ? 'daily' : 'monthly', phMap, startDate, endDate);
  } else if (metric === EMetric.Sharpe) {
    value = sharpeRatio(phMap, startDate, endDate);
  } else if (metric === EMetric.Sortino) {
    value = sortinoRatio(phMap, startDate, endDate);
  } else if (metric === EMetric.Cagr) {
    value = cagr(phMap, startDate, endDate);
  } else {
    const benchMap = getDatePriceMap(benchData ?? []);

    if (metric === EMetric.DMC) {
      value = downMarketCapture(phMap, benchMap, startDate, endDate);
    } else {
      value = upMarketCapture(phMap, benchMap, startDate, endDate);
    }
  }

  if (isNull(value)) return null;

  return {value, startDate, endDate};
};
