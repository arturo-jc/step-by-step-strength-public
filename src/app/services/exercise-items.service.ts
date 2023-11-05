import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, catchError, filter, firstValueFrom, map, of, share, take, tap, withLatestFrom } from 'rxjs';
import {
  BaseExerciseItemFragment,
  CreateExerciseItemInput,
  CreateExerciseItemsGQL,
  CreateExerciseItemsMutationVariables,
  DeleteExerciseItemsGQL,
  ExerciseItem,
  ExerciseItemsGQL,
  ExerciseItemsQuery,
  ExerciseItemsQueryVariables,
} from '../../generated/graphql.generated';
import { notEmpty } from '../utils/typescript';
import { QueryRef } from 'apollo-angular';
import { ToastsService } from './toasts.service';

export type BaseExerciseItem = Pick<ExerciseItem,
|  'exerciseType'
|  'category'
|  'trackReps'
|  'trackWeight'
|  'trackDuration'
|  'trackDistance'
|  'trackIntensity'
|  'trackIncline'
|  'preset'
>;

export interface FrontendExerciseItem extends BaseExerciseItem {
  id?: string;
  key: string;
}

export type MutateExerciseItemInput = Pick<FrontendExerciseItem,
| 'category' 
|  'exerciseType'
|  'trackReps'
|  'trackWeight'
|  'trackDuration'
|  'trackDistance'
|  'trackIntensity'
|  'trackIncline'
>;

@Injectable({
  providedIn: 'root'
})
export class ExerciseItemsService {

  userId?: string | null;

  _currentKey = 0;

  _exerciseItems = new BehaviorSubject<FrontendExerciseItem[]>([]);

  exerciseItems$ = this._exerciseItems.asObservable();

  exerciseItemsQuery?: QueryRef<ExerciseItemsQuery, ExerciseItemsQueryVariables>;

  exerciseItemDeleted$ = new Subject<string>();

  drafts$ = this.exerciseItems$.pipe(
    map(items => items.filter(item => !item.id)),
    map(items => this.getCreateExerciseItemInput(items)),
  );

  constructor(
    private exerciseItemsGQL: ExerciseItemsGQL,
    private createExerciseItemsGQL: CreateExerciseItemsGQL,
    private deleteExerciseItemsGQL: DeleteExerciseItemsGQL,
    private toasts: ToastsService,
  ) { }

  init() {
    return this.fetchExerciseItems();
  }

  fetchExerciseItems() {

    if (this.exerciseItemsQuery) {
      return this.exerciseItemsQuery.refetch().then(() => true);
    }

    this.exerciseItemsQuery = this.exerciseItemsGQL.watch({
      fitler: { activeOnly: true },
    }, { fetchPolicy: 'network-only' });

    const exerciseItems$ = this.exerciseItemsQuery.valueChanges.pipe(
      filter(res => !res.loading),
      map(res => this.convertExerciseItems(res.data?.exerciseItems.filter(notEmpty), true)),
      share(),
    );

    exerciseItems$.subscribe(items => this._exerciseItems.next(items));

    const success$ = exerciseItems$.pipe(
      map(items => items.length > 0),
      catchError(err => {
        this.toasts.apolloError(err, 'Unable to fetch exercise items');
        return of(false);
      }),
    );

    return firstValueFrom(success$, { defaultValue: false });
  }

  addExerciseItem(input: MutateExerciseItemInput) {

    const newExerciseItem: FrontendExerciseItem = {
      ...input,
      key: this.currentKey,
      preset: false,
      trackReps: input.trackReps,
      trackWeight: input.trackWeight,
      trackDuration: input.trackDuration,
      trackDistance: input.trackDistance,
      trackIntensity: input.trackIntensity,
      trackIncline: input.trackIncline,
    };

    if (this.userId) {
      return this.createExerciseItem(newExerciseItem);
    }

    return this.createDraft(newExerciseItem);
  }

  createExerciseItem(item: FrontendExerciseItem) {

    const mutationVariables: CreateExerciseItemsMutationVariables = {
      exerciseItems: this.getCreateExerciseItemInput([ item ]),
    };

    const createdExerciseItems$ = this.createExerciseItemsGQL.mutate(mutationVariables).pipe(
      catchError(err => {
        this.toasts.apolloError(err, 'Unable to create exercise item');
        return of(null);
      }),
      map(res => res?.data?.createExerciseItems),
      filter(notEmpty),
      map(items => this.convertExerciseItems(items)),
      share(),
    );

    createdExerciseItems$.pipe(withLatestFrom(this.exerciseItems$))
      .subscribe(( [ createdItems, existingItems ]) => {
        this._exerciseItems.next([ ...existingItems, ...createdItems ]);
      });

    const success$ = createdExerciseItems$.pipe(map(items => items.length > 0));

    return firstValueFrom(success$, { defaultValue: false });
  }

