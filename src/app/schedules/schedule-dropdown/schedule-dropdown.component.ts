import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { SchedulesService } from '../../services/schedules.service';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { WorkoutTemplatesService } from '../../services/workout-templates.service';
import { ScheduleDescriptionPipe } from '../schedule-description.pipe';
import { FrontendSchedule } from '../../shared/types';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ScheduleDescriptionPipe,
    ButtonModule,
  ],
  templateUrl: './schedule-dropdown.component.html',
  styleUrls: ['./schedule-dropdown.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: ScheduleDropdownComponent,
  }]
})
export class ScheduleDropdownComponent implements ControlValueAccessor {

  @Output() onSchedulesLoaded = new EventEmitter<FrontendSchedule[]>();

  selectedSchedule?: FrontendSchedule;

  touched = false;

  disabled = false;

  constructor(
    public schedulesService: SchedulesService,
    public workoutTemplatesService: WorkoutTemplatesService,
    private router: Router,
  ) {}

  onChange = (_schedule: FrontendSchedule) => {};

  onTouched = () => {};

  writeValue(schedule?: FrontendSchedule): void {
    this.selectedSchedule = schedule;
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabled(disabled: boolean) {
    this.disabled = disabled;
  }

  goToCreateSchedule(scheduleName: string | null | undefined) {
    this.router.navigate([ '/schedules', 'new' ], {
      state: {
        scheduleName,
      },
    });
  }
}
