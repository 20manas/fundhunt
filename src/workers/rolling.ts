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

  const startIndex = dates.endOfMonth.getIndex(startDate);
  const endIndex = dates.endOfMonth.getIndex(endDate, true);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years').endOf('month'));

    data.push({
      date,
      value: xirr(phMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingSd = (phMap: TDatePriceMap, startDate: string, endDate: string, period: number) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.endOfMonth.getIndex(startDate) + 1;
  const endIndex = dates.endOfMonth.getIndex(endDate, true);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years').endOf('month'));

    data.push({
      date,
      value: sd(phMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingDd = (phMap: TDatePriceMap, startDate: string, endDate: string, period: number, mar: number) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.endOfMonth.getIndex(startDate) + 1;
  const endIndex = dates.endOfMonth.getIndex(endDate, true);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years').endOf('month'));

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

  const startIndex = dates.endOfMonth.getIndex(startDate) + 1;
  const endIndex = dates.endOfMonth.getIndex(endDate, true);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years').endOf('month'));

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

  const startIndex = dates.endOfMonth.getIndex(startDate) + 1;
  const endIndex = dates.endOfMonth.getIndex(endDate, true);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years').endOf('month'));

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

  const startIndex = dates.endOfMonth.getIndex(startDate) + 1;
  const endIndex = dates.endOfMonth.getIndex(endDate, true);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years').endOf('month'));

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

  const startIndex = dates.endOfMonth.getIndex(startDate) + 1;
  const endIndex = dates.endOfMonth.getIndex(endDate, true);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years').endOf('month'));

    data.push({
      date,
      value: upMarketCapture(phMap, benchMap, periodStart, periodEnd),
    });
  }

  return data;
};

const rollingCagr = (phMap: TDatePriceMap, startDate: string, endDate: string, period: number) => {
  const data: ReturnType<TRollingReturns> = [];

  const startIndex = dates.endOfMonth.getIndex(startDate);
  const endIndex = dates.endOfMonth.getIndex(endDate, true);

  for (let index = startIndex; index <= endIndex; index++) {
    const date = dates.endOfMonth.array[index];

    const periodEnd = date;
    const periodStart = getDateStr(dayjs(date).subtract(period, 'years').endOf('month'));

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

    const {min: startDateBench, max: endDateBench} = getPriceHistoryDateRange(options.benchmark ?? []);

    const startDateMax = dates.max(startDate, startDateBench);
    const endDateMin = dates.min(endDate, endDateBench);

    if (options.metric === EMetric.DMC) {
      return rollingDownMarketCapture(phMap, benchMap, startDateMax, endDateMin, period);
    } else {
      return rollingUpMarketCapture(phMap, benchMap, startDateMax, endDateMin, period);
    }
  }
};

export const allTimeReturns: TAlltimeReturns = (phData, options) => {
  if (phData.length === 0) return null;

  const phMap = getDatePriceMap(phData);

  const {min: startDate, max: endDate} = getPriceHistoryDateRange(phData);

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

    const {min: startDateBench, max: endDateBench} = getPriceHistoryDateRange(options.benchmark ?? []);

    const startDateMax = dates.max(startDate, startDateBench);
    const endDateMin = dates.min(endDate, endDateBench);

    if (options.metric === EMetric.DMC) {
      value = downMarketCapture(phMap, benchMap, startDateMax, endDateMin);
    } else {
      value = upMarketCapture(phMap, benchMap, startDateMax, endDateMin);
    }
  }

  if (isNull(value)) return null;

  return {value, startDate, endDate};
};
