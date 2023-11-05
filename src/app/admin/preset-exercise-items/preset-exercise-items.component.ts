import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseExerciseItemFragment, ExerciseItemsGQL, ExerciseItemsQuery, ExerciseItemsQueryVariables, UpdateExerciseItemInput, UpdateExerciseItemsGQL } from '../../../generated/graphql.generated';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { SubSink } from 'subsink';
import { cloneDeep } from 'lodash-es';
import { QueryRef } from 'apollo-angular';
import { EditInPlaceComponent } from '../../shared/edit-in-place/edit-in-place.component';
import { FormsModule } from '@angular/forms';
import { CATEGORIES } from '../../global';
import { DropdownModule } from 'primeng/dropdown';
import { ExerciseItem } from '../../../generated/graphql.types';
import { replaceElementsById } from '../../utils/arrays';

@Component({
  selector: 'app-preset-exercise-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputSwitchModule,
    ButtonModule,
    EditInPlaceComponent,
    InputSwitchModule,
    DropdownModule,
  ],
  templateUrl: './preset-exercise-items.component.html',
  styleUrls: ['./preset-exercise-items.component.scss']
})
export class PresetExerciseItemsComponent implements OnInit, OnDestroy {

  editMode = false;

  loading = false;

  defaultValues: BaseExerciseItemFragment[] = [];

  exerciseItems: BaseExerciseItemFragment[] = [];

  exerciseItemsQuery?: QueryRef<ExerciseItemsQuery, ExerciseItemsQueryVariables>;

  subs = new SubSink();

  categories = CATEGORIES;

  modified: string[] = [];

  activeMetricClass = 'pi pi-check text-primary';

  inactiveMetricClass = 'pi pi-times p-text-secondary';

  constructor(
    private exerciseItemsGQL: ExerciseItemsGQL,
    private updateExerciseItemsGQL: UpdateExerciseItemsGQL,
  ) {}

  ngOnInit(): void {
    this.retrieveExerciseItems();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  retrieveExerciseItems() {

    if (this.exerciseItemsQuery) {
      this.exerciseItemsQuery.refetch();
      return;
    }

    this.exerciseItemsQuery = this.exerciseItemsGQL.watch({
      fitler: { presetOnly: true },
    });

    this.subs.sink = this.exerciseItemsQuery.valueChanges.subscribe(res => {

      this.loading = res.loading;

      if (this.loading) return;

      this.defaultValues = cloneDeep(res.data.exerciseItems || []) as BaseExerciseItemFragment[];

      this.exerciseItems = cloneDeep(this.defaultValues);

      this.modified = [];

      this.editMode = false;
    });
  }

  saveChanges() {
    if (this.modified.length === 0) {
      this.editMode = false;
    } else {

      this.loading = true;

      const exerciseItems: UpdateExerciseItemInput[] = [];

      for (const id of this.modified) {

        const exerciseItem = this.exerciseItems.find(item => item.id === id);

        if (!exerciseItem) {
          throw new Error(`Exercise item with id ${id} not found`);
        };

        exerciseItems.push({
          id,
          exerciseType: exerciseItem.exerciseType,
          category: exerciseItem.category,
          active: exerciseItem.active,
        });

        this.updateExerciseItemsGQL.mutate({ exerciseItems }).subscribe(res => {

          const currentExerciseItems = this.exerciseItems;

          const updated = replaceElementsById(currentExerciseItems, res.data?.updateExerciseItems || []);

          this.defaultValues = cloneDeep(updated);

          this.exerciseItems = cloneDeep(updated);

          this.loading = false;

          this.editMode = false;

          this.modified = [];
        });
      }
    }
  }

  discardChanges() {
    this.exerciseItems = cloneDeep(this.defaultValues);
    this.editMode = false;
    this.modified = [];
  }

  markAsModified(item: ExerciseItem) {
    if (!this.modified.includes(item.id)) {
      this.modified.push(item.id);
    }
  }

}
