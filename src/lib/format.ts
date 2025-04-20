export const formatNumber = (num: number) => parseFloat(num.toFixed(2)).toLocaleString();

export const formatPercentage = (num: number) => formatNumber(num) + '%';
