/**
XIRR Calculation Logic: https://github.com/apache/openoffice/blob/62728d68bb0c5a8ce9034780f07b19c996d60277/main/scaddins/source/analysis/financial.cxx#L525
*/

/* eslint-disable max-depth */

import {dates} from '$lib/dates';

const MAX_EPSILON = 1e-10;
const MAX_ITERATIONS = 50;

export interface XIRREntry {
  value: number;
  date: string;
}

const isNumberValid = (num: number) => !isNaN(num) && num !== Infinity && num !== -Infinity;

const getIRRResult = (data: XIRREntry[], rate: number): number => {
  const firstEntry = data[0];

  let result = firstEntry.value;
  let firstIterDone = false;

  for (const entry of data) {
    if (!firstIterDone) {
      firstIterDone = true;
      continue;
    }

    const daysFromFirst = dates.dayWiseDiff(entry.date, firstEntry.date);

    result += entry.value / Math.pow(rate + 1, daysFromFirst / 365);
  }

  return result;
};

const getIRRResultDerivative = (data: XIRREntry[], rate: number): number => {
  const firstEntry = data[0];

  let result = 0;
  let firstIterDone = false;

  for (const entry of data) {
    if (!firstIterDone) {
      firstIterDone = true;
      continue;
    }

    const daysFromFirst = dates.dayWiseDiff(entry.date, firstEntry.date);
    const fraction = daysFromFirst / 365;

    result -= (fraction * entry.value) / Math.pow(rate + 1, fraction + 1);
  }

  return result;
};

/**
 * Use Newton's method to find a solution for rate
 */
export const calcXIRR = (data: XIRREntry[], guess = 0.1) => {
  let hasPositive = false;
  let hasNegative = false;

  for (const entry of data) {
    if (entry.value > 0) hasPositive = true;
    if (entry.value < 0) hasNegative = true;
  }

  if (!hasPositive || !hasNegative) return null;

  for (let x = -1; x < 1; x += 0.01) {
    // first trial is done using `guess`, then values -0.99, -0.98, -0.97, ... 0.99 are used
    const startingRate = x === -1 ? guess : x;

    for (let iter = 0, rate = startingRate; iter < MAX_ITERATIONS; iter++) {
      const resultValue = getIRRResult(data, rate);
      const deriv = getIRRResultDerivative(data, rate);
      const newRate = rate - resultValue / deriv;
      const epsRate = Math.abs(newRate - rate);

      rate = newRate;

      if (epsRate <= MAX_EPSILON || Math.abs(resultValue) <= MAX_EPSILON) {
        if (isNumberValid(rate) && isNumberValid(resultValue)) {
          return rate;
        }

        break;
      }
    }
  }

  return null;
};

/* eslint-enable */
