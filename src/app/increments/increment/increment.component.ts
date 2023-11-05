import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, I18nPluralPipe } from '@angular/common';
import { IncrementForm } from '../../programs/generate-program/generate-program.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SubSink } from 'subsink';
import { CalendarModule } from 'primeng/calendar';
import { IncrementDescriptionPipe } from '../increment-description.pipe';
import { notEmpty } from '../../utils/typescript';
import dayjs from '../../shared/dayjs/dayjs';
import { SliderModule } from 'primeng/slider';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-increment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    I18nPluralPipe,
    DecimalPipe,
    IncrementDescriptionPipe,
    SliderModule,
  ],
  templateUrl: './increment.component.html',
  styleUrls: ['./increment.component.scss']
})
export class IncrementComponent implements OnInit, OnDestroy {

  @Input() incrementForm!: IncrementForm;

  durationIncrementStart?: Date;

  durationIncrementEnd?: Date;

  incline?: number;

  frequencyUnits = [
    {
      value: 'week',
      label: 'Week',
    },
    {
      value: 'session',
      label: 'Session',
    },
  ];

  subs = new SubSink();

  constructor(
    public layoutService: LayoutService,
  ) {}

  ngOnInit(): void {
    if (this.incrementForm.value.metric === 'duration' && notEmpty(this.incrementForm.value.increment)) {
      this.setDurationIncrement(this.incrementForm.value.increment);
    }

    if (this.incrementForm.value.metric === 'incline' && notEmpty(this.incrementForm.value.increment)) {
      this.setIncline(this.incrementForm.value.increment);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setDurationIncrement(duration: number) {

    const currentDate = dayjs().startOf('day');

    this.durationIncrementStart = currentDate.toDate();

    const dateWithDuration = currentDate.add(duration, 'second');

    this.durationIncrementEnd = dateWithDuration.toDate();
  }

  handleDurationChange() {
    const start = dayjs(this.durationIncrementStart);

    const end = dayjs(this.durationIncrementEnd);

    const increment = end.diff(start, 'second');

    this.incrementForm.controls.increment.setValue(increment);
  }

  setIncline(incline: number) {

    incline = incline * 100;

    if (Number.isNaN(incline)) {
      throw new Error('Incline is not a number');
    }

    if (incline > 100 || incline < 0) {
      throw new Error('Incline is out of range');
    }

    this.incline = incline;
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

    this.incrementForm.controls.increment.setValue(updatedIncline);
  }
}
