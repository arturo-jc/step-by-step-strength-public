import { Pipe, PipeTransform } from '@angular/core';
import { FrontendSchedule, FrontendWorkoutTemplate } from '../shared/types';

@Pipe({
  name: 'scheduleDescription',
  standalone: true
})
export class ScheduleDescriptionPipe implements PipeTransform {

  transform(
    schedule: FrontendSchedule,
    workoutTemplates: FrontendWorkoutTemplate[] | null,
    maxWorkouts = 3,
    maxDaysPerWorkout = 2,
  ): unknown {

    if (workoutTemplates === null) {
      return '';
    }

    const dows: Record<number, string[]> = {};

    const workouts: Record<string, { name: string; dows: number[] }> = {};

    const scheduleWorkouts = schedule.weeks.flatMap(week => week.workouts);

    for (const workout of scheduleWorkouts) {

      const workoutTemplate = workoutTemplates.find(wt => wt.key === workout.workoutTemplateKey);

      if (!workoutTemplate) {
        console.warn(`Workout template not found for key ${ workout.workoutTemplateKey }`);
        continue;
      }

      if (workout.dow === null || workout.dow === undefined) { continue; }

      dows[workout.dow] = dows[workout.dow] || [];
      dows[workout.dow].push(workoutTemplate.name);

      if (!workouts[workoutTemplate.key]) {
        workouts[workoutTemplate.key] = {
          name: workoutTemplate.name,
          dows: [],
        };
      }

      if (!workouts[workoutTemplate.key].dows.includes(workout.dow)) {
        workouts[workoutTemplate.key].dows.push(workout.dow);
      }
    }

    const workoutDescriptions: string[] = [];

    if (schedule.weeks.length > 1) {
      workoutDescriptions.push(`${ schedule.weeks.length } weeks`);
    }

    for (const workout of Object.values(workouts)) {

      if (workoutDescriptions.length >= maxWorkouts) { break; }

      let description: string;

      if (workout.dows.length > maxDaysPerWorkout) {
        description = `${ workout.name } on ${ workout.dows.length } days`;
      } else {
        description = `${ workout.name } on ${ workout.dows.map(dow => this.dowToString(dow)).join(', ') }`;
      }

      workoutDescriptions.push(description);
    }

    const remaining = Object.values(workouts).length - maxWorkouts;

    if (remaining > 0) {
      workoutDescriptions.push(`and ${ remaining } more`);
    }

    return workoutDescriptions.join(', ');
  }

  dowToString(dow: number): string {
    return [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ][dow];
  }

}
