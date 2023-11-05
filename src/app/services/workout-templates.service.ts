import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
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
import {
  CreateExerciseTemplateInput,
  CreateSetTemplateInput,
  CreateWorkoutTemplateInput,
  CreateWorkoutTemplatesGQL,
  DeleteWorkoutTemplatesGQL,
  Intensity,
  FullExerciseTemplateFragment,
  FullSetTemplateFragment,
  FullWorkoutTemplateFragment,
  UpdateExerciseTemplateInput,
  UpdateSetTemplateInput,
  UpdateWorkoutTemplateGQL,
  UpdateWorkoutTemplateMutationVariables,
  WorkoutTemplatesGQL,
  WorkoutTemplatesQuery,
  WorkoutTemplatesQueryVariables,
} from '../../generated/graphql.generated';
import { notEmpty, throwIfUndefined } from '../utils/typescript';
import { cloneDeep, partition } from 'lodash-es';
import { DialogService } from 'primeng/dynamicdialog';
import { WorkoutTemplatePreviewComponent } from '../workout-templates/workout-template-preview/workout-template-preview.component';
import { replaceElementsById } from '../utils/arrays';
import { ToastsService } from './toasts.service';
import { ExerciseItemsService, FrontendExerciseItem } from './exercise-items.service';
import { QueryRef } from 'apollo-angular';
import { FrontendExerciseTemplate, FrontendSetTemplate, FrontendWorkoutTemplate, MutateWorkoutTemplateInput } from '../shared/types';
import { LayoutService } from './layout.service';

@Injectable({
  providedIn: 'root'
})
export class WorkoutTemplatesService {

  userId?: string | null;

  _currentKey = 0;

  _workoutTemplates = new BehaviorSubject<FrontendWorkoutTemplate[]>([]);

  workoutTemplates$ = this._workoutTemplates.asObservable();

  workoutTemplateDeleted$ = new Subject<string>();

  drafts$ = this.workoutTemplates$.pipe(
    map(workoutTemplates => workoutTemplates.filter(wt => !wt.id)),
    withLatestFrom(this.exerciseItemsService.exerciseItems$),
    map(([ workoutTemplates, exerciseItems ]) => this.getCreateWorkoutTemplateInput(workoutTemplates, exerciseItems, true)),
  );

  workoutTemplatesQuery?: QueryRef<WorkoutTemplatesQuery, WorkoutTemplatesQueryVariables>;

  constructor(
    private createWorkoutTemplatesGQL: CreateWorkoutTemplatesGQL,
    private workoutTemplatesGQL: WorkoutTemplatesGQL,
    private updateWorkoutTemplateGQL: UpdateWorkoutTemplateGQL,
    private deleteWorkoutTemplatesGQL: DeleteWorkoutTemplatesGQL,
    private exerciseItemsService: ExerciseItemsService,
    private dialogService: DialogService,
    private toastsService: ToastsService,
    private layoutService: LayoutService,
  ) { }

  init() {
    this.handleExerciseItemDeleted();
    return this.fetchWorkoutTemplates();
  }

  fetchWorkoutTemplates() {

    if (this.workoutTemplatesQuery) {
      return this.workoutTemplatesQuery.refetch().then(() => true);
    }

    this.workoutTemplatesQuery = this.workoutTemplatesGQL.watch(undefined, { fetchPolicy: 'network-only' });

    const workoutTemplates$ = this.workoutTemplatesQuery.valueChanges.pipe(
      filter(res => !res.loading),
        map(res => this.convertWorkoutTemplates(res.data.workoutTemplates, true)),
        share(),
    );

    workoutTemplates$.subscribe(workoutTemplates => this._workoutTemplates.next(workoutTemplates));

    return firstValueFrom(workoutTemplates$);
  }

  addWorkoutTemplate(input: MutateWorkoutTemplateInput) {

    const newWorkoutTemplate: FrontendWorkoutTemplate = {
      ...input,
      preset: false,
      key: this.currentKey,
    }

    if (this.userId) {
      return this.createWorkoutTemplate(newWorkoutTemplate);
    }

    return this.createDraft(newWorkoutTemplate);
  }

