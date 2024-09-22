import dayjs, {type Dayjs} from 'dayjs';

const START_DATE = dayjs('2000-01-01');
const START_DATE_STR = START_DATE.format('YYYY-MM-DD');
const FORMAT = 'YYYY-MM-DD';

export const getDateStr = (date: Dayjs) => date.format(FORMAT);
export const isDateWithinRange = (dateStr: string) => dateStr.startsWith('2');

const _dayWiseDates: string[] = [];

const getDayWiseDates = () => {
  if (_dayWiseDates.length > 0) return _dayWiseDates;

  const today = dayjs();

  for (let date = START_DATE; date.isBefore(today); date = date.add(1, 'day')) {
    _dayWiseDates.push(date.format(FORMAT));
  }
  return _dayWiseDates;
};

const _dayWiseDiffs = new Map<string, number>();

const getDayWiseDiff = (date1: string, date2: string) => {
  const key = `${date1}-${date2}`;

  if (_dayWiseDiffs.has(key)) {
    return _dayWiseDiffs.get(key) as number;
  }

  const diff = dayjs(date1).diff(dayjs(date2), 'days');

  _dayWiseDiffs.set(key, diff);

  return diff;
};

const getDayWiseIndex = (dateStr: string) => getDayWiseDiff(dateStr, START_DATE_STR);

const _monthWiseDates: string[] = [];

const getMonthWiseDates = () => {
  if (_monthWiseDates.length > 0) return _monthWiseDates;

  const today = dayjs();

  for (let date = START_DATE; date.isBefore(today); date = date.add(1, 'month')) {
    _monthWiseDates.push(date.format(FORMAT));
  }

  return _monthWiseDates;
};

const getMonthWiseIndex = (dateStr: string) => {
  const date = dayjs(dateStr);

  return date.diff(START_DATE, 'month');
};

export const dates = {
  get dayWise() {
    return getDayWiseDates();
  },
  dayWiseIndex: getDayWiseIndex,
  dayWiseDiff: getDayWiseDiff,
  get monthWise() {
    return getMonthWiseDates();
  },
  monthWiseIndex: getMonthWiseIndex,
};

export const datesData = {_dayWiseDates, _dayWiseDiffs, _monthWiseDates};
