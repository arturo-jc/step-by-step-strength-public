import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { cloneDeep } from 'lodash-es';
import { FrontendExercise, FrontendProgramSet, FrontendWorkout } from '../../shared/types';
import { SetTemplateDraggableComponent } from '../../set-templates/set-template-draggable/set-template-draggable.component';

@Component({
  selector: 'app-mutate-workout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule,
    DragDropModule,
    ButtonModule,
    SetTemplateDraggableComponent,
  ],
  templateUrl: './mutate-workout.component.html',
  styleUrls: ['./mutate-workout.component.scss']
})
export class MutateWorkoutComponent implements OnInit {

  uneditedWorkout?: FrontendWorkout;

  editedWorkout?: FrontendWorkout;

  constructor(
    private dynamicDialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
  ) {}

  ngOnInit() {
    const workout = this.dynamicDialogConfig.data?.workout;

    if (workout) {
      this.uneditedWorkout = workout;
      this.editedWorkout = cloneDeep(workout);
    }
  }

  onDrop(dropEvent: CdkDragDrop<
    FrontendExercise,
    FrontendExercise,
    FrontendProgramSet
  >) {
    if (dropEvent.previousContainer === dropEvent.container) {
      moveItemInArray(dropEvent.container.data.sets, dropEvent.previousIndex, dropEvent.currentIndex);
    } else {
      transferArrayItem(dropEvent.previousContainer.data.sets, dropEvent.container.data.sets, dropEvent.previousIndex, dropEvent.currentIndex);
      this.removeEmptyExercises();
    }
    this.setOrderOfSets(dropEvent.container.data);
    this.setOrderOfSets(dropEvent.previousContainer.data);
  }

  removeEmptyExercises() {
    if (!this.editedWorkout) {
      throw new Error('No workout to remove empty exercises from');
    }

    this.editedWorkout.exercises = this.editedWorkout.exercises.filter(exercise => exercise.sets.length > 0);
  }

  setOrderOfSets(exercise: FrontendExercise) {
    for (let i = 0; i < exercise.sets.length; i++) {

      const set = exercise.sets[i];

      set.order = i + 1;
    }
  }

  applyChanges() {
    if (!this.editedWorkout) {
      throw new Error('No workout to apply changes to');
    }

    this.ref.close(this.editedWorkout);
  }

  cancel() {
    this.ref.close(this.uneditedWorkout);
  }

  copySet(set: FrontendProgramSet, exercise: FrontendExercise) {

    const originalSetIndex = exercise.sets.findIndex(s => s.order === set.order);

    const {
      id,
      ...copy
    } = set;

    const updateSets = [ ...exercise.sets ];

    updateSets.splice(originalSetIndex + 1, 0, copy);

    exercise.sets = updateSets;

    this.setOrderOfSets(exercise);
  }

  removeSet(set: FrontendProgramSet, exercise: FrontendExercise) {

    const originalSetIndex = exercise.sets.findIndex(s => s.order === set.order);

    const updateSets = [ ...exercise.sets ];

    updateSets.splice(originalSetIndex, 1);

    exercise.sets = updateSets;

    this.setOrderOfSets(exercise);

    this.removeEmptyExercises();
  }
}
