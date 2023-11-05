import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { DurationType, FrontendSchedule } from "../shared/types";
import { weeksBetweenDates } from "../utils/time";

interface ProgramForm {
  durationType: DurationType;
  startDate: string;
  endDate: string;
  baseSchedule: FrontendSchedule | null;
  weeks: number;
}

export function maxWorkouts(max: number): ValidatorFn {

  return (control: AbstractControl<ProgramForm>): ValidationErrors | null => {

    const { startDate, endDate, baseSchedule } = control.value;

    if (!baseSchedule) { return null; }

    let scheduleWorkouts = 0;

    let scheduleWeeks = 0;

    for (const week of baseSchedule.weeks) {
      scheduleWeeks++;
      scheduleWorkouts += week.workouts.length;
    }

    const workoutsPerWeek = scheduleWeeks ? scheduleWorkouts / scheduleWeeks : 0;

    let weeks = 0;

    if (control.value.weeks) {
      weeks = control.value.weeks;
    } else if (startDate && endDate) {
      weeks = weeksBetweenDates(startDate, endDate);
    }

    const workouts = weeks * workoutsPerWeek;

    return workouts > max ? { maxWorkouts: true } : null;
  };
}
