import {isNull} from './type';

export const min = (data: number[]) => {
  if (data.length === 0) return null;

  let minNum = data[0];

  for (const num of data) {
    if (num < minNum) {
      minNum = num;
    }
  }

  return minNum;
};

export const max = (data: number[]) => {
  if (data.length === 0) return null;

  let maxNum = data[0];

  for (const num of data) {
    if (num > maxNum) {
      maxNum = num;
    }
  }

  return maxNum;
};

export const average = (data: number[]) => {
  if (data.length === 0) return null;

  let sum = 0;
  let count = 0;

  for (const num of data) {
    sum += num;
    count++;
  }

  return sum / count;
};

export const median = (data: number[]) => {
  if (data.length === 0) return null;

  const sortedData = data.toSorted((num1, num2) => num1 - num2);

  if (sortedData.length % 2 === 1) {
    return sortedData[Math.floor(sortedData.length / 2)];
  }

  const num1 = sortedData[sortedData.length / 2 - 1];
  const num2 = sortedData[sortedData.length / 2];

  return (num1 + num2) / 2;
};

export const stdDev = (data: number[]) => {
  if (data.length === 0) return null;

  const avg = average(data);

  if (isNull(avg)) return null;

  let sum = 0;
  let count = 0;

  for (const num of data) {
    sum += Math.pow(num - avg, 2);
    count++;
  }

  return Math.sqrt(sum / count);
};
