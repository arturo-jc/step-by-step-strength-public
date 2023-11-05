import { Pipe, PipeTransform } from '@angular/core';
import { FullCalendarService } from '../services/full-calendar.service';
import { FrontendWorkoutTemplate } from '../shared/types';

@Pipe({
  name: 'workoutTemplateData',
  standalone: true
})
export class WorkoutTemplateDataPipe implements PipeTransform {

  constructor(private fullCalendar: FullCalendarService) {}

  transform(workoutTemplate: FrontendWorkoutTemplate): string {
    return JSON.stringify(this.fullCalendar.getEventInput(workoutTemplate));
  }
}
