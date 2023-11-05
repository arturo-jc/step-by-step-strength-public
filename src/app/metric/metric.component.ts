import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { Metric } from '../shared/types';
import { notEmpty } from '../utils/typescript';
import dayjs from '../shared/dayjs/dayjs';
import { Intensity } from '../../generated/graphql.generated';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { INTENSITY_MAP } from '../global';
import { getNextIntensity } from '../utils/metric';

@Component({
  selector: 'app-metric',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    FormsModule,
    InputNumberModule,
    CalendarModule,
    SliderModule,
  ],
  templateUrl: './metric.component.html',
  styleUrls: ['./metric.component.scss']
})
export class MetricComponent implements OnInit {

  @Input() metric?: Metric;

  @Input() value?: any;

  @Output() valueChange = new EventEmitter();

  @Input() editMode = false;

  readOnlyDuration?: string;

  editDurationStart?: Date;

  editDurationEnd?: Date;

  intensityMap = INTENSITY_MAP;

  incline?: number;

  ngOnInit(): void {
    if (this.metric === 'duration' && notEmpty(this.value)) {
      this.setDuration();
    }
    if (this.metric === 'incline' && notEmpty(this.value)) {
      this.setIncline();
    }
  }

  setDuration() {

    if (this.editMode) {

      const currentDate = dayjs().startOf('day');

      this.editDurationStart = currentDate.toDate();

      const dateWithDuration = currentDate.add(this.value, 'second');

      this.editDurationEnd = dateWithDuration.toDate();

    } else {

      const duration = dayjs.duration(this.value, 'seconds');

      const hours = duration.hours().toString().padStart(2, '0');
      const minutes = duration.minutes().toString().padStart(2, '0');
      const seconds = duration.seconds().toString().padStart(2, '0');

      this.readOnlyDuration = `${hours}:${minutes}:${seconds}`;
    }
  }

  setIncline() {
    const incline = this.value * 100;

    if (Number.isNaN(incline)) {
      throw new Error('Incline is not a number');
    }

    if (incline > 100 || incline < 0) {
      throw new Error('Incline is out of range');
    }

    this.incline = incline;
  }

  get intensity() {
    return this.value as Intensity;
  }

  getDefaultValue() {
    switch (this.metric) {
      case 'intensity':
        return Intensity.Low;
      default:
        return 0;
    }
  }

  toggleIntensity() {

    this.value = getNextIntensity(this.intensity, true);

    this.handleValueChange(this.value);
  }

  handleDurationChange() {

    const start = dayjs(this.editDurationStart);

    const end = dayjs(this.editDurationEnd);

    const duration = end.diff(start, 'second');

    this.value = duration;

    this.handleValueChange(duration);
  }

  handleInclineChange() {

    if (this.incline === undefined || this.incline === null) {
      throw new Error('Incline is undefined or null');
    }

    let updatedIncline = this.incline / 100;

    if (Number.isNaN(updatedIncline)) {
      throw new Error('Incline is not a number');
    }

    updatedIncline = Math.min(updatedIncline, 1);

    updatedIncline = Math.max(updatedIncline, 0);

    if (updatedIncline > 1 || updatedIncline < 0) {
      throw new Error('Incline is out of range');
    }

    this.value = updatedIncline;

    this.handleValueChange(updatedIncline);
  }

  handleValueChange(value: any) {
    if (notEmpty(value)) {
      this.valueChange.emit(value);
    } else {
      this.value = this.getDefaultValue();
      this.valueChange.emit(this.value);
    }
  }

}
