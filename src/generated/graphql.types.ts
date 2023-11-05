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
