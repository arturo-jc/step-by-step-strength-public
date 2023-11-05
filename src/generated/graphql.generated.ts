import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AuthCredentials = {
  email?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type AuthenticateOutput = {
  __typename?: 'AuthenticateOutput';
  profileUrl: Scalars['String']['output'];
  role: Role;
  userEmail: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export enum Category {
  Balance = 'BALANCE',
  Cardio = 'CARDIO',
  Core = 'CORE',
  Flexibility = 'FLEXIBILITY',
  Functional = 'FUNCTIONAL',
  Lowerbody = 'LOWERBODY',
  Plyometrics = 'PLYOMETRICS',
  Upperbody = 'UPPERBODY'
}

export type CreateExerciseInput = {
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  sets: Array<CreateProgramSetInput>;
};

export type CreateExerciseItemInput = {
  category: Category;
  exerciseType: Scalars['String']['input'];
  key?: InputMaybe<Scalars['String']['input']>;
  preset?: InputMaybe<Scalars['Boolean']['input']>;
  trackDistance?: InputMaybe<Scalars['Boolean']['input']>;
  trackDuration?: InputMaybe<Scalars['Boolean']['input']>;
  trackIncline?: InputMaybe<Scalars['Boolean']['input']>;
  trackIntensity?: InputMaybe<Scalars['Boolean']['input']>;
  trackReps?: InputMaybe<Scalars['Boolean']['input']>;
  trackWeight?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateExerciseTemplateInput = {
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  setTemplates: Array<CreateSetTemplateInput>;
};

export type CreateProgramInput = {
  name: Scalars['String']['input'];
  workouts: Array<CreateWorkoutInput>;
};

export type CreateProgramSetInput = {
  distance?: InputMaybe<Scalars['Float']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  exerciseType: Scalars['String']['input'];
  incline?: InputMaybe<Scalars['Float']['input']>;
  intensity?: InputMaybe<Intensity>;
  order: Scalars['Int']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateScheduleInput = {
  key?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  preset?: InputMaybe<Scalars['Boolean']['input']>;
  weeks: Array<CreateScheduleWeekInput>;
};

export type CreateScheduleWeekInput = {
  workouts: Array<CreateScheduleWorkoutInput>;
};

export type CreateScheduleWorkoutInput = {
  allDay?: InputMaybe<Scalars['Boolean']['input']>;
  dow?: InputMaybe<Scalars['Int']['input']>;
  end?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['String']['input']>;
  workoutTemplateId?: InputMaybe<Scalars['String']['input']>;
  workoutTemplateKey?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSetTemplateInput = {
  distance?: InputMaybe<Scalars['Float']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  exerciseItemId?: InputMaybe<Scalars['String']['input']>;
  exerciseItemKey?: InputMaybe<Scalars['String']['input']>;
  incline?: InputMaybe<Scalars['Float']['input']>;
  intensity?: InputMaybe<Intensity>;
  order: Scalars['Int']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateWorkoutInput = {
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  end: Scalars['String']['input'];
  exercises: Array<CreateExerciseInput>;
  name: Scalars['String']['input'];
  start: Scalars['String']['input'];
};

export type CreateWorkoutTemplateInput = {
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  exerciseTemplates: Array<CreateExerciseTemplateInput>;
  key?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  preset?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Exercise = {
  __typename?: 'Exercise';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  sets: Array<ProgramSet>;
};

export type ExerciseItem = {
  __typename?: 'ExerciseItem';
  active: Scalars['Boolean']['output'];
  category: Category;
  exerciseType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  key?: Maybe<Scalars['String']['output']>;
  preset: Scalars['Boolean']['output'];
  trackDistance: Scalars['Boolean']['output'];
  trackDuration: Scalars['Boolean']['output'];
  trackIncline: Scalars['Boolean']['output'];
  trackIntensity: Scalars['Boolean']['output'];
  trackReps: Scalars['Boolean']['output'];
  trackWeight: Scalars['Boolean']['output'];
};

export type ExerciseItemFilter = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  presetOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ExerciseTemplate = {
  __typename?: 'ExerciseTemplate';
  id: Scalars['String']['output'];
  key?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  setTemplates: Array<SetTemplate>;
};

export enum Intensity {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type Mutation = {
  __typename?: 'Mutation';
  _blank?: Maybe<Scalars['Boolean']['output']>;
  createExerciseItems: Array<ExerciseItem>;
  createPrograms: Array<Program>;
  createSchedules: Array<Schedule>;
  createWorkoutTemplates: Array<WorkoutTemplate>;
  deleteExerciseItems: Scalars['Boolean']['output'];
  deletePrograms: Scalars['Boolean']['output'];
  deleteSchedules: Scalars['Boolean']['output'];
  deleteWorkoutTemplates: Scalars['Boolean']['output'];
  deleteWorkouts: Scalars['Boolean']['output'];
  saveDrafts: Scalars['Boolean']['output'];
  signInWithGoogle: AuthenticateOutput;
  signUp: AuthenticateOutput;
  updateExerciseItems: Array<ExerciseItem>;
  updatePrograms: Array<Program>;
  updateSchedules: Array<Schedule>;
  updateWorkoutTemplates: Array<WorkoutTemplate>;
  updateWorkouts: Array<Workout>;
};


export type MutationCreateExerciseItemsArgs = {
  exerciseItems: Array<CreateExerciseItemInput>;
};


export type MutationCreateProgramsArgs = {
  programs: Array<CreateProgramInput>;
};


export type MutationCreateSchedulesArgs = {
  schedules: Array<CreateScheduleInput>;
};


export type MutationCreateWorkoutTemplatesArgs = {
  workoutTemplates: Array<CreateWorkoutTemplateInput>;
};


export type MutationDeleteExerciseItemsArgs = {
  exerciseItemIds: Array<Scalars['String']['input']>;
};


export type MutationDeleteProgramsArgs = {
  programIds: Array<Scalars['String']['input']>;
};


export type MutationDeleteSchedulesArgs = {
  scheduleIds: Array<Scalars['String']['input']>;
};


export type MutationDeleteWorkoutTemplatesArgs = {
  workoutTemplateIds: Array<Scalars['String']['input']>;
};


export type MutationDeleteWorkoutsArgs = {
  workoutIds: Array<Scalars['String']['input']>;
};


export type MutationSaveDraftsArgs = {
  drafts: SaveDraftsInput;
};


export type MutationSignInWithGoogleArgs = {
  idToken: Scalars['String']['input'];
};


export type MutationSignUpArgs = {
  credentials?: InputMaybe<AuthCredentials>;
};


export type MutationUpdateExerciseItemsArgs = {
  exerciseItems: Array<UpdateExerciseItemInput>;
};


export type MutationUpdateProgramsArgs = {
  programs: Array<UpdateProgramInput>;
};


export type MutationUpdateSchedulesArgs = {
  schedules: Array<UpdateScheduleInput>;
};


export type MutationUpdateWorkoutTemplatesArgs = {
  workoutTemplates: Array<UpdateWorkoutTemplateInput>;
};


export type MutationUpdateWorkoutsArgs = {
  workouts: Array<UpdateWorkoutInput>;
};

export type Program = {
  __typename?: 'Program';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  workouts: Array<Workout>;
};

export type ProgramSet = {
  __typename?: 'ProgramSet';
  distance?: Maybe<Scalars['Float']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  exerciseType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  incline?: Maybe<Scalars['Float']['output']>;
  intensity?: Maybe<Intensity>;
  order: Scalars['Int']['output'];
  reps?: Maybe<Scalars['Int']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
};

export type Query = {
  __typename?: 'Query';
  _blank?: Maybe<Scalars['Boolean']['output']>;
  authenticate?: Maybe<AuthenticateOutput>;
  exerciseItems: Array<Maybe<ExerciseItem>>;
  logIn: AuthenticateOutput;
  logOut: Scalars['Boolean']['output'];
  schedules: Array<Schedule>;
  user?: Maybe<User>;
  workoutTemplates: Array<WorkoutTemplate>;
};


export type QueryExerciseItemsArgs = {
  filter?: InputMaybe<ExerciseItemFilter>;
};


export type QueryLogInArgs = {
  credentials?: InputMaybe<AuthCredentials>;
};


export type QuerySchedulesArgs = {
  filter?: InputMaybe<SchedulesFilter>;
};


export type QueryUserArgs = {
  userId: Scalars['String']['input'];
};


export type QueryWorkoutTemplatesArgs = {
  filter?: InputMaybe<WorkoutTemplatesFilter>;
};

export enum Role {
  Admin = 'ADMIN',
  Superadmin = 'SUPERADMIN',
  User = 'USER'
}

export type SaveDraftsInput = {
  exerciseItems?: InputMaybe<Array<CreateExerciseItemInput>>;
  programs?: InputMaybe<Array<CreateProgramInput>>;
  schedules?: InputMaybe<Array<CreateScheduleInput>>;
  workoutTemplates?: InputMaybe<Array<CreateWorkoutTemplateInput>>;
};

export type Schedule = {
  __typename?: 'Schedule';
  active: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  key?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  preset: Scalars['Boolean']['output'];
  weeks: Array<ScheduleWeek>;
};

export type ScheduleWeek = {
  __typename?: 'ScheduleWeek';
  id: Scalars['String']['output'];
  workouts?: Maybe<Array<ScheduleWorkout>>;
};

export type ScheduleWorkout = {
  __typename?: 'ScheduleWorkout';
  allDay?: Maybe<Scalars['Boolean']['output']>;
  dow?: Maybe<Scalars['Int']['output']>;
  end?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  start?: Maybe<Scalars['String']['output']>;
  workoutTemplateId: Scalars['String']['output'];
};

export type SchedulesFilter = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  presetOnly?: InputMaybe<Scalars['Boolean']['input']>;
  scheduleIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SetTemplate = {
  __typename?: 'SetTemplate';
  category: Category;
  distance?: Maybe<Scalars['Float']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  exerciseItemId: Scalars['String']['output'];
  exerciseType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  incline?: Maybe<Scalars['Float']['output']>;
  intensity?: Maybe<Intensity>;
  order: Scalars['Int']['output'];
  reps?: Maybe<Scalars['Int']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
};

export type UpdateExerciseInput = {
  addSets?: InputMaybe<Array<CreateProgramSetInput>>;
  exerciseId: Scalars['String']['input'];
  removeSets?: InputMaybe<Array<Scalars['String']['input']>>;
  updateSets?: InputMaybe<Array<UpdateProgramSetInput>>;
};

export type UpdateExerciseItemInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  category?: InputMaybe<Category>;
  exerciseType?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};

export type UpdateExerciseTemplateInput = {
  addSetTemplates?: InputMaybe<Array<CreateSetTemplateInput>>;
  exerciseTemplateId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  removeSetTemplates?: InputMaybe<Array<Scalars['String']['input']>>;
  updateSetTemplates?: InputMaybe<Array<UpdateSetTemplateInput>>;
};

export type UpdateProgramInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  programId: Scalars['String']['input'];
  removeWorkouts?: InputMaybe<Array<Scalars['String']['input']>>;
  updateWorkouts?: InputMaybe<Array<UpdateWorkoutInput>>;
};

export type UpdateProgramSetInput = {
  distance?: InputMaybe<Scalars['Float']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  incline?: InputMaybe<Scalars['Float']['input']>;
  intensity?: InputMaybe<Intensity>;
  order: Scalars['Int']['input'];
  programSetId: Scalars['String']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateScheduleInput = {
  addWeeks?: InputMaybe<Array<CreateScheduleWeekInput>>;
  deleteWeeks?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  scheduleId: Scalars['String']['input'];
  updateWeeks?: InputMaybe<Array<UpdateScheduleWeekInput>>;
};

export type UpdateScheduleWeekInput = {
  addWorkouts?: InputMaybe<Array<CreateScheduleWorkoutInput>>;
  removeWorkouts?: InputMaybe<Array<Scalars['String']['input']>>;
  scheduleWeekId: Scalars['String']['input'];
  updateWorkouts?: InputMaybe<Array<UpdateScheduleWorkoutInput>>;
};

export type UpdateScheduleWorkoutInput = {
  allDay?: InputMaybe<Scalars['Boolean']['input']>;
  dow?: InputMaybe<Scalars['Int']['input']>;
  end?: InputMaybe<Scalars['String']['input']>;
  scheduleWorkoutId: Scalars['String']['input'];
  start?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSetTemplateInput = {
  distance?: InputMaybe<Scalars['Float']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  incline?: InputMaybe<Scalars['Float']['input']>;
  intensity?: InputMaybe<Intensity>;
  order?: InputMaybe<Scalars['Int']['input']>;
  reps?: InputMaybe<Scalars['Int']['input']>;
  setTemplateId: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateWorkoutInput = {
  end?: InputMaybe<Scalars['String']['input']>;
  removeExercises?: InputMaybe<Array<Scalars['String']['input']>>;
  start?: InputMaybe<Scalars['String']['input']>;
  updateExercises?: InputMaybe<Array<UpdateExerciseInput>>;
  workoutId: Scalars['String']['input'];
};

export type UpdateWorkoutTemplateInput = {
  addExerciseTemplates?: InputMaybe<Array<CreateExerciseTemplateInput>>;
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  removeExerciseTemplates?: InputMaybe<Array<Scalars['String']['input']>>;
  updateExerciseTemplates?: InputMaybe<Array<UpdateExerciseTemplateInput>>;
  workoutTemplateId: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  programs: Array<Program>;
  username?: Maybe<Scalars['String']['output']>;
};


export type UserProgramsArgs = {
  filter?: InputMaybe<UserProgramsFilter>;
};

export type UserProgramsFilter = {
  programIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Workout = {
  __typename?: 'Workout';
  backgroundColor?: Maybe<Scalars['String']['output']>;
  end: Scalars['String']['output'];
  exercises: Array<Exercise>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  start: Scalars['String']['output'];
};

export type WorkoutTemplate = {
  __typename?: 'WorkoutTemplate';
  active: Scalars['Boolean']['output'];
  backgroundColor?: Maybe<Scalars['String']['output']>;
  exerciseTemplates: Array<ExerciseTemplate>;
  id: Scalars['String']['output'];
  key?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  preset: Scalars['Boolean']['output'];
};

export type WorkoutTemplatesFilter = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  presetOnly?: InputMaybe<Scalars['Boolean']['input']>;
  workoutTemplateIds: Array<Scalars['String']['input']>;
};

export type LogInQueryVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LogInQuery = { __typename?: 'Query', logIn: { __typename?: 'AuthenticateOutput', userId: string, userEmail: string, username?: string | null, role: Role, profileUrl: string } };

export type AuthenticateQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthenticateQuery = { __typename?: 'Query', authenticate?: { __typename?: 'AuthenticateOutput', userId: string, userEmail: string, username?: string | null, role: Role, profileUrl: string } | null };

export type LogOutQueryVariables = Exact<{ [key: string]: never; }>;


export type LogOutQuery = { __typename?: 'Query', logOut: boolean };

export type SignUpMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'AuthenticateOutput', userId: string, userEmail: string, username?: string | null, role: Role, profileUrl: string } };

export type SignInWithGoogleMutationVariables = Exact<{
  idToken: Scalars['String']['input'];
}>;


export type SignInWithGoogleMutation = { __typename?: 'Mutation', signInWithGoogle: { __typename?: 'AuthenticateOutput', userId: string, userEmail: string, username?: string | null, role: Role, profileUrl: string } };

export type BaseAuthenticateOutputFragment = { __typename?: 'AuthenticateOutput', userId: string, userEmail: string, username?: string | null, role: Role, profileUrl: string };

export type SaveDraftsMutationVariables = Exact<{
  drafts: SaveDraftsInput;
}>;


export type SaveDraftsMutation = { __typename?: 'Mutation', saveDrafts: boolean };

export type CreateExerciseItemsMutationVariables = Exact<{
  exerciseItems: Array<CreateExerciseItemInput> | CreateExerciseItemInput;
}>;


export type CreateExerciseItemsMutation = { __typename?: 'Mutation', createExerciseItems: Array<{ __typename?: 'ExerciseItem', id: string, exerciseType: string, category: Category, preset: boolean, active: boolean, key?: string | null, trackWeight: boolean, trackReps: boolean, trackDuration: boolean, trackDistance: boolean, trackIntensity: boolean, trackIncline: boolean }> };

export type DeleteExerciseItemsMutationVariables = Exact<{
  exerciseItemIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteExerciseItemsMutation = { __typename?: 'Mutation', deleteExerciseItems: boolean };

export type UpdateExerciseItemsMutationVariables = Exact<{
  exerciseItems: Array<UpdateExerciseItemInput> | UpdateExerciseItemInput;
}>;


export type UpdateExerciseItemsMutation = { __typename?: 'Mutation', updateExerciseItems: Array<{ __typename?: 'ExerciseItem', id: string, exerciseType: string, category: Category, preset: boolean, active: boolean, key?: string | null, trackWeight: boolean, trackReps: boolean, trackDuration: boolean, trackDistance: boolean, trackIntensity: boolean, trackIncline: boolean }> };

export type ExerciseItemsQueryVariables = Exact<{
  fitler?: InputMaybe<ExerciseItemFilter>;
}>;


export type ExerciseItemsQuery = { __typename?: 'Query', exerciseItems: Array<{ __typename?: 'ExerciseItem', id: string, exerciseType: string, category: Category, preset: boolean, active: boolean, key?: string | null, trackWeight: boolean, trackReps: boolean, trackDuration: boolean, trackDistance: boolean, trackIntensity: boolean, trackIncline: boolean } | null> };

export type BaseExerciseItemFragment = { __typename?: 'ExerciseItem', id: string, exerciseType: string, category: Category, preset: boolean, active: boolean, key?: string | null, trackWeight: boolean, trackReps: boolean, trackDuration: boolean, trackDistance: boolean, trackIntensity: boolean, trackIncline: boolean };

export type FullExerciseTemplateFragment = { __typename?: 'ExerciseTemplate', id: string, name: string, order: number, setTemplates: Array<{ __typename?: 'SetTemplate', id: string, exerciseItemId: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> };

export type BaseExerciseTemplateFragment = { __typename?: 'ExerciseTemplate', id: string, name: string, order: number };

export type ExerciseTemplate_SetTemplatesFragment = { __typename?: 'ExerciseTemplate', setTemplates: Array<{ __typename?: 'SetTemplate', id: string, exerciseItemId: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> };

export type BaseExerciseFragment = { __typename?: 'Exercise', id: string, name: string, order: number };

export type Exercise_SetsFragment = { __typename?: 'Exercise', sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> };

export type FullExerciseFragment = { __typename?: 'Exercise', id: string, name: string, order: number, sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> };

export type FullProgramSetFragment = { __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null };

export type BaseProgramSetFragment = { __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null };

export type UserProgramsQueryVariables = Exact<{
  userId: Scalars['String']['input'];
  filter?: InputMaybe<UserProgramsFilter>;
}>;


export type UserProgramsQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, programs: Array<{ __typename?: 'Program', id: string, name: string, workouts: Array<{ __typename?: 'Workout', id: string, name: string, backgroundColor?: string | null, start: string, end: string, exercises: Array<{ __typename?: 'Exercise', id: string, name: string, order: number, sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> }> }> } | null };

export type CreateProgramsMutationVariables = Exact<{
  programs: Array<CreateProgramInput> | CreateProgramInput;
}>;


export type CreateProgramsMutation = { __typename?: 'Mutation', createPrograms: Array<{ __typename?: 'Program', id: string, name: string, workouts: Array<{ __typename?: 'Workout', id: string, name: string, backgroundColor?: string | null, start: string, end: string, exercises: Array<{ __typename?: 'Exercise', id: string, name: string, order: number, sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> }> }> };

export type UpdateProgramMutationVariables = Exact<{
  programs: Array<UpdateProgramInput> | UpdateProgramInput;
}>;


export type UpdateProgramMutation = { __typename?: 'Mutation', updatePrograms: Array<{ __typename?: 'Program', id: string, name: string, workouts: Array<{ __typename?: 'Workout', id: string, name: string, backgroundColor?: string | null, start: string, end: string, exercises: Array<{ __typename?: 'Exercise', id: string, name: string, order: number, sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> }> }> };

export type DeleteProgramsMutationVariables = Exact<{
  programIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteProgramsMutation = { __typename?: 'Mutation', deletePrograms: boolean };

export type User_ProgramsFragment = { __typename?: 'User', programs: Array<{ __typename?: 'Program', id: string, name: string, workouts: Array<{ __typename?: 'Workout', id: string, name: string, backgroundColor?: string | null, start: string, end: string, exercises: Array<{ __typename?: 'Exercise', id: string, name: string, order: number, sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> }> }> };

export type BaseProgramFragment = { __typename?: 'Program', id: string, name: string };

export type Program_WorkoutsFragment = { __typename?: 'Program', workouts: Array<{ __typename?: 'Workout', id: string, name: string, backgroundColor?: string | null, start: string, end: string, exercises: Array<{ __typename?: 'Exercise', id: string, name: string, order: number, sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> }> };

export type FullProgramFragment = { __typename?: 'Program', id: string, name: string, workouts: Array<{ __typename?: 'Workout', id: string, name: string, backgroundColor?: string | null, start: string, end: string, exercises: Array<{ __typename?: 'Exercise', id: string, name: string, order: number, sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> }> };

export type FullScheduleWeekFragment = { __typename?: 'ScheduleWeek', id: string, workouts?: Array<{ __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null }> | null };

export type BaseScheduleWeekFragment = { __typename?: 'ScheduleWeek', id: string, workouts?: Array<{ __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null }> | null };

export type ScheduleWeek_ScheduleWorkoutsFragment = { __typename?: 'ScheduleWeek', workouts?: Array<{ __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null }> | null };

export type FullScheduleWorkoutFragment = { __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null };

export type BaseScheduleWorkoutFragment = { __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null };

export type SchedulesQueryVariables = Exact<{
  filter?: InputMaybe<SchedulesFilter>;
}>;


export type SchedulesQuery = { __typename?: 'Query', schedules: Array<{ __typename?: 'Schedule', id: string, key?: string | null, name: string, preset: boolean, active: boolean, weeks: Array<{ __typename?: 'ScheduleWeek', id: string, workouts?: Array<{ __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null }> | null }> }> };

export type CreateSchedulesMutationVariables = Exact<{
  schedules: Array<CreateScheduleInput> | CreateScheduleInput;
}>;


export type CreateSchedulesMutation = { __typename?: 'Mutation', createSchedules: Array<{ __typename?: 'Schedule', id: string, key?: string | null, name: string, preset: boolean, active: boolean, weeks: Array<{ __typename?: 'ScheduleWeek', id: string, workouts?: Array<{ __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null }> | null }> }> };

export type UpdateScheduleMutationVariables = Exact<{
  schedules: Array<UpdateScheduleInput> | UpdateScheduleInput;
}>;


export type UpdateScheduleMutation = { __typename?: 'Mutation', updateSchedules: Array<{ __typename?: 'Schedule', id: string, key?: string | null, name: string, preset: boolean, active: boolean, weeks: Array<{ __typename?: 'ScheduleWeek', id: string, workouts?: Array<{ __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null }> | null }> }> };

export type DeleteSchedulesMutationVariables = Exact<{
  scheduleIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteSchedulesMutation = { __typename?: 'Mutation', deleteSchedules: boolean };

export type FullScheduleFragment = { __typename?: 'Schedule', id: string, key?: string | null, name: string, preset: boolean, active: boolean, weeks: Array<{ __typename?: 'ScheduleWeek', id: string, workouts?: Array<{ __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null }> | null }> };

export type BaseScheduleFragment = { __typename?: 'Schedule', id: string, key?: string | null, name: string, preset: boolean, active: boolean };

export type Schedule_ScheduleWeeksFragment = { __typename?: 'Schedule', weeks: Array<{ __typename?: 'ScheduleWeek', id: string, workouts?: Array<{ __typename?: 'ScheduleWorkout', id: string, workoutTemplateId: string, dow?: number | null, allDay?: boolean | null, start?: string | null, end?: string | null }> | null }> };

export type FullSetTemplateFragment = { __typename?: 'SetTemplate', id: string, exerciseItemId: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null };

export type BaseSetTemplateFragment = { __typename?: 'SetTemplate', id: string, exerciseItemId: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null };

export type BaseUserFragment = { __typename?: 'User', id: string };

export type WorkoutTemplatesQueryVariables = Exact<{
  filter?: InputMaybe<WorkoutTemplatesFilter>;
}>;


export type WorkoutTemplatesQuery = { __typename?: 'Query', workoutTemplates: Array<{ __typename?: 'WorkoutTemplate', id: string, name: string, backgroundColor?: string | null, key?: string | null, preset: boolean, active: boolean, exerciseTemplates: Array<{ __typename?: 'ExerciseTemplate', id: string, name: string, order: number, setTemplates: Array<{ __typename?: 'SetTemplate', id: string, exerciseItemId: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> }> };

export type CreateWorkoutTemplatesMutationVariables = Exact<{
  workoutTemplates: Array<CreateWorkoutTemplateInput> | CreateWorkoutTemplateInput;
}>;


export type CreateWorkoutTemplatesMutation = { __typename?: 'Mutation', createWorkoutTemplates: Array<{ __typename?: 'WorkoutTemplate', id: string, name: string, backgroundColor?: string | null, key?: string | null, preset: boolean, active: boolean, exerciseTemplates: Array<{ __typename?: 'ExerciseTemplate', id: string, name: string, order: number, setTemplates: Array<{ __typename?: 'SetTemplate', id: string, exerciseItemId: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> }> };

export type UpdateWorkoutTemplateMutationVariables = Exact<{
  workoutTemplates: Array<UpdateWorkoutTemplateInput> | UpdateWorkoutTemplateInput;
}>;


export type UpdateWorkoutTemplateMutation = { __typename?: 'Mutation', updateWorkoutTemplates: Array<{ __typename?: 'WorkoutTemplate', id: string, name: string, backgroundColor?: string | null, key?: string | null, preset: boolean, active: boolean, exerciseTemplates: Array<{ __typename?: 'ExerciseTemplate', id: string, name: string, order: number, setTemplates: Array<{ __typename?: 'SetTemplate', id: string, exerciseItemId: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> }> };

export type DeleteWorkoutTemplatesMutationVariables = Exact<{
  workoutTemplateIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type DeleteWorkoutTemplatesMutation = { __typename?: 'Mutation', deleteWorkoutTemplates: boolean };

export type FullWorkoutTemplateFragment = { __typename?: 'WorkoutTemplate', id: string, name: string, backgroundColor?: string | null, key?: string | null, preset: boolean, active: boolean, exerciseTemplates: Array<{ __typename?: 'ExerciseTemplate', id: string, name: string, order: number, setTemplates: Array<{ __typename?: 'SetTemplate', id: string, exerciseItemId: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> };

export type BaseWorkoutTemplateFragment = { __typename?: 'WorkoutTemplate', id: string, name: string, backgroundColor?: string | null, key?: string | null, preset: boolean, active: boolean };

export type WorkoutTemplate_ExerciseTemplatesFragment = { __typename?: 'WorkoutTemplate', exerciseTemplates: Array<{ __typename?: 'ExerciseTemplate', id: string, name: string, order: number, setTemplates: Array<{ __typename?: 'SetTemplate', id: string, exerciseItemId: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> };

export type BaseWorkoutFragment = { __typename?: 'Workout', id: string, name: string, backgroundColor?: string | null, start: string, end: string };

export type Workout_ExercisesFragment = { __typename?: 'Workout', exercises: Array<{ __typename?: 'Exercise', id: string, name: string, order: number, sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> };

export type FullWorkoutFragment = { __typename?: 'Workout', id: string, name: string, backgroundColor?: string | null, start: string, end: string, exercises: Array<{ __typename?: 'Exercise', id: string, name: string, order: number, sets: Array<{ __typename?: 'ProgramSet', id: string, exerciseType: string, reps?: number | null, weight?: number | null, order: number, duration?: number | null, distance?: number | null, intensity?: Intensity | null, incline?: number | null }> }> };

export const BaseAuthenticateOutputFragmentDoc = gql`
    fragment BaseAuthenticateOutput on AuthenticateOutput {
  userId
  userEmail
  username
  role
  profileUrl
}
    `;
export const BaseExerciseItemFragmentDoc = gql`
    fragment BaseExerciseItem on ExerciseItem {
  id
  exerciseType
  category
  preset
  active
  key
  trackWeight
  trackReps
  trackDuration
  trackDistance
  trackIntensity
  trackIncline
}
    `;
export const BaseProgramFragmentDoc = gql`
    fragment BaseProgram on Program {
  id
  name
}
    `;
export const BaseWorkoutFragmentDoc = gql`
    fragment BaseWorkout on Workout {
  id
  name
  backgroundColor
  start
  end
}
    `;
export const BaseExerciseFragmentDoc = gql`
    fragment BaseExercise on Exercise {
  id
  name
  order
}
    `;
export const BaseProgramSetFragmentDoc = gql`
    fragment BaseProgramSet on ProgramSet {
  id
  exerciseType
  reps
  weight
  order
  duration
  distance
  intensity
  incline
}
    `;
export const FullProgramSetFragmentDoc = gql`
    fragment FullProgramSet on ProgramSet {
  ...BaseProgramSet
}
    ${BaseProgramSetFragmentDoc}`;
export const Exercise_SetsFragmentDoc = gql`
    fragment Exercise_Sets on Exercise {
  sets {
    ...FullProgramSet
  }
}
    ${FullProgramSetFragmentDoc}`;
export const FullExerciseFragmentDoc = gql`
    fragment FullExercise on Exercise {
  ...BaseExercise
  ...Exercise_Sets
}
    ${BaseExerciseFragmentDoc}
${Exercise_SetsFragmentDoc}`;
export const Workout_ExercisesFragmentDoc = gql`
    fragment Workout_Exercises on Workout {
  exercises {
    ...FullExercise
  }
}
    ${FullExerciseFragmentDoc}`;
export const FullWorkoutFragmentDoc = gql`
    fragment FullWorkout on Workout {
  ...BaseWorkout
  ...Workout_Exercises
}
    ${BaseWorkoutFragmentDoc}
${Workout_ExercisesFragmentDoc}`;
export const Program_WorkoutsFragmentDoc = gql`
    fragment Program_Workouts on Program {
  workouts {
    ...FullWorkout
  }
}
    ${FullWorkoutFragmentDoc}`;
export const FullProgramFragmentDoc = gql`
    fragment FullProgram on Program {
  ...BaseProgram
  ...Program_Workouts
}
    ${BaseProgramFragmentDoc}
${Program_WorkoutsFragmentDoc}`;
export const User_ProgramsFragmentDoc = gql`
    fragment User_Programs on User {
  programs(filter: $filter) {
    ...FullProgram
  }
}
    ${FullProgramFragmentDoc}`;
export const BaseScheduleWorkoutFragmentDoc = gql`
    fragment BaseScheduleWorkout on ScheduleWorkout {
  id
  workoutTemplateId
  dow
  allDay
  start
  end
}
    `;
export const ScheduleWeek_ScheduleWorkoutsFragmentDoc = gql`
    fragment ScheduleWeek_ScheduleWorkouts on ScheduleWeek {
  workouts {
    ...BaseScheduleWorkout
  }
}
    ${BaseScheduleWorkoutFragmentDoc}`;
export const BaseScheduleWeekFragmentDoc = gql`
    fragment BaseScheduleWeek on ScheduleWeek {
  id
  ...ScheduleWeek_ScheduleWorkouts
}
    ${ScheduleWeek_ScheduleWorkoutsFragmentDoc}`;
export const FullScheduleWeekFragmentDoc = gql`
    fragment FullScheduleWeek on ScheduleWeek {
  ...BaseScheduleWeek
}
    ${BaseScheduleWeekFragmentDoc}`;
export const FullScheduleWorkoutFragmentDoc = gql`
    fragment FullScheduleWorkout on ScheduleWorkout {
  ...BaseScheduleWorkout
}
    ${BaseScheduleWorkoutFragmentDoc}`;
export const BaseScheduleFragmentDoc = gql`
    fragment BaseSchedule on Schedule {
  id
  key
  name
  preset
  active
}
    `;
export const Schedule_ScheduleWeeksFragmentDoc = gql`
    fragment Schedule_ScheduleWeeks on Schedule {
  weeks {
    ...BaseScheduleWeek
  }
}
    ${BaseScheduleWeekFragmentDoc}`;
export const FullScheduleFragmentDoc = gql`
    fragment FullSchedule on Schedule {
  ...BaseSchedule
  ...Schedule_ScheduleWeeks
}
    ${BaseScheduleFragmentDoc}
${Schedule_ScheduleWeeksFragmentDoc}`;
export const BaseSetTemplateFragmentDoc = gql`
    fragment BaseSetTemplate on SetTemplate {
  id
  exerciseItemId
  exerciseType
  reps
  weight
  order
  duration
  distance
  intensity
  incline
}
    `;
export const FullSetTemplateFragmentDoc = gql`
    fragment FullSetTemplate on SetTemplate {
  ...BaseSetTemplate
}
    ${BaseSetTemplateFragmentDoc}`;
export const BaseUserFragmentDoc = gql`
    fragment BaseUser on User {
  id
}
    `;
export const BaseWorkoutTemplateFragmentDoc = gql`
    fragment BaseWorkoutTemplate on WorkoutTemplate {
  id
  name
  backgroundColor
  key
  preset
  active
}
    `;
export const BaseExerciseTemplateFragmentDoc = gql`
    fragment BaseExerciseTemplate on ExerciseTemplate {
  id
  name
  order
}
    `;
export const ExerciseTemplate_SetTemplatesFragmentDoc = gql`
    fragment ExerciseTemplate_SetTemplates on ExerciseTemplate {
  setTemplates {
    ...BaseSetTemplate
  }
}
    ${BaseSetTemplateFragmentDoc}`;
export const FullExerciseTemplateFragmentDoc = gql`
    fragment FullExerciseTemplate on ExerciseTemplate {
  ...BaseExerciseTemplate
  ...ExerciseTemplate_SetTemplates
}
    ${BaseExerciseTemplateFragmentDoc}
${ExerciseTemplate_SetTemplatesFragmentDoc}`;
export const WorkoutTemplate_ExerciseTemplatesFragmentDoc = gql`
    fragment WorkoutTemplate_ExerciseTemplates on WorkoutTemplate {
  exerciseTemplates {
    ...FullExerciseTemplate
  }
}
    ${FullExerciseTemplateFragmentDoc}`;
export const FullWorkoutTemplateFragmentDoc = gql`
    fragment FullWorkoutTemplate on WorkoutTemplate {
  ...BaseWorkoutTemplate
  ...WorkoutTemplate_ExerciseTemplates
}
    ${BaseWorkoutTemplateFragmentDoc}
${WorkoutTemplate_ExerciseTemplatesFragmentDoc}`;
export const LogInDocument = gql`
    query LogIn($email: String!, $password: String!) {
  logIn(credentials: {email: $email, password: $password}) {
    ...BaseAuthenticateOutput
  }
}
    ${BaseAuthenticateOutputFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class LogInGQL extends Apollo.Query<LogInQuery, LogInQueryVariables> {
    override document = LogInDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const AuthenticateDocument = gql`
    query Authenticate {
  authenticate {
    ...BaseAuthenticateOutput
  }
}
    ${BaseAuthenticateOutputFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class AuthenticateGQL extends Apollo.Query<AuthenticateQuery, AuthenticateQueryVariables> {
    override document = AuthenticateDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const LogOutDocument = gql`
    query LogOut {
  logOut
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class LogOutGQL extends Apollo.Query<LogOutQuery, LogOutQueryVariables> {
    override document = LogOutDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SignUpDocument = gql`
    mutation SignUp($email: String!, $password: String!, $username: String) {
  signUp(credentials: {email: $email, password: $password, username: $username}) {
    ...BaseAuthenticateOutput
  }
}
    ${BaseAuthenticateOutputFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class SignUpGQL extends Apollo.Mutation<SignUpMutation, SignUpMutationVariables> {
    override document = SignUpDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SignInWithGoogleDocument = gql`
    mutation SignInWithGoogle($idToken: String!) {
  signInWithGoogle(idToken: $idToken) {
    ...BaseAuthenticateOutput
  }
}
    ${BaseAuthenticateOutputFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class SignInWithGoogleGQL extends Apollo.Mutation<SignInWithGoogleMutation, SignInWithGoogleMutationVariables> {
    override document = SignInWithGoogleDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SaveDraftsDocument = gql`
    mutation SaveDrafts($drafts: SaveDraftsInput!) {
  saveDrafts(drafts: $drafts)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class SaveDraftsGQL extends Apollo.Mutation<SaveDraftsMutation, SaveDraftsMutationVariables> {
    override document = SaveDraftsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateExerciseItemsDocument = gql`
    mutation CreateExerciseItems($exerciseItems: [CreateExerciseItemInput!]!) {
  createExerciseItems(exerciseItems: $exerciseItems) {
    ...BaseExerciseItem
  }
}
    ${BaseExerciseItemFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateExerciseItemsGQL extends Apollo.Mutation<CreateExerciseItemsMutation, CreateExerciseItemsMutationVariables> {
    override document = CreateExerciseItemsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteExerciseItemsDocument = gql`
    mutation DeleteExerciseItems($exerciseItemIds: [String!]!) {
  deleteExerciseItems(exerciseItemIds: $exerciseItemIds)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteExerciseItemsGQL extends Apollo.Mutation<DeleteExerciseItemsMutation, DeleteExerciseItemsMutationVariables> {
    override document = DeleteExerciseItemsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateExerciseItemsDocument = gql`
    mutation UpdateExerciseItems($exerciseItems: [UpdateExerciseItemInput!]!) {
  updateExerciseItems(exerciseItems: $exerciseItems) {
    ...BaseExerciseItem
  }
}
    ${BaseExerciseItemFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateExerciseItemsGQL extends Apollo.Mutation<UpdateExerciseItemsMutation, UpdateExerciseItemsMutationVariables> {
    override document = UpdateExerciseItemsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ExerciseItemsDocument = gql`
    query ExerciseItems($fitler: ExerciseItemFilter) {
  exerciseItems(filter: $fitler) {
    ...BaseExerciseItem
  }
}
    ${BaseExerciseItemFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ExerciseItemsGQL extends Apollo.Query<ExerciseItemsQuery, ExerciseItemsQueryVariables> {
    override document = ExerciseItemsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UserProgramsDocument = gql`
    query UserPrograms($userId: String!, $filter: UserProgramsFilter) {
  user(userId: $userId) {
    ...BaseUser
    ...User_Programs
  }
}
    ${BaseUserFragmentDoc}
${User_ProgramsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UserProgramsGQL extends Apollo.Query<UserProgramsQuery, UserProgramsQueryVariables> {
    override document = UserProgramsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateProgramsDocument = gql`
    mutation CreatePrograms($programs: [CreateProgramInput!]!) {
  createPrograms(programs: $programs) {
    ...FullProgram
  }
}
    ${FullProgramFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateProgramsGQL extends Apollo.Mutation<CreateProgramsMutation, CreateProgramsMutationVariables> {
    override document = CreateProgramsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateProgramDocument = gql`
    mutation UpdateProgram($programs: [UpdateProgramInput!]!) {
  updatePrograms(programs: $programs) {
    ...FullProgram
  }
}
    ${FullProgramFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateProgramGQL extends Apollo.Mutation<UpdateProgramMutation, UpdateProgramMutationVariables> {
    override document = UpdateProgramDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteProgramsDocument = gql`
    mutation DeletePrograms($programIds: [String!]!) {
  deletePrograms(programIds: $programIds)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteProgramsGQL extends Apollo.Mutation<DeleteProgramsMutation, DeleteProgramsMutationVariables> {
    override document = DeleteProgramsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SchedulesDocument = gql`
    query Schedules($filter: SchedulesFilter) {
  schedules(filter: $filter) {
    ...FullSchedule
  }
}
    ${FullScheduleFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class SchedulesGQL extends Apollo.Query<SchedulesQuery, SchedulesQueryVariables> {
    override document = SchedulesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateSchedulesDocument = gql`
    mutation CreateSchedules($schedules: [CreateScheduleInput!]!) {
  createSchedules(schedules: $schedules) {
    ...FullSchedule
  }
}
    ${FullScheduleFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateSchedulesGQL extends Apollo.Mutation<CreateSchedulesMutation, CreateSchedulesMutationVariables> {
    override document = CreateSchedulesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateScheduleDocument = gql`
    mutation UpdateSchedule($schedules: [UpdateScheduleInput!]!) {
  updateSchedules(schedules: $schedules) {
    ...FullSchedule
  }
}
    ${FullScheduleFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateScheduleGQL extends Apollo.Mutation<UpdateScheduleMutation, UpdateScheduleMutationVariables> {
    override document = UpdateScheduleDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteSchedulesDocument = gql`
    mutation DeleteSchedules($scheduleIds: [String!]!) {
  deleteSchedules(scheduleIds: $scheduleIds)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteSchedulesGQL extends Apollo.Mutation<DeleteSchedulesMutation, DeleteSchedulesMutationVariables> {
    override document = DeleteSchedulesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const WorkoutTemplatesDocument = gql`
    query WorkoutTemplates($filter: WorkoutTemplatesFilter) {
  workoutTemplates(filter: $filter) {
    ...FullWorkoutTemplate
  }
}
    ${FullWorkoutTemplateFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class WorkoutTemplatesGQL extends Apollo.Query<WorkoutTemplatesQuery, WorkoutTemplatesQueryVariables> {
    override document = WorkoutTemplatesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateWorkoutTemplatesDocument = gql`
    mutation CreateWorkoutTemplates($workoutTemplates: [CreateWorkoutTemplateInput!]!) {
  createWorkoutTemplates(workoutTemplates: $workoutTemplates) {
    ...FullWorkoutTemplate
  }
}
    ${FullWorkoutTemplateFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateWorkoutTemplatesGQL extends Apollo.Mutation<CreateWorkoutTemplatesMutation, CreateWorkoutTemplatesMutationVariables> {
    override document = CreateWorkoutTemplatesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateWorkoutTemplateDocument = gql`
    mutation UpdateWorkoutTemplate($workoutTemplates: [UpdateWorkoutTemplateInput!]!) {
  updateWorkoutTemplates(workoutTemplates: $workoutTemplates) {
    ...FullWorkoutTemplate
  }
}
    ${FullWorkoutTemplateFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateWorkoutTemplateGQL extends Apollo.Mutation<UpdateWorkoutTemplateMutation, UpdateWorkoutTemplateMutationVariables> {
    override document = UpdateWorkoutTemplateDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteWorkoutTemplatesDocument = gql`
    mutation DeleteWorkoutTemplates($workoutTemplateIds: [String!]!) {
  deleteWorkoutTemplates(workoutTemplateIds: $workoutTemplateIds)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteWorkoutTemplatesGQL extends Apollo.Mutation<DeleteWorkoutTemplatesMutation, DeleteWorkoutTemplatesMutationVariables> {
    override document = DeleteWorkoutTemplatesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }