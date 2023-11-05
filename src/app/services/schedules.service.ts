import { Injectable } from '@angular/core';
import {
  CreateScheduleInput,
  CreateScheduleWeekInput,
  CreateScheduleWorkoutInput,
  CreateSchedulesGQL,
  CreateSchedulesMutationVariables,
  DeleteSchedulesGQL,
  FullScheduleFragment,
  FullScheduleWeekFragment,
  FullScheduleWorkoutFragment,
  Maybe,
  SchedulesGQL,
  SchedulesQuery,
  SchedulesQueryVariables,
  UpdateScheduleGQL,
  UpdateScheduleMutationVariables,
  UpdateScheduleWeekInput,
  UpdateScheduleWorkoutInput,
} from '../../generated/graphql.generated';
import {
  BehaviorSubject,
  catchError,
  filter,
  firstValueFrom,
  map,
  of,
  share,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';
import { WorkoutTemplatesService } from './workout-templates.service';
import { cloneDeep, partition, uniq } from 'lodash-es';
import { notEmpty, throwIfUndefined } from '../utils/typescript';
import { replaceElementsById } from '../utils/arrays';
import { QueryRef } from 'apollo-angular';
import { ToastsService } from './toasts.service';
import { ExerciseItemsService } from './exercise-items.service';
import {
  FrontendSchedule,
  FrontendScheduleWeek,
  FrontendScheduleWorkout,
  FrontendWorkoutTemplate,
  MutateScheduleInput,
} from '../shared/types';
import { LayoutService } from './layout.service';
  
@Injectable({
  providedIn: 'root'
})
export class SchedulesService {

  userId?: string | null;

  constructor(
    private exerciseItemsService: ExerciseItemsService,
    private workoutTemplates: WorkoutTemplatesService,
    private schedulesGQL: SchedulesGQL,
    private createSchedulesGQL: CreateSchedulesGQL,
    private updateSchedulesGQL: UpdateScheduleGQL,
    private deleteSchedulesGQL: DeleteSchedulesGQL,
    private toastsService: ToastsService,
    private layoutService: LayoutService,
  ) { }

  _currentKey = 0;

  _schedules = new BehaviorSubject<FrontendSchedule[]>([]);

  schedules$ = this._schedules.asObservable();

  schedulesQuery?: QueryRef<SchedulesQuery, SchedulesQueryVariables>;

  drafts$ = this.schedules$.pipe(
    map(schedules => schedules.filter(s => !s.id)),
    withLatestFrom(this.workoutTemplates.workoutTemplates$),
    map(([ schedules, workoutTemplates ]) => this.getCreateScheduleInput(schedules, workoutTemplates, true)),
  );

  get currentKey() {
    const key = this._currentKey.toString();
    this._currentKey++;
    return key;
  }

  init() {
    this.handleDeleteWorkoutTemplate();
    this.handleExerciseItemsDeleted();
    return this.fetchSchedules();
  }

  fetchSchedules() {

    if (this.schedulesQuery) {
      return this.schedulesQuery.refetch().then(() => true);
    }

    this.schedulesQuery = this.schedulesGQL.watch(undefined, { fetchPolicy: 'network-only' });

    const schedules$ = this.schedulesQuery.valueChanges.pipe(
      filter(res => !res.loading),
      map(res => this.convertSchedules(res.data?.schedules)),
      share(),
    );

    schedules$.subscribe(schedules => this._schedules.next(schedules));

    return firstValueFrom(schedules$);
  }

  addSchedule(input: MutateScheduleInput) {

    if (this.userId) {
      return this.createSchedule(input);
    }

    return this.createDraft(input);
  }

  editSchedule(
    input: MutateScheduleInput,
    identifiers: { scheduleKey?: string; scheduleId?: string},
  ) {

    if (this.userId) {
      return this.updateSchedule(input, identifiers.scheduleId);
    }

    return this.editDraft(input, identifiers.scheduleKey);
  }

  removeSchedule(schedule: FrontendSchedule) {

    if (this.userId) {
      return this.deleteSchedule(schedule.id);
    }

    return this.deleteDraft(schedule.key);
  }

  deleteSchedule(scheduleId?: string) {

    if (!scheduleId) {
      throw new Error('Unable to delete schedule: no schedule id');
    }

    const updatedSchedules$ = this.schedules$.pipe(
      map(schedules => schedules.filter(s => s.id !== scheduleId)),
    );

    const success$ = this.deleteSchedulesGQL.mutate({ scheduleIds: [ scheduleId ] })
      .pipe(
        map(res => res?.data?.deleteSchedules || false),
        catchError(err => {
          this.toastsService.apolloError(err, 'Unable to delete schedule');
          return of(false);
        }),
        share(),
      );

      success$.pipe(withLatestFrom(updatedSchedules$))
        .subscribe(([ deleted, updatedSchedules ]) => {
          if (deleted) {
            this._schedules.next(updatedSchedules);
          }
        });

    return firstValueFrom(success$);

  }

  deleteDraft(scheduleKey: string) {

    const success$ = this.schedules$.pipe(
      take(1),
      map(schedules => schedules.filter(s => s.key !== scheduleKey)),
      tap(schedules => this._schedules.next(schedules)),
      map(() => true),
      catchError(err => {
        this.toastsService.error('Unable to delete draft', err.message);
        return of(false);
      }),
    );

    return firstValueFrom(success$);
  }

  createDraft(input: MutateScheduleInput) {

    const draft: FrontendSchedule = {
      ...input,
      preset: false,
      key: this.currentKey,
    }

    const createdDraft$ = this.schedules$.pipe(
      take(1),
      tap(schedules => {

        this._schedules.next([ draft, ...schedules ]);

        if (!this.userId) {
          this.layoutService.setBanner({
            bannerType: 'guestMode',
            closable: true,
          });
        }

      }),
      map(() => draft),
      catchError(err => {
        this.toastsService.apolloError(err, 'Unable to create draft');
        return of(null);
      }),
    );

    return firstValueFrom(createdDraft$);
  }

  updateSchedule(editedSchedule: MutateScheduleInput, scheduleId?: string) {

    if (!scheduleId) {
      throw new Error('Unable to update schedule: no schedule id');
    }

    const updatedSchedules$ = this.schedules$.pipe(
      take(1),
      map(schedules => schedules.find(s => s.id === scheduleId)),
      throwIfUndefined(() => 'Unable to update workout template: unedited workout template not found'),
      withLatestFrom(this.workoutTemplates.workoutTemplates$),
      map(([ uneditedSchedule, workoutTemplates ]) => this.getUpdateScheduleMutationVariables(uneditedSchedule, editedSchedule, scheduleId, workoutTemplates)),
      switchMap(mutationVariables => this.updateSchedulesGQL.mutate(mutationVariables).pipe(
        catchError(err => {
          this.toastsService.apolloError(err, 'Unable to update schedule');
          return of(null);
        }),
      )),
      map(res => res?.data?.updateSchedules),
      filter(notEmpty),
      map(schedules => this.convertSchedules(schedules)),
    );

    // TODO: this is a hack to get around the fact that adding share to the pipe above breaks type inference
    const shared$ = updatedSchedules$.pipe(share());

    shared$.pipe(
      withLatestFrom(this.schedules$),
      map(([ updatedSchedules, schedules ]) => replaceElementsById(schedules, updatedSchedules)),
    ).subscribe(schedules => this._schedules.next(schedules));

    const editedSchedule$ = shared$.pipe(map((schedules) => schedules.find(s => s.id === scheduleId) || null));

    return firstValueFrom(editedSchedule$, { defaultValue: null });
  }

  editDraft(input: MutateScheduleInput, scheduleKey?: string) {

    if (!scheduleKey) {
      throw new Error('Unable to edit draft: no schedule key');
    }

    const editedDraft$ = this.schedules$.pipe(
      take(1),
      map(schedules => {

        const editedDraft: FrontendSchedule = {
          ...input,
          preset: false,
          key: scheduleKey,
        };

        const updatedSchedules = [ ...schedules ];

        const editedDraftIndex = schedules.findIndex(s => s.key === scheduleKey);

        if (editedDraftIndex === -1) {
          throw new Error('Unable to edit draft: active schedule index not found');
        }

        updatedSchedules[editedDraftIndex] = editedDraft;

        this._schedules.next(updatedSchedules);

        return editedDraft;
      }),
      catchError(err => {
        this.toastsService.error('Unable to edit draft', err.message);
        return of(null);
      }),
    )

    return firstValueFrom(editedDraft$);
  }

  createSchedule(input: MutateScheduleInput) {

    const newSchedule: FrontendSchedule = {
      ...input,
      preset: false,
      key: this.currentKey,
    }

    const createdScheduleArr$ = this.workoutTemplates.workoutTemplates$.pipe(
      take(1),
      map(workoutTemplates => this.getCreateScheduleInput([ newSchedule ], workoutTemplates)),
      map((schedules): CreateSchedulesMutationVariables  => ({ schedules })),
      switchMap(mutationVariables => this.createSchedulesGQL.mutate(mutationVariables)),
      catchError(err => {
        this.toastsService.apolloError(err, 'Unable to create schedule');
        return of(null);
      }),
      map(res => res?.data?.createSchedules),
      filter(notEmpty),
      map(schedules => this.convertSchedules(schedules)),
      share(),
    );

    const createdSchedule$ = createdScheduleArr$.pipe(map(schedules => schedules[0]));

    createdSchedule$.pipe(withLatestFrom(this.schedules$))
      .subscribe(([ createdSchedule, schedules ]) => {
        this._schedules.next([ createdSchedule, ...schedules ]);
      });

    return firstValueFrom(createdSchedule$, { defaultValue: null });
  }

  onAuthSuccess(userId: string) {
    this.userId = userId;
    return this.fetchSchedules();
  }

  getCreateScheduleInput(
    schedules: FrontendSchedule[],
    workoutTemplates: FrontendWorkoutTemplate[],
    defaultToWorkoutTemplateKey?: boolean,
  ): CreateScheduleInput[] {

    const output: CreateScheduleInput[] = [];

    for (const schedule of schedules) {

      const unsavedScheduleWeeks: CreateScheduleWeekInput[] = [];

      for (const week of schedule.weeks) {

        const unsavedScheduleWorkouts: CreateScheduleWorkoutInput[] = [];

        for (const workout of week.workouts) {

          const unsavedScheduleWorkout: CreateScheduleWorkoutInput = {
            allDay: workout.allDay,
            dow: workout.dow,
            start: workout.start,
            end: workout.end,
          };

          const workoutTemplateId = workoutTemplates.find(t => t.key === workout.workoutTemplateKey)?.id;

          if (workoutTemplateId) {
            unsavedScheduleWorkout.workoutTemplateId = workoutTemplateId;
          } else if (defaultToWorkoutTemplateKey) {
            unsavedScheduleWorkout.workoutTemplateKey = workout.workoutTemplateKey;
          } else {
            throw new Error('Unable to get create schedule input: workout template id not found');
          }

          unsavedScheduleWorkouts.push(unsavedScheduleWorkout);
        }

        unsavedScheduleWeeks.push({ workouts: unsavedScheduleWorkouts });
      }

      const unsavedSchedule: CreateScheduleInput = {
        name: schedule.name,
        weeks: unsavedScheduleWeeks,
        key: schedule.key,
      }

      output.push(unsavedSchedule);
    }

    return output;
  }

  getCreateScheduleWorkoutInput(
    scheduleWorkouts: FrontendScheduleWorkout[],
    workoutTemplates: FrontendWorkoutTemplate[],
  ): CreateScheduleWorkoutInput[] {

    const output: CreateScheduleWorkoutInput[] = [];

    for (const workout of scheduleWorkouts) {

      const workoutTemplateId = workoutTemplates.find(wt => wt.key === workout.workoutTemplateKey)?.id;

      if (!workoutTemplateId) {
        throw new Error('Unable to get create schedule input: workout template id not found');
      }

      output.push({
        allDay: workout.allDay,
        dow: workout.dow,
        end: workout.end,
        start: workout.start,
        workoutTemplateId,
      });
    }

    return output;
  }

  getUpdateScheduleMutationVariables(
    uneditedSchedule: FrontendSchedule,
    editedSchedule: MutateScheduleInput,
    scheduleId: string,
    workoutTemplates: FrontendWorkoutTemplate[],
  ): UpdateScheduleMutationVariables {

    const [ existingScheduleWeeks, newScheduleWeeks ] = partition(editedSchedule.weeks, sw => sw.id);

    const existingScheduleWeekIds = existingScheduleWeeks
      .map(w => w.id)
      .filter(notEmpty);

    const scheduleWeeksToDelete = uneditedSchedule.weeks
      .filter(w => w.id && !existingScheduleWeekIds.includes(w.id))
      .map(w => w.id)
      .filter(notEmpty);

    const scheduleWeeksToAdd = newScheduleWeeks
      .map(w => ({ workouts: this.getCreateScheduleWorkoutInput(w.workouts, workoutTemplates) }));

    const scheduleWeeksToUpdate: UpdateScheduleWeekInput[] = [];

    for (const week of existingScheduleWeeks) {

      if (!week.id) {
        throw new Error('Unable to update schedule week: no id');
      }

      const uneditedWeek = uneditedSchedule.weeks.find(w => w.id === week.id);

      if (!uneditedWeek) {
        throw new Error('Unable to update schedule week: unedited week not found');
      }

      const [ existingWorkouts, newWorkouts ] = partition(week.workouts, w => w.id);

      const existingWorkoutIds = existingWorkouts
        .map(w => w.id)
        .filter(notEmpty);

      const weekWorkoutsToDelete = uneditedWeek.workouts
        .filter(w => w.id && !existingWorkoutIds.includes(w.id))
        .map(w => w.id)
        .filter(notEmpty);

      const scheduleWorkoutsToAdd = this.getCreateScheduleWorkoutInput(newWorkouts, workoutTemplates);

      const scheduleWorkoutsToUpdate: UpdateScheduleWorkoutInput[] = [];

      for (const workout of existingWorkouts) {

        if (!workout.id) {
          throw new Error('Unable to update schedule workout: no id');
        }

        scheduleWorkoutsToUpdate.push({
          scheduleWorkoutId: workout.id,
          allDay: workout.allDay,
          dow: workout.dow,
          start: workout.start,
          end: workout.end,
        });
      }

      scheduleWeeksToUpdate.push({
        scheduleWeekId: week.id,
        updateWorkouts: scheduleWorkoutsToUpdate,
        addWorkouts: scheduleWorkoutsToAdd,
        removeWorkouts: weekWorkoutsToDelete,
      });
    }

    return {
      schedules: [
        {
          scheduleId,
          name: editedSchedule.name,
          addWeeks: scheduleWeeksToAdd,
          deleteWeeks: scheduleWeeksToDelete,
          updateWeeks: scheduleWeeksToUpdate,
        }
      ],
    };
  }

  convertSchedules(backendSchedules: FullScheduleFragment[] | null | undefined): FrontendSchedule[] {

    const frontendSchedules: FrontendSchedule[] = [];

    if (!backendSchedules) {
      return frontendSchedules;
    }

    for (const schedule of backendSchedules) {
      const frontendSchedule: FrontendSchedule = {
        name: schedule.name,
        id: schedule.id,
        key: schedule.id,
        weeks: this.convertScheduleWeeks(schedule.weeks),
        preset: schedule.preset,
      }

      frontendSchedules.push(frontendSchedule);
    }

    return frontendSchedules;
  }

  convertScheduleWeeks(backendScheduleWeeks: FullScheduleWeekFragment[] | null | undefined): FrontendScheduleWeek[] {

    if (!backendScheduleWeeks) {
      return [];
    }

    return backendScheduleWeeks.map(scheduleWeek => ({
      id: scheduleWeek.id,
      workouts: this.convertScheduleWorkouts(scheduleWeek.workouts),
    }));
  }

  convertScheduleWorkouts(backendScheduleWorkouts: FullScheduleWorkoutFragment[] | null | undefined): FrontendScheduleWorkout[] {

    const frontendScheduleWorkouts: FrontendScheduleWorkout[] = [];

    if (!backendScheduleWorkouts) {
      return frontendScheduleWorkouts;
    }

    for (const scheduleWorkout of backendScheduleWorkouts) {

      const frontendScheduleWorkout: FrontendScheduleWorkout = {
        id: scheduleWorkout.id,
        key: scheduleWorkout.id,
        workoutTemplateKey: scheduleWorkout.workoutTemplateId,
        dow: scheduleWorkout.dow,
        allDay: scheduleWorkout.allDay,
        start: scheduleWorkout.start,
        end: scheduleWorkout.end,
      }

      frontendScheduleWorkouts.push(frontendScheduleWorkout);
    }

    return frontendScheduleWorkouts;
  }

  reset() {
    this.userId = null;
    this._currentKey = 0;
    this.clearUserSchedules();
  }

  clearUserSchedules() {
    this.schedules$.pipe(take(1)).subscribe(schedules => {
      const presets = schedules.filter(s => s.preset);
      this._schedules.next(presets);
    });
  }

  findScheduleByKey(key: string) {
    return this.schedules$.pipe(map(schedules => schedules.find(s => s.key === key)))
      .pipe(throwIfUndefined(() => `No schedule found for key ${ key }`));
  }

  getLatestWorkoutDow(workouts: Maybe<FrontendScheduleWorkout>[]) {
    if (!workouts || !workouts.length) {
      return 0;
    }

    const dows = workouts.map(w => w?.dow || 0);

    return Math.max(...dows);
  }

  handleDeleteWorkoutTemplate() {
    this.workoutTemplates.workoutTemplateDeleted$
      .pipe(withLatestFrom(this.schedules$))
      .subscribe(([ workoutTemplateKey, schedules ]) => {

        if (!this.userId) {
          this.removeSchedulesBasedOnDeletedWorkoutTemplate(schedules, workoutTemplateKey);
          return;
        }

        this.fetchSchedules();
      });
  }

  handleExerciseItemsDeleted() {
    this.exerciseItemsService.exerciseItemDeleted$
      .pipe(filter(() => Boolean(this.userId)))
      .subscribe(() => this.fetchSchedules());
  }

  removeSchedulesBasedOnDeletedWorkoutTemplate(schedules: FrontendSchedule[], workoutTemplateKey: string) {

    let updatedSchedules = [...schedules];

    for (const schedule of updatedSchedules) {

      for (const week of schedule.weeks) {
        week.workouts = week.workouts.filter(w => w.workoutTemplateKey !== workoutTemplateKey);
      }

      schedule.weeks = [ ...schedule.weeks ];
    }

    updatedSchedules = updatedSchedules.filter(s => s.weeks.flatMap(w => w.workouts).length > 0);

    this._schedules.next(updatedSchedules);
  }

  async fork(schedule: FrontendSchedule) {

    const clone: MutateScheduleInput = {
      name: `${ schedule.name } (fork)`,
      weeks: await this.forkWeeks(schedule.weeks),
    }

    return this.addSchedule(clone);
  }

  async forkWeeks(weeks: FrontendScheduleWeek[]) {

    weeks = cloneDeep(weeks);

    let referencedWorkoutTemplateKeys = weeks
      .flatMap(w => w.workouts)
      .map(w => w.workoutTemplateKey);

    const workoutTemplates = await firstValueFrom(this.workoutTemplates.workoutTemplates$);

    referencedWorkoutTemplateKeys = uniq(referencedWorkoutTemplateKeys);

    const forkedWorkoutTemplatesByOriginalWorkoutTemplateKey: { [ workoutTemplateKey: string ]: FrontendWorkoutTemplate } = {};

    for (const workoutTemplateKey of referencedWorkoutTemplateKeys) {

      const original = workoutTemplates.find(wt => wt.key === workoutTemplateKey);

      if (!original) {
        throw new Error(`Unable to fork weeks: workout template not found for key ${workoutTemplateKey}`);
      }

      const fork = await this.workoutTemplates.fork(original);

      if (!fork) {
        throw new Error(`Unable to fork weeks: fork not found for workout template key ${workoutTemplateKey}`);
      }

      forkedWorkoutTemplatesByOriginalWorkoutTemplateKey[workoutTemplateKey] = fork;
    }

    for (const week of weeks) {
      for (const workout of week.workouts) {

        const fork = forkedWorkoutTemplatesByOriginalWorkoutTemplateKey[workout.workoutTemplateKey];

        if (!fork) {
          throw new Error(`Unable to fork weeks: fork not found for workout template key ${workout.workoutTemplateKey}`);
        }

        workout.workoutTemplateKey = fork.key;
      }
    }

    return weeks;
  }
}
