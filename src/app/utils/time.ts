import dayjs from '../shared/dayjs/dayjs';

export function getCurrentTimeSecons() {
  return Math.floor(Date.now() / 1000);
}

export function getDateTime(
  dateString: string,
  eventDay: dayjs.Dayjs,
) {
  const [ hourString, minString, secString ] = dateString.split(':');
  return eventDay.hour(Number(hourString)).minute(Number(minString)).second(Number(secString));
}

export function weeksBetweenDates(date1: string, date2: string): number {
  const startDate = dayjs(date1);
  const endDate = dayjs(date2);

  const differenceInMilliseconds = endDate.diff(startDate);
  const differenceInWeeks = dayjs.duration(differenceInMilliseconds).asWeeks();

  return Math.abs(differenceInWeeks);
}
