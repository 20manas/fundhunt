import dayjs, {type Dayjs} from 'dayjs';

const DATE_FORMAT = 'YYYY-MM-DD';

const START_DATE = dayjs('2000-01-01');
const START_DATE_STR = START_DATE.format(DATE_FORMAT);

export const getDateStr = (date: Dayjs) => date.format(DATE_FORMAT);
export const isDateWithinRange = (dateStr: string) => dateStr.startsWith('2');

const _dayDates: string[] = [];

const getDayDates = () => {
  if (_dayDates.length > 0) return _dayDates;

  const today = dayjs();

  for (let date = START_DATE; date.isBefore(today); date = date.add(1, 'day')) {
    _dayDates.push(date.format(DATE_FORMAT));
  }
  return _dayDates;
};

const _dayDiffMap = new Map<string, number>();

const getDayDiff = (date1: string, date2: string) => {
  const key = `${date1}-${date2}`;

  if (_dayDiffMap.has(key)) {
    return _dayDiffMap.get(key) as number;
  }

  const diff = dayjs(date1).diff(dayjs(date2), 'days');

  _dayDiffMap.set(key, diff);

  return diff;
};

const getDayIndex = (dateStr: string) => getDayDiff(dateStr, START_DATE_STR);

const _startOfMonthDates: string[] = [];
const _endOfMonthDates: string[] = [];

const getStartOfMonthDates = () => {
  if (_startOfMonthDates.length > 0) return _startOfMonthDates;

  const today = dayjs();

  for (let date = START_DATE; !date.isAfter(today); date = date.add(1, 'month')) {
    _startOfMonthDates.push(date.format(DATE_FORMAT));
  }

  return _startOfMonthDates;
};

const getEndOfMonthDates = () => {
  if (_endOfMonthDates.length > 0) return _endOfMonthDates;

  const today = dayjs().endOf('month');

  for (let date = START_DATE.endOf('month'); !date.isAfter(today); date = date.add(1, 'month').endOf('month')) {
    _endOfMonthDates.push(date.format(DATE_FORMAT));
  }

  return _endOfMonthDates;
};

const getStartOfMonthIndex = (dateStr: string, isMinimum = false) => {
  const date = dayjs(dateStr);

  const index = date.diff(START_DATE, 'month');

  if (_startOfMonthDates.length > 0 && (index < 0 || index >= _startOfMonthDates.length)) {
    console.error(
      'start month out of range',
      `date: ${dateStr}`,
      `index: ${index}`,
      `array length: ${_startOfMonthDates.length}`,
      `last date: ${_startOfMonthDates[_startOfMonthDates.length - 1]}`,
    );
  }

  if (isMinimum && !dateStr.endsWith('01')) {
    return index + 1;
  }

  return index;
};

const getEndOfMonthIndex = (dateStr: string, isMaximum = false) => {
  const date = dayjs(dateStr);

  const index = date.diff(START_DATE, 'month');

  if (_endOfMonthDates.length > 0 && (index < 0 || index >= _endOfMonthDates.length)) {
    console.error(
      'end month out of range',
      `date: ${dateStr}`,
      `index: ${index}`,
      `array length: ${_endOfMonthDates.length}`,
      `last date: ${_endOfMonthDates[_endOfMonthDates.length - 1]}`,
    );
  }

  if (isMaximum && !date.isSame(date.endOf('month'))) {
    return index - 1;
  }

  return index;
};

export const dates = {
  day: {
    get array() {
      return getDayDates();
    },
    getIndex: getDayIndex,
    diff: getDayDiff,
  },
  startOfMonth: {
    get array() {
      return getStartOfMonthDates();
    },
    getIndex: getStartOfMonthIndex,
  },
  endOfMonth: {
    get array() {
      return getEndOfMonthDates();
    },
    getIndex: getEndOfMonthIndex,
  },
  min: (...dates: string[]) =>
    getDateStr(
      dates.reduce((minDate, dateStr) => {
        const date = dayjs(dateStr);
        return date.isBefore(minDate) ? date : minDate;
      }, dayjs(dates[0])),
    ),
  max: (...dates: string[]) =>
    getDateStr(
      dates.reduce((maxDate, dateStr) => {
        const date = dayjs(dateStr);
        return date.isAfter(maxDate) ? date : maxDate;
      }, dayjs(dates[0])),
    ),
};
