import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
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
import { SubSink } from 'subsink';
import {
  CreateExerciseInput,
  CreateProgramInput,
  CreateProgramSetInput,
  CreateProgramsGQL,
  CreateProgramsMutationVariables,
  CreateWorkoutInput,
  DeleteProgramsGQL,
  Exercise,
  FullProgramFragment,
  FullWorkoutFragment,
  ProgramSet,
  UpdateExerciseInput,
  UpdateProgramGQL,
  UpdateProgramMutationVariables,
  UpdateProgramSetInput,
  UpdateWorkoutInput,
  UserProgramsGQL,
} from '../../generated/graphql.generated';
import { partition } from 'lodash-es';
import { notEmpty, throwIfUndefined } from '../utils/typescript';
import { replaceElementsById } from '../utils/arrays';
import { ToastsService } from './toasts.service';
import { FrontendExercise, FrontendProgram, FrontendProgramSet, FrontendWorkout, MutateProgramInput } from '../shared/types';
import { LayoutService } from './layout.service';

@Injectable({
  providedIn: 'root'
})
export class ProgramsService {

  userId?: string | null;

  _currentKey = 0;

  _programs$ = new BehaviorSubject<FrontendProgram[]>([]);

  programs$ = this._programs$.asObservable();

  drafts$ = this.programs$.pipe(
    map(programs => programs.filter(p => !p.id)),
    map(programs => this.getCreateProgramInput(programs)),
  );

  subs = new SubSink();

  constructor(
    private userProgramsGQL: UserProgramsGQL,
    private createProgramsGQL: CreateProgramsGQL,
    private updateProgramGQL: UpdateProgramGQL,
    private deleteProgramsGQL: DeleteProgramsGQL,
    private toastsService: ToastsService,
    private layoutService: LayoutService,
  ) { }

  get currentKey() {
    const key = this._currentKey.toString();
    this._currentKey++;
    return key;
  }

  addProgram(input: MutateProgramInput) {

    const newProgram: FrontendProgram = {
      ...input,
      key: this.currentKey,
    }

    if (this.userId) {
      return this.createProgram(newProgram);
    }

    return this.createDraft(newProgram);
  }

  editProgram(input: MutateProgramInput, identifiers: {
    programId?: string;
    programKey?: string;
  }) {

    if (this.userId) {
      return this.updateProgram(input, identifiers.programId);
    }

    return this.editDraft(input, identifiers.programKey);
  }

  removeProgram(program: FrontendProgram) {

    if (this.userId) {
      return this.deleteProgram(program.id);
    }

    return this.deleteDraft(program.key);
  }

  deleteProgram(programId?: string) {

    if (!programId) {
      throw new Error('Unable to delete program: no programId');
    }

    const success$ = this.deleteProgramsGQL.mutate({ programIds: [ programId ]})
      .pipe(
        map(res => res?.data?.deletePrograms || false),
        catchError(err => {
          this.toastsService.apolloError(err, 'Unable to delete program');
          return of(false);
        }),
        share(),
      );

    const updatedPrograms$ = this.programs$.pipe(
      map(programs => programs.filter(p => p.id !== programId)),
    );

    success$.pipe(withLatestFrom(updatedPrograms$))
      .subscribe(([ deleted, updatedPrograms ]) => {
        if (deleted) {
          this._programs$.next(updatedPrograms);
        }
      });

    return firstValueFrom(success$);
  }

  deleteDraft(programKey: string) {

    const success$ = this.programs$.pipe(
      take(1),
      map(programs => programs.filter(p => p.key !== programKey)),
      tap(programs => this._programs$.next(programs)),
      map(() => true),
      catchError(err => {
        this.toastsService.error('Unable to delete draft', err.message);
        return of(false);
      }),
    );

    return firstValueFrom(success$);
  }

  createProgram(program: FrontendProgram) {

    const mutationVariables: CreateProgramsMutationVariables = {
      programs: this.getCreateProgramInput([ program ]),
    }

    const createdPrograms$ = this.createProgramsGQL.mutate(mutationVariables).pipe(
      catchError(err => {
        this.toastsService.apolloError(err, 'Unable to create program');
        return of(null);
      }),
      map(res => res?.data?.createPrograms),
      filter(notEmpty),
      map(programs => this.convertPrograms(programs)),
      withLatestFrom(this.programs$),
      map(([ createdPrograms, currentPrograms ]) => {

        const [ first ] = createdPrograms;

        this._programs$.next([ first, ...currentPrograms ]);

        return first;
      }),
    );

    return firstValueFrom(createdPrograms$, { defaultValue: null });
  }

  createDraft(program: FrontendProgram) {

    const createdDraft$ = this.programs$.pipe(
      take(1),
      map(programs => {

        this._programs$.next([ program, ...programs ]);

        if (!this.userId) {
          this.layoutService.setBanner({
            bannerType: 'guestMode',
          });
        }

        return program;
      }),
      catchError(err => {
        this.toastsService.error('Unable to create draft', err.message);
        return of(null);
      }),
    );

    return firstValueFrom(createdDraft$);
  }