  editWorkoutTemplate(
    input: MutateWorkoutTemplateInput,
    identifiers: {
      workoutTemplateId?: string,
      workoutTemplateKey?: string,
    },
  ) {

    if (this.userId) {
      return this.updateWorkoutTemplate(input, identifiers.workoutTemplateId);
    }

    return this.editDraft(input, identifiers.workoutTemplateKey);
  }

  removeWorkoutTemplate(workoutTemplate: FrontendWorkoutTemplate) {

    if (this.userId) {
      return this.deleteWorkoutTemplate(workoutTemplate.id);
    }

    return this.deleteDraft(workoutTemplate.key);
  }

  deleteWorkoutTemplate(workoutTemplateId?: string) {

    if (!workoutTemplateId) {
      throw new Error('Unable to delete workout template: no workout template id');
    }

    const success$ = this.deleteWorkoutTemplatesGQL.mutate({ workoutTemplateIds: [ workoutTemplateId ] })
      .pipe(
        map(res => res?.data?.deleteWorkoutTemplates || false),
        catchError(err => {
          this.toastsService.apolloError(err, 'Unable to delete workout template');
          return of(false);
        }),
        share(),
      );

    const updatedWorkoutTemplates$ = this.workoutTemplates$.pipe(
      map(workoutTemplates => workoutTemplates.filter(wt => wt.id !== workoutTemplateId)),
    );

    success$.pipe(withLatestFrom(updatedWorkoutTemplates$))
      .subscribe(([ success, workoutTemplates ]) => {
        if (success) {
          this._workoutTemplates.next(workoutTemplates);
          this.workoutTemplateDeleted$.next(workoutTemplateId);
        }
      });

    return firstValueFrom(success$);

  }

  deleteDraft(workoutTemplateKey: string) {

    const success$ = this.workoutTemplates$.pipe(
      take(1),
      map(workoutTemplates => workoutTemplates.filter(wt => wt.key !== workoutTemplateKey)),
      tap(workoutTemplates => {
        this._workoutTemplates.next(workoutTemplates);
        this.workoutTemplateDeleted$.next(workoutTemplateKey);
      }),
      map(() => true),
      catchError(err => {
        this.toastsService.error('Unable to delete workout template', err.message);
        return of(false);
      }),
    );

    return firstValueFrom(success$);
  }

  createWorkoutTemplate(workoutTemplate: FrontendWorkoutTemplate) {

    const createdWorkoutTemplatesArr$ = this.exerciseItemsService.exerciseItems$
      .pipe(
        take(1),
        map(exerciseItems => ({ workoutTemplates: this.getCreateWorkoutTemplateInput([ workoutTemplate ], exerciseItems)})),
        switchMap(mutationVariables => this.createWorkoutTemplatesGQL.mutate(mutationVariables)),
        catchError(err => {
          this.toastsService.apolloError(err, 'Unable to create workout template');
          return of (null);
        }),
        map(res => res?.data?.createWorkoutTemplates),
        filter(notEmpty),
        map(workoutTemplates => this.convertWorkoutTemplates(workoutTemplates, true)),
        share(),
      );

    const createdWorkoutTemplate$ = createdWorkoutTemplatesArr$.pipe(map(workoutTemplates => workoutTemplates[0]));

    createdWorkoutTemplate$.pipe(withLatestFrom(this.workoutTemplates$))
      .subscribe(([ createdWorkoutTemplate, workoutTemplates ]) => {

        this._workoutTemplates.next([ createdWorkoutTemplate, ...workoutTemplates ])
      });

    return firstValueFrom(createdWorkoutTemplate$, { defaultValue: null });
  }

  createDraft(workoutTemplate: FrontendWorkoutTemplate) {

    const createdDraft$ = this.workoutTemplates$.pipe(
      take(1),
      tap(workoutTemplates => {

        this._workoutTemplates.next([ workoutTemplate, ...workoutTemplates ]);

        if (!this.userId) {
          this.layoutService.setBanner({
            bannerType: 'guestMode',
          });
        }

      }),
      map(() => workoutTemplate),
      catchError(err => {
        this.toastsService.error('Unable to create workout template', err.message);
        return of(null);
      }),
    );

    return firstValueFrom(createdDraft$);
  }

