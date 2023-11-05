import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { ExerciseItemsService, MutateExerciseItemInput } from '../../services/exercise-items.service';
import { ToastsService } from '../../services/toasts.service';
import { CATEGORIES, CATEGORY_MAP } from '../../global';

@Component({
  selector: 'app-mutate-exercise-items',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    MultiSelectModule,
  ],
  templateUrl: './mutate-exercise-items.component.html',
  styleUrls: ['./mutate-exercise-items.component.scss']
})
export class MutateExerciseItemsComponent implements OnInit {

  mode: 'create' | 'update' = 'create';

  categories = CATEGORIES.map((category) => ({
    value: category,
    label: CATEGORY_MAP[category].label,
  }));

  metrics = [
    { label: 'Reps', value: 'trackReps' },
    { label: 'Weight', value: 'trackWeight' },
    { label: 'Duration', value: 'trackDuration' },
    { label: 'Distance', value: 'trackDistance' },
    { label: 'Intensity', value: 'trackIntensity' },
    { label: 'Incline', value: 'trackIncline' },
  ];

  exerciseItemForm = new FormGroup({
    exerciseType: new FormControl('New Exercise Item', [ Validators.required ]),
    category: new FormControl(undefined, [ Validators.required ]),
    metrics: new FormControl([] as string[]),
  })

  constructor(
    private dynamicDialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private exerciseItemsService: ExerciseItemsService,
    private toasts: ToastsService,
  ) {}

  ngOnInit(): void {
    this.exerciseItemForm.controls.exerciseType.setValue(this.dynamicDialogConfig.data?.exerciseType);
  }

  cancel() {
    this.ref.close();
  }

  async mutate() {

    if (!this.exerciseItemForm.value.category || !this.exerciseItemForm.value.exerciseType) {
      throw new Error('Invalid input');
    }

    let { metrics } = this.exerciseItemForm.value;

    metrics = metrics || [];

    const input: MutateExerciseItemInput = {
      category: this.exerciseItemForm.value.category,
      exerciseType: this.exerciseItemForm.value.exerciseType,
      trackReps: metrics.includes('trackReps'),
      trackWeight: metrics.includes('trackWeight'),
      trackDuration: metrics.includes('trackDuration'),
      trackDistance: metrics.includes('trackDistance'),
      trackIntensity: metrics.includes('trackIntensity'),
      trackIncline: metrics.includes('trackIncline'),
    }

    console.log({
      metrics,
      input,
    });

    // return;

    let success = false;

    if (this.mode === 'create') {
      success = await this.exerciseItemsService.addExerciseItem(input);
    } else {
      throw new Error('Not implemented');
    }

    if (success) {

      const successMessage = this.mode === 'create' ? 'Exercise item created' : 'Exercise item updated';

      this.toasts.success(successMessage);

      this.ref.close();
    }
  }
}