  updateProgram(program: MutateProgramInput, programId?: string) {

    if (!programId) {
      throw new Error('Unable to update program: no programId');
    }

    const frontendPrograms$ = this.programs$.pipe(
      take(1),
      map(programs => programs.find(p => p.id === programId)),
      throwIfUndefined(() => 'Unable to update program: unedited program not found'),
      map(uneditedProgram => this.getUpdateProgramMutationVariables(uneditedProgram, program, programId)),
      switchMap(mutationVariables => this.updateProgramGQL.mutate(mutationVariables).pipe(
        catchError(err => {
          this.toastsService.apolloError(err, 'Unable to update program');
          return of(null);
        }),
      )),
      map(res => res?.data?.updatePrograms),
      filter(notEmpty),
      map(programs => this.convertPrograms(programs)),
    );

    const updatedProgram$ = frontendPrograms$.pipe(
      withLatestFrom(this.programs$),
      map(([ updatedPrograms, currentPrograms ]) => replaceElementsById(currentPrograms, updatedPrograms)),
      map(updatedPrograms => {

      this._programs$.next(updatedPrograms);

      const updatedProgram = updatedPrograms.find(p => p.id === programId) || null;

      return updatedProgram;
      }));

    return firstValueFrom(updatedProgram$, { defaultValue: null });
  }

  editDraft(input: MutateProgramInput, programKey?: string) {

    if (!programKey) {
      throw new Error('Unable to edit draft: no programKey');
    }

    const editedDraft$ = this.programs$
      .pipe(
        take(1),
        map(programs => {

          const activeProgram = programs.find(program => program.key === programKey);

          if (!activeProgram) {
            throw new Error('Unable to edit draft: no active program');
          }

          const activeProgramIndex = programs.findIndex(program => program.key === activeProgram.key);

          if (activeProgramIndex === -1) {
            throw new Error('Unable to edit draft: active program not found');
          }

          const editedDraft: FrontendProgram ={
            ...input,
            key: activeProgram.key,
          }

          const updatedPrograms = [ ...programs ];

          updatedPrograms[activeProgramIndex] = editedDraft;

          this._programs$.next(updatedPrograms);

          return editedDraft
        }),
        catchError(err => {
          this.toastsService.error('Unable to edit draft', err.message);
          return of(null);
        }),
      );

      return firstValueFrom(editedDraft$);
  }

  onAuthSuccess(userId: string) {

    this.userId = userId;

    const userPrograms$ = this.userProgramsGQL.watch({ userId }).valueChanges.pipe(
      filter(res => !res.loading),
      map(res => this.convertPrograms(res.data.user?.programs)),
      share(),
    );

    this.subs.sink = userPrograms$.subscribe(userPrograms => this._programs$.next(userPrograms));

    return firstValueFrom(userPrograms$);
  }

  convertPrograms(programs?: FullProgramFragment[]): FrontendProgram[] {

    const output: FrontendProgram[] = [];

    if (!programs) {
      return output;
    }

    for (const program of programs) {

      const frontendProgram: FrontendProgram = {
        name: program.name,
        id: program.id,
        key: program.id,
        workouts: this.converWorkouts(program.workouts),
      }

      output.push(frontendProgram);
    }

    return output;
  }

  converWorkouts(workouts: FullWorkoutFragment[]): FrontendWorkout[] {

    const output: FrontendWorkout[] = [];

    for (const workout of workouts) {

      const frontendWorkout: FrontendWorkout = {
        name: workout.name,
        id: workout.id,
        key: workout.id,
        start: workout.start,
        end: workout.end,
        backgroundColor: workout.backgroundColor,
        exercises: this.convertExercises(workout.exercises),
      }

      output.push(frontendWorkout);
    }

    return output;
  }

  convertExercises(exercises: Exercise[]): FrontendExercise[] {

    const output: FrontendExercise[] = [];

    for (const exercise of exercises) {

      const frontendExercise = {
        name: exercise.name,
        id: exercise.id,
        key: exercise.id,
        order: exercise.order,
        sets: this.convertProgramSets(exercise.sets),
      }

      output.push(frontendExercise);
    }

    return output;
  }

  convertProgramSets(sets: ProgramSet[]): FrontendProgramSet[] {

    const output: FrontendProgramSet[] = [];

    for (const set of sets) {

      const frontendSet = {
        id: set.id,
        exerciseType: set.exerciseType,
        reps: set.reps,
        weight: set.weight,
        distance: set.distance,
        duration: set.duration,
        intensity: set.intensity,
        incline: set.incline,
        order: set.order,
      }

      output.push(frontendSet);
    }

    return output;
  }