  updateWorkoutTemplate(editedWorkoutTemplate: MutateWorkoutTemplateInput, workoutTemplateId?: string) {

    if (!workoutTemplateId) {
      throw new Error('Unable to update workout template: no workout template id');
    }

    const convertedWorkoutTemplates$ = this.workoutTemplates$.pipe(
      take(1),
      map(workoutTemplates => workoutTemplates.find(wt => wt.id === workoutTemplateId)),
      throwIfUndefined(() => 'Unable to update workout template: unedited workout template not found'),
      withLatestFrom(this.exerciseItemsService.exerciseItems$),
      map(([ uneditedWorkoutTemplate, exerciseItems ]) => this.getUpdateWorkoutTemplateMutationVariables(
        exerciseItems,
        uneditedWorkoutTemplate,
        editedWorkoutTemplate,
        workoutTemplateId,
      )),
      switchMap(mutationVariables => this.updateWorkoutTemplateGQL.mutate(mutationVariables).pipe(
        catchError(err => {
          this.toastsService.apolloError(err, 'Unable to update workout template');
          return of (null);
        }),
      )),
      map(res => res?.data?.updateWorkoutTemplates),
      filter(notEmpty),
      map(workoutTemplates => this.convertWorkoutTemplates(workoutTemplates, true)),
    );

    const createdWorkoutTemplate$ = convertedWorkoutTemplates$.pipe(
      withLatestFrom(this.workoutTemplates$),
      map(([ updatedWorkoutTemplates, currentWorkoutTemplates ]) => replaceElementsById<FrontendWorkoutTemplate>(
        currentWorkoutTemplates,
        updatedWorkoutTemplates,
      )),
      map(workoutTemplates => {
        this._workoutTemplates.next(workoutTemplates);
        return workoutTemplates.find(wt => wt.id === workoutTemplateId) || null;
      }),
    );

    return firstValueFrom(createdWorkoutTemplate$, { defaultValue: null });
  }

  editDraft(input: MutateWorkoutTemplateInput, workoutTemplateKey?: string) {

    if (!workoutTemplateKey) {
      throw new Error('Unable to edit draft: no workout template key');
    }

    const editedDraft$ = this.workoutTemplates$
    .pipe(
      take(1),
      map(workoutTemplates => {

        const activeWorkoutTemplate = workoutTemplates.find(wt => wt.key === workoutTemplateKey);

        if (!activeWorkoutTemplate) {
          throw new Error('Unable to edit draft: no active workout template');
        }

        const activeWorkoutTemplateIndex = workoutTemplates.findIndex(wt => wt.key === activeWorkoutTemplate.key);

        if (activeWorkoutTemplateIndex === -1) {
          throw new Error('Unable to edit draft: active workout template index not found');
        }

        const editedDraft: FrontendWorkoutTemplate = {
          ...input,
          preset: false,
          key: activeWorkoutTemplate.key,
        }

        const updatedWorkoutTemplates = [ ...workoutTemplates ];

        updatedWorkoutTemplates[activeWorkoutTemplateIndex] = editedDraft;

        this._workoutTemplates.next(updatedWorkoutTemplates);

        return editedDraft;
      }),
      catchError(err => {
        this.toastsService.error('Unable to edit workout template', err.message);
        return of (null);
      }),
    );

    return firstValueFrom(editedDraft$);
  }