  createDraft(item: FrontendExerciseItem) {

    const success$ = this.exerciseItems$.pipe(
      take(1),
      tap(exerciseItems => this._exerciseItems.next([ ...exerciseItems, item ])),
      catchError(err => {
        this.toasts.error('Unable to create exercise item', err.message);
        return of(false);
      }),
      map(() => true),
    );

    return firstValueFrom(success$);
  }

  getCreateExerciseItemInput(items: FrontendExerciseItem[]): CreateExerciseItemInput[] {

    const output: CreateExerciseItemInput[] = [];

    for (const item of items) {

      if (item.id) {
        throw new Error('Cannot create an already existing exercise item');
      }

      if (!item.key) {
        throw new Error('Cannot create an exercise item without a key');
      }

      const createExerciseItemInput: CreateExerciseItemInput = {
        key: item.key,
        exerciseType: item.exerciseType,
        category: item.category,
        trackReps: item.trackReps,
        trackWeight: item.trackWeight,
        trackDuration: item.trackDuration,
        trackDistance: item.trackDistance,
        trackIntensity: item.trackIntensity,
        trackIncline: item.trackIncline,
      }

      output.push(createExerciseItemInput);
    }

    return output;
  }

  convertExerciseItems(exerciseItems?: BaseExerciseItemFragment[], userIdAsKey?: boolean) {

    const output: FrontendExerciseItem[] = [];

    if (!exerciseItems) { return output; }

    for (const item of exerciseItems) {

      const key = userIdAsKey ? item.id : item.key;

      if (!key) {
        throw new Error('Unable to resolve exercise item key');
      }

      const frontendExerciseItem: FrontendExerciseItem = {
        id: item.id,
        key,
        exerciseType: item.exerciseType,
        category: item.category,
        preset: item.preset,
        trackReps: item.trackReps,
        trackWeight: item.trackWeight,
        trackDuration: item.trackDuration,
        trackDistance: item.trackDistance,
        trackIntensity: item.trackIntensity,
        trackIncline: item.trackIncline,
      };

      output.push(frontendExerciseItem);
    }

    return output;
  }

  removeExerciseItem(exerciseItem: FrontendExerciseItem) {

    if (this.userId) {
      return this.deleteExerciseItem(exerciseItem.id);
    }

    return this.deleteDraft(exerciseItem.key);
  }

  deleteExerciseItem(exerciseItemId?: string) {

    if (!exerciseItemId) {
      throw new Error('Unable to delete exercise item without id');
    }

    const success$ = this.deleteExerciseItemsGQL.mutate({ exerciseItemIds: [ exerciseItemId ] })
      .pipe(
        map(res => res?.data?.deleteExerciseItems || false),
        catchError(err => {
          this.toasts.apolloError(err, 'Unable to delete exercise item');
          return of(false);
        }),
        share(),
      );

    const updatedExerciseItems$ = this.exerciseItems$.pipe(
      map(exerciseItems => exerciseItems.filter(item => item.id !== exerciseItemId)),
    );

    success$.pipe(withLatestFrom(updatedExerciseItems$))
      .subscribe(([ success, exerciseItems ]) => {
        if (success) {
          this._exerciseItems.next(exerciseItems);
          this.exerciseItemDeleted$.next(exerciseItemId);
        }
      });

    return firstValueFrom(success$);
  }

  deleteDraft(exerciseItemKey: string) {

    const success$ = this.exerciseItems$.pipe(
      take(1),
      map(exerciseItems => exerciseItems.filter(item => item.key !== exerciseItemKey)),
      tap(exerciseItems => {
        this._exerciseItems.next(exerciseItems);
        this.exerciseItemDeleted$.next(exerciseItemKey);
      }),
      map(() => true),
      catchError(err => {
        this.toasts.error('Unable to delete exercise item', err.message);
        return of(false);
      }),
    );

    return firstValueFrom(success$);
  }

  get currentKey() {
    const key = this._currentKey.toString();
    this._currentKey++;
    return key;
  }

  onAuthSuccess(userId: string) {
    this.userId = userId;
    return this.fetchExerciseItems();
  }

  reset() {
    this.userId = null;
    this._currentKey = 0;
    this.clearUserExerciseItems();
  }

  clearUserExerciseItems() {
    this.exerciseItems$.pipe(take(1)).subscribe(items => {
      const presets = items.filter(item => item.preset);
      this._exerciseItems.next(presets);
    });
  }

}