  getCreateProgramInput(programs: FrontendProgram[]): CreateProgramInput[] {

    const output: CreateProgramInput[] = [];

    for (const program of programs) {

      output.push({
        name: program.name,
        workouts: this.getCreateWorkoutInput(program.workouts),
      })

    }

    return output;
  }

  getCreateWorkoutInput(workouts: FrontendWorkout[]): CreateWorkoutInput[] {

    const output: CreateWorkoutInput[] = [];

    for (const workout of workouts) {
      output.push({
        name: workout.name,
        start: workout.start,
        end: workout.end,
        exercises: this.getCreateExerciseInput(workout.exercises),
        backgroundColor: workout.backgroundColor,
      });
    }

    return output;
  }

  getCreateExerciseInput(exercises: FrontendExercise[]): CreateExerciseInput[] {

    const output: CreateExerciseInput[] = [];

    for (const exercise of exercises) {

      output.push({
        name: exercise.name,
        order: exercise.order,
        sets: this.getCreateProgramSetInput(exercise.sets),
      });
    }

    return output;
  }

  getCreateProgramSetInput(programSets: FrontendProgramSet[]): CreateProgramSetInput[] {

    const output: CreateProgramSetInput[] = [];

    for (const set of programSets) {
      output.push({
        exerciseType: set.exerciseType,
        reps: set.reps,
        weight: set.weight,
        distance: set.distance,
        duration: set.duration,
        intensity: set.intensity,
        incline: set.incline,
        order: set.order,
      });
    }

    return output;
  }

  getUpdateProgramMutationVariables(
    uneditedProgram: FrontendProgram,
    editedProgram: MutateProgramInput,
    programId: string
  ): UpdateProgramMutationVariables {

    const [ existingWorkouts, _newWorkouts ] = partition(editedProgram.workouts, (w) => w.id);;

    const existingWorkoutIds = existingWorkouts
      .map(w => w.id)
      .filter(notEmpty);

    const workoutsToDelete = uneditedProgram.workouts
      .filter(w => w.id && !existingWorkoutIds.includes(w.id))
      .map(w => w.id)
      .filter(notEmpty);

    const workoutsToUpdate: UpdateWorkoutInput[] = [];

    for (const workout of existingWorkouts) {

      if (!workout.id) {
        throw new Error('Unable to update program: workout id not found');
      }

      const uneditedWorkout = uneditedProgram.workouts.find(w => w.id === workout.id);

      if (!uneditedWorkout) {
        throw new Error('Unable to update program: unedited workout not found');
      }

      const [ existingExercises, _newExercises ] = partition(workout.exercises, (e) => e?.id);

      const existingExerciseIds = existingExercises
        .map(e => e.id)
        .filter(notEmpty);

      const exercisesToDelete = uneditedWorkout.exercises
        .filter(e => e.id && !existingExerciseIds.includes(e.id))
        .map(e => e.id)
        .filter(notEmpty);

      const exercisesToUpdate: UpdateExerciseInput[] = [];

      for (const exercise of existingExercises) {

        if (!exercise.id) {
          throw new Error('Unable to update program: exercise id not found');
        }

        const uneditedExercise = uneditedWorkout.exercises.find(e => e.id === exercise.id);

        if (!uneditedExercise) {
          throw new Error('Unable to update program: unedited exercise not found');
        }

        const [ existingSets, newSets ] = partition(exercise.sets, (s) => s?.id);

        const setsToUpdate: UpdateProgramSetInput[] = [];

        for (const programSet of existingSets) {

          if (!programSet.id) {
            throw new Error('Unable to update program: program set id not found');
          }

          setsToUpdate.push({
            programSetId: programSet.id,
            reps: programSet.reps,
            weight: programSet.weight,
            distance: programSet.distance,
            duration: programSet.duration,
            intensity: programSet.intensity,
            incline: programSet.incline,
            order: programSet.order,
          });
        }

        const setsToDelete = uneditedExercise.sets
          .filter(s => s.id && !existingSets.map(s => s.id).includes(s.id))
          .map(s => s.id)
          .filter(notEmpty);

        exercisesToUpdate.push({
          exerciseId: exercise.id,
          updateSets: setsToUpdate,
          addSets: this.getCreateProgramSetInput(newSets),
          removeSets: setsToDelete,
        });
      }

      workoutsToUpdate.push({
        workoutId: workout.id,
        start: workout.start,
        end: workout.end,
        updateExercises: exercisesToUpdate,
        removeExercises: exercisesToDelete,
      });
    }

    return {
      programs: {
        programId,
        name: editedProgram.name,
        removeWorkouts: workoutsToDelete,
        updateWorkouts: workoutsToUpdate,
      },
    }
  }

  reset() {
    this.userId = null;
    this._currentKey = 0;
    this._programs$.next([]);
    this.subs.unsubscribe();
  }
}