  getUpdateWorkoutTemplateMutationVariables(
    exerciseItems: FrontendExerciseItem[],
    uneditedWorkoutTemplate: FrontendWorkoutTemplate,
    editedWorkoutTemplate: MutateWorkoutTemplateInput,
    workoutTemplateId: string,
  ): UpdateWorkoutTemplateMutationVariables {

    const exerciseTemplatesToRemove: string[] = [];

    const exerciseTemplateIds: string[] = [];

    const setTemplateIds: string[] = [];

    for (const exerciseTemplate of editedWorkoutTemplate.exerciseTemplates) {

      for (const setTemplate of exerciseTemplate.setTemplates) {

        if (!setTemplate.id) { continue; }

        setTemplateIds.push(setTemplate.id);
      }

      if (!exerciseTemplate.id) { continue; }

      exerciseTemplateIds.push(exerciseTemplate.id);
    }

    for (const exerciseTemplate of uneditedWorkoutTemplate.exerciseTemplates) {

      if (!exerciseTemplate.id || exerciseTemplateIds.includes(exerciseTemplate.id)) { continue; }

      exerciseTemplatesToRemove.push(exerciseTemplate.id);
    }

    const [ existingExerciseTemplates, newExerciseTemplates ] = partition(editedWorkoutTemplate.exerciseTemplates, e => e.id);

    const exerciseTemplatesToUpdate: UpdateExerciseTemplateInput[] = [];

    for (const editedExerciseTemplate of existingExerciseTemplates) {

      if (!editedExerciseTemplate.id) {
        throw new Error('Cannot update exercise template without an ID');
      }

      const setTemplatesToRemove: string[] = [];

      const uneditedExerciseTemplate = uneditedWorkoutTemplate.exerciseTemplates.find(t => t.id === editedExerciseTemplate.id);

      if (!uneditedExerciseTemplate) { continue; }

      for (const setTemplate of uneditedExerciseTemplate.setTemplates) {

        if (!setTemplate.id || setTemplateIds.includes(setTemplate.id)) { continue; }

        setTemplatesToRemove.push(setTemplate.id);
      }

      const [ existingSetTemplates, newSetTemplates ] = partition(editedExerciseTemplate.setTemplates, st => st.id);

      const setTemplatesToUpdate: UpdateSetTemplateInput[] = [];

      for (const setTemplate of existingSetTemplates) {

        if (!setTemplate.id) { continue; }

        setTemplatesToUpdate.push({
          setTemplateId: setTemplate.id,
          order: setTemplate.order,
          weight: setTemplate.weight,
          reps: setTemplate.reps,
          distance: setTemplate.distance,
          duration: setTemplate.duration,
          intensity: setTemplate.intensity,
          incline: setTemplate.incline,
        })
      }

      exerciseTemplatesToUpdate.push({
        name: editedExerciseTemplate.name,
        exerciseTemplateId: editedExerciseTemplate.id,
        order: editedExerciseTemplate.order,
        updateSetTemplates: setTemplatesToUpdate,
        addSetTemplates: this.getCreateSetTemplateInput(newSetTemplates, exerciseItems),
        removeSetTemplates: setTemplatesToRemove,
      });
    }

    return {
      workoutTemplates:
        {
        workoutTemplateId,
        name: editedWorkoutTemplate.name,
        backgroundColor: editedWorkoutTemplate.backgroundColor,
        updateExerciseTemplates: exerciseTemplatesToUpdate,
        addExerciseTemplates: this.getCreateExerciseTemplateInput(newExerciseTemplates, exerciseItems),
        removeExerciseTemplates: exerciseTemplatesToRemove,
      },
    }
  }

  get currentKey() {
    const key = this._currentKey.toString();
    this._currentKey++;
    return key;
  }

  onAuthSuccess(userId: string) {
    this.userId = userId;
    return this.fetchWorkoutTemplates();
  }

  convertWorkoutTemplates(workoutTemplates?: FullWorkoutTemplateFragment[], useIdAsKey?: boolean): FrontendWorkoutTemplate[] {

    const output: FrontendWorkoutTemplate[] = [];

    if (!workoutTemplates) {
      return output;
    }

    for (const workoutTemplate of workoutTemplates) {

      const key = useIdAsKey ? workoutTemplate.id : workoutTemplate.key;

      if (!key) {
        throw new Error('Unable to resolve workout template key');
      }

      const frontendWorkoutTemplate: FrontendWorkoutTemplate = {
        id: workoutTemplate.id,
        name: workoutTemplate.name,
        backgroundColor: workoutTemplate.backgroundColor,
        exerciseTemplates: this.convertExerciseTemplates(workoutTemplate.exerciseTemplates),
        preset: workoutTemplate.preset,
        key,
      }

      output.push(frontendWorkoutTemplate);
    }

    return output;
  }

