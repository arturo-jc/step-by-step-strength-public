import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragStart, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { SetTemplateDraggableComponent } from '../set-templates/set-template-draggable/set-template-draggable.component';
import { ExerciseTemplateDraggableComponent } from '../exercise-templates/exercise-template-draggable/exercise-template-draggable.component';
import { EXERCISE_TEMPLATES_DROP_LIST_ID } from '../workout-templates/mutate-workout-template/mutate-workout-template.component';
import { ListboxModule } from 'primeng/listbox';
import { ExerciseItemsService, FrontendExerciseItem } from '../services/exercise-items.service';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MutateExerciseItemsComponent } from './mutate-exercise-items/mutate-exercise-items.component';
import { ConfirmationService } from 'primeng/api';
import { ToastsService } from '../services/toasts.service';
import { Category } from '../../generated/graphql.generated';
import { CATEGORY_MAP } from '../global';

@Component({
  selector: 'app-exercise-items',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ExerciseTemplateDraggableComponent,
    SetTemplateDraggableComponent,
    ButtonModule,
    ListboxModule,
  ],
  templateUrl: './exercise-items.component.html',
  styleUrls: ['./exercise-items.component.scss']
})
export class ExerciseItemsComponent implements OnInit {

  @Input() dropListConnectedTo: (CdkDropList | string)[] | CdkDropList | string = [];

  @Output() onDragStarted = new EventEmitter<CdkDragStart<FrontendExerciseItem>>();

  placeholderType: 'exercise' | 'set' | null = 'exercise';

  exerciseItems$ = this.exerciseItemsService.exerciseItems$.pipe(map(items => this.groupExerciseItems(items)));

  constructor (
    private exerciseItemsService: ExerciseItemsService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private toasts: ToastsService,
  ) { }

  ngOnInit(): void {
    this.setPlaceholderType();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('dropListConnectedTo')) {
      this.setPlaceholderType();
    }
  }

  setPlaceholderType() {
    if (this.dropListConnectedTo === EXERCISE_TEMPLATES_DROP_LIST_ID) {
      this.placeholderType = 'exercise';
    } else {
      this.placeholderType = 'set';
    }
  }

  groupExerciseItems(exerciseItems: FrontendExerciseItem[]) {

    const output: {
      label: string;
      items: FrontendExerciseItem[];
    }[] = [];

    const itemsByCategory: Record<string, FrontendExerciseItem[]> = {};

    for (const item of exerciseItems) {

      itemsByCategory[CATEGORY_MAP[item.category].label] = itemsByCategory[CATEGORY_MAP[item.category].label] || [];

      itemsByCategory[CATEGORY_MAP[item.category].label].push(item);
    }

    for (const category of Object.keys(itemsByCategory)) {
      output.push({
        label: category,
        items: itemsByCategory[category]
      });
    }

    return output;
  }

  openCreateExerciseItemDialog(exerciseType?: string | null) {

    if (!exerciseType) {
      throw new Error('Exercise type is required');
    }

    this.dialogService.open(MutateExerciseItemsComponent, {
      header: 'Add Exercise Item?',
      data: { exerciseType },
    });
  }

  confirmDeleteExerciseItem(item: FrontendExerciseItem) {

    this.confirmationService.confirm({
      header: 'Delete Exercise Item?',
      message: 'Are you sure you want to delete this exercise item? This will update any workout templates and schedules that include it.',
      accept: () => this.deleteExerciseItem(item),
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Delete',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      rejectIcon: 'pi pi-times',
      key: 'dialog',
    })
  }

  async deleteExerciseItem(item: FrontendExerciseItem) {

    const deleted = await this.exerciseItemsService.removeExerciseItem(item);

    if (deleted) {
      this.toasts.success('Exercise item deleted');
    }

  }

}
