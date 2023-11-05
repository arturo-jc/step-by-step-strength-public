import { Pipe, PipeTransform } from '@angular/core';
import { Metric } from '../shared/types';
import { notEmpty } from '../utils/typescript';
import { FrequencyUnit } from '../programs/generate-program/generate-program.component';
import dayjs from '../shared/dayjs/dayjs';

@Pipe({
  name: 'incrementDescription',
  standalone: true
})
export class IncrementDescriptionPipe implements PipeTransform {

  transform(
    increment: number | null | undefined,
    frequency: number | null | undefined,
    frequencyUnit: FrequencyUnit | null | undefined,
    metric: Metric | null | undefined,
  ): string {

    if (!metric) { return '' }

    let output = `Increase ${metric} ${byHowMuch(metric, increment)} ${howOften(frequency, frequencyUnit)}`

    if (increment === 0 || frequency === 0) {
      output += ` (do not increase at all)`
    }

    return output;
  }

}

function byHowMuch(metric: Metric, increment: number | null | undefined) {

  if (metric === 'intensity') {
    return '';
  }

  if (metric === 'duration') {
    return `by ${formatDuration(increment)}`;
  }

  if (metric === 'incline') {
    increment = parseFloat(((increment || 0) * 100).toFixed(2));
  }

  const formatedIncrement = notEmpty(increment) ? increment : '____';

  return `by ${formatedIncrement}${getMetricSuffix(metric)}`;
}

function getMetricSuffix(metric: Metric) {
  switch (metric) {
    case 'incline':
      return '%';
    case 'duration':
      return ' mi';
    case 'weight':
      return ' lbs';
    case 'distance':
      return ' mi';
  }
  return '';
}

function formatDuration(duration: number | null | undefined) {

  if (duration === null || duration === undefined) {
    return '____';
  }

  if (duration === 0) {
    return '0 seconds';
  }

  const dayjsDuration = dayjs.duration(duration, 'seconds');

  const hours = dayjsDuration.hours();
  const minutes = dayjsDuration.minutes();
  const seconds = dayjsDuration.seconds();

  let output = `${seconds} seconds`;

  if (minutes > 0) {
    const formattedMinutes = minutes === 1 ? 'minute' : 'minutes';
    output = `${minutes} ${formattedMinutes} and ${output}`;
  }

  if (hours > 0) {
    const formattedHours = hours === 1 ? 'hour' : 'hours';
    output = `${hours} ${formattedHours}, ${output}`;
  }

  return output;
}

function howOften(
  frequency: number | null | undefined,
  frequencyUnit: FrequencyUnit | null | undefined,
) {

  const formattedFrequency = frequency === 1 ? '' : notEmpty(frequency) ? frequency.toString() : '____';

  const formattedFrequencyUnit = frequency === 1 ? frequencyUnit : `${frequencyUnit}s`;

  return `every ${formattedFrequency} ${formattedFrequencyUnit}`;
}