  convertExerciseTemplates(exerciseTemplates: FullExerciseTemplateFragment[]): FrontendExerciseTemplate[] {

    const output: FrontendExerciseTemplate[] = [];

    for (const exerciseTemplate of exerciseTemplates) {

      output.push({
        name: exerciseTemplate.name,
        order: exerciseTemplate.order,
        id: exerciseTemplate.id,
        key: exerciseTemplate.id,
        setTemplates: this.convertSetTemplates(exerciseTemplate.setTemplates),
      });
    }

    return output;
  }

  convertSetTemplates(setTemplates: FullSetTemplateFragment[]): FrontendSetTemplate[] {

    const output: FrontendSetTemplate[] = [];

    for (const setTemplate of setTemplates) {
      output.push({
        order: setTemplate.order,
        exerciseType: setTemplate.exerciseType,
        reps: setTemplate.reps,
        weight: setTemplate.weight,
        distance: setTemplate.distance,
        duration: setTemplate.duration,
        incline: setTemplate.incline,
        intensity: setTemplate.intensity,
        id: setTemplate.id,
        exerciseItemKey: setTemplate.exerciseItemId,
      });
    }

    return output;
  }

  getCreateWorkoutTemplateInput(
    workoutTemplates: FrontendWorkoutTemplate[],
    exerciseItems: FrontendExerciseItem[],
    defaultToExerciseItemKey?: boolean,
  ): CreateWorkoutTemplateInput[] {

    const output: CreateWorkoutTemplateInput[] = [];

    for (const workoutTemplate of workoutTemplates) {

      if (workoutTemplate.id) {
        throw new Error('Cannot create an already existing workout template');
      }

      if (!workoutTemplate.key) {
        throw new Error('Cannot save a workout template without a key');
      }

      const createWorkoutTemplateInput: CreateWorkoutTemplateInput = {
        backgroundColor: workoutTemplate.backgroundColor,
        exerciseTemplates: this.getCreateExerciseTemplateInput(workoutTemplate.exerciseTemplates, exerciseItems, defaultToExerciseItemKey),
        key: workoutTemplate.key,
        name: workoutTemplate.name,
      };

      output.push(createWorkoutTemplateInput);
    }

    return output;
  }

    getCreateExerciseTemplateInput(
      exerciseTemplates: FrontendExerciseTemplate[],
      exerciseItems: FrontendExerciseItem[],
      defaultToExerciseItemKey?: boolean,
    ): CreateExerciseTemplateInput[] {
      const output: CreateExerciseTemplateInput[] = [];

      for (const exerciseTemplate of exerciseTemplates) {

        const createExerciseTemplateInput: CreateExerciseTemplateInput = {
          name: exerciseTemplate.name,
          order: exerciseTemplate.order,
          setTemplates: this.getCreateSetTemplateInput(exerciseTemplate.setTemplates, exerciseItems, defaultToExerciseItemKey),
        }

        output.push(createExerciseTemplateInput);
      }

      return output;
  }

  getCreateSetTemplateInput(
    setTemplates: FrontendSetTemplate[],
    exerciseItems: FrontendExerciseItem[],
    defaultToExerciseItemKey?: boolean,
  ): CreateSetTemplateInput[] {
    const output: CreateSetTemplateInput[] = [];

    for (const setTemplate of setTemplates) {

      const createSetTemplateInput: CreateSetTemplateInput = {
        order: setTemplate.order,
        reps: setTemplate.reps,
        weight: setTemplate.weight,
        duration: setTemplate.duration,
        distance: setTemplate.distance,
        intensity: setTemplate.intensity,
        incline: setTemplate.incline,
      }

      const exerciseItem = exerciseItems.find(ei => ei.key === setTemplate.exerciseItemKey);

      const exerciseItemId = exerciseItem?.id;

      if (exerciseItemId) {
        createSetTemplateInput.exerciseItemId = exerciseItemId;
      } else if (defaultToExerciseItemKey) {
        createSetTemplateInput.exerciseItemKey = setTemplate.exerciseItemKey;
      } else {
        throw new Error('Cannot create set template without an exercise item id');
      }

      output.push(createSetTemplateInput);
    }

    return output;
  }

