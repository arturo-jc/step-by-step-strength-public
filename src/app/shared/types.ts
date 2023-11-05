import {
    Exercise,
  ExerciseTemplate,
  Program,
  ProgramSet,
  Schedule,
  ScheduleWorkout,
  SetTemplate,
  Workout,
  WorkoutTemplate,
} from "../../generated/graphql.types";

export type BaseSetTemplate = Pick<SetTemplate,
| 'order'
| 'exerciseType'
| 'reps'
| 'weight'
| 'duration'
| 'distance'
| 'intensity'
| 'incline'
>;

export interface FrontendSetTemplate extends BaseSetTemplate {
  id?: string;
  exerciseItemKey: string;
};

export type BaseExerciseTemplate = Pick<ExerciseTemplate, 'name' | 'order'>;

export interface FrontendExerciseTemplate extends BaseExerciseTemplate {
  id?: string;
  key: string;
  setTemplates: FrontendSetTemplate[];
};

export type BaseWorkoutTemplate = Pick<WorkoutTemplate, 'name' | 'backgroundColor' | 'preset'>;

export interface FrontendWorkoutTemplate extends BaseWorkoutTemplate {
  id?: string;
  key: string;
  exerciseTemplates: FrontendExerciseTemplate[];
}

export type MutateWorkoutTemplateInput = Pick<FrontendWorkoutTemplate, 'name' | 'backgroundColor' | 'exerciseTemplates'>;

export type BaseScheduleWorkout = Pick<ScheduleWorkout,
| 'start'
| 'end'
| 'allDay'
| 'dow'
>;

export interface FrontendScheduleWorkout extends BaseScheduleWorkout {
  id?: string;
  workoutTemplateKey: string;
  key?: string;
  workoutTemplateId?: string;
}

export type BaseSchedule = Pick<Schedule, 'name' | 'preset'>;

export interface FrontendScheduleWeek {
  id?: string;
  workouts: FrontendScheduleWorkout[];
}

export interface FrontendSchedule extends BaseSchedule {
  id?: string;
  key: string;
  weeks: FrontendScheduleWeek[];
}

export type MutateScheduleInput = Pick<FrontendSchedule, 'name' | 'weeks'>;

export type BaseProgramSet = Pick<ProgramSet,
| 'exerciseType'
| 'reps'
| 'weight'
| 'order'
| 'duration'
| 'distance'
| 'intensity'
| 'incline'
>

export interface FrontendProgramSet extends BaseProgramSet {
  id?: string;
}

export type BaseExercise = Pick<Exercise, 'name' | 'order'>;

export interface FrontendExercise extends BaseExercise {
  id?: string;
  key: string;
  sets: FrontendProgramSet[];
}

export type BaseProgram = Pick<Program, 'name'>;

export interface FrontendProgram extends BaseProgram {
  id?: string;
  key: string;
  workouts: FrontendWorkout[];
}

export type MutateProgramInput = Pick<FrontendProgram, 'name' | 'workouts' | 'id'>;


export type BaseWorkout = Pick<Workout, 'name' | 'start' | 'end' | 'backgroundColor'>;

export interface FrontendWorkout extends BaseWorkout {
  id?: string;
  key: string;
  exercises: FrontendExercise[];
}

export type Increment = {
  exerciseItemKey: string;
  increment: number;
  frequency: number;
  frequencyUnit: 'week' | 'session';
  metric: Metric;
};

export type DurationType = 'weeks' | 'endDate';

export interface ProgramFormData {
  name: string | null | undefined;
  baseSchedule: FrontendSchedule | null | undefined;
  durationType: DurationType | null | undefined;
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  weeks: number | null | undefined;
  increments: Increment[];
}

export type Metric = keyof Omit<FrontendSetTemplate, 'id' | 'exerciseType' | 'exerciseItemKey' | 'order'>;