  filterWorkoutTemplatesByKey(keys: string[]) {
    return this.workoutTemplates$.pipe(map(workoutTemplates => workoutTemplates.filter(wt => keys.includes(wt.key))));
  }

  reset() {
    this.userId = null;
    this._currentKey = 0;
    this.clearUserWorkoutTemplates();
  }

  clearUserWorkoutTemplates() {
    this.workoutTemplates$.pipe(take(1)).subscribe(workoutTemplates => {
      const presets = workoutTemplates.filter(wt => wt.preset);
      this._workoutTemplates.next(presets);
    });
  }

  async openWorkoutTemplatePreviewInDialogByKey(workoutTemplateKey: string) {
    const workoutTemplates = await firstValueFrom(this.workoutTemplates$);

    const workoutTemplate = workoutTemplates.find(wt => wt.key === workoutTemplateKey);

    if (!workoutTemplate) {
      throw new Error(`Cannot find workout template with key ${workoutTemplateKey}`);
    }

    return this.openWorkoutTemplatePreviewInDialog(workoutTemplate);
  }

  openWorkoutTemplatePreviewInDialog(workoutTemplate: FrontendWorkoutTemplate) {
    return this.dialogService.open(WorkoutTemplatePreviewComponent, {
      data: { workoutTemplate },
      header: workoutTemplate.name,
    });
  }

  handleExerciseItemDeleted() {
    this.exerciseItemsService.exerciseItemDeleted$
      .pipe(withLatestFrom(this.workoutTemplates$))
      .subscribe(([ exerciseItemKey, workoutTemplates ]) => {

        if (!this.userId) {
          this.removeWorkoutTemplatesBasedOnDeletedExerciseItems(workoutTemplates, exerciseItemKey);
          return;
        }

        this.fetchWorkoutTemplates();
      });
  }

  removeWorkoutTemplatesBasedOnDeletedExerciseItems(workoutTemplates: FrontendWorkoutTemplate[], exerciseItemKey: string) {

    const updatedWorkoutTemplates = [ ...workoutTemplates ];

    for (const workoutTemplate of updatedWorkoutTemplates) {

      for (const exercise of workoutTemplate.exerciseTemplates) {
        exercise.setTemplates = exercise.setTemplates.filter(st => st.exerciseItemKey !== exerciseItemKey);
      }

      workoutTemplate.exerciseTemplates = workoutTemplate.exerciseTemplates.filter(e => e.setTemplates.length > 0);
    }

    const [ nonEmptyWorkoutTemplates, emptyWorkoutTemplates ] = partition(updatedWorkoutTemplates, (wt => wt.exerciseTemplates.length > 0))

    this._workoutTemplates.next(nonEmptyWorkoutTemplates);

    for (const workoutTemplate of emptyWorkoutTemplates) {
      this.workoutTemplateDeleted$.next(workoutTemplate.key);
    }

  }

  getNewSetTemplate(exerciseItem: FrontendExerciseItem): FrontendSetTemplate {

    const setTemplate: FrontendSetTemplate = {
      exerciseType: exerciseItem.exerciseType,
      order: 1,
      exerciseItemKey: exerciseItem.key,
    }

    if (exerciseItem.trackWeight) {
      // Weight in lbs
      setTemplate.weight = 10;
    }

    if (exerciseItem.trackReps) {
      setTemplate.reps = 10;
    }

    if (exerciseItem.trackDuration) {
      // Duration in seconds
      setTemplate.duration = 1200;
    }

    if (exerciseItem.trackDistance) {
      // Distance in miles
      setTemplate.distance = 1;
    }

    if (exerciseItem.trackIntensity) {
      setTemplate.intensity = Intensity.Low;
    }

    if (exerciseItem.trackIncline) {
      setTemplate.incline = 0;
    }

    return setTemplate;
  }

  async fork(workoutTemplate: FrontendWorkoutTemplate) {

    const clone: MutateWorkoutTemplateInput = {
      name: `${workoutTemplate.name} (fork)`,
      backgroundColor: workoutTemplate.backgroundColor,
      exerciseTemplates: cloneDeep(workoutTemplate.exerciseTemplates),
    }

    return this.addWorkoutTemplate(clone);
  }
}
