import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { EditInPlaceComponent } from '../../shared/edit-in-place/edit-in-place.component';
import { collapse } from '../../utils/animations';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { SetTemplateDraggableComponent } from '../../set-templates/set-template-draggable/set-template-draggable.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FrontendExerciseItem } from '../../services/exercise-items.service';
import { FrontendExerciseTemplate, FrontendSetTemplate } from '../../shared/types';
import { WorkoutTemplatesService } from '../../services/workout-templates.service';

@Component({
  selector: 'app-exercise-template-draggable',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ButtonModule,
    EditInPlaceComponent,
    InputNumberModule,
    SetTemplateDraggableComponent,
    RadioButtonModule,
  ],
  templateUrl: './exercise-template-draggable.component.html',
  styleUrls: ['./exercise-template-draggable.component.scss'],
  animations: [ collapse ],
})
export class ExerciseTemplateDraggableComponent implements OnInit {

  @Input() placeholderForExerciseItem?: FrontendExerciseItem;

  @Input() exerciseTemplate!: FrontendExerciseTemplate;

  @Input() connectedTo!: string[];

  @Input() targetDropList?: string | null;

  @Input() collapsed?: boolean;

  @Output() targetDropListChange = new EventEmitter<string>();

  @Output() onDropped = new EventEmitter<CdkDragDrop<
    FrontendExerciseTemplate,
    FrontendExerciseTemplate | FrontendExerciseItem[],
    FrontendExerciseItem | FrontendSetTemplate
  >>();

  @Output() onToggleButtonClicked = new EventEmitter();

  @Output() onRemoveExerciseTemplateButtonClicked = new EventEmitter();

  @Output() onCopyButtonClicked = new EventEmitter<FrontendSetTemplate>();

  @Output() onRemoveSetTemplateButtonClicked = new EventEmitter<FrontendSetTemplate>();

  @Output() onChanges = new EventEmitter();

  @ViewChild(EditInPlaceComponent) editInPlaceRef?: EditInPlaceComponent;

  constructor(
    private workoutTemplateService: WorkoutTemplatesService,
  ) {}

  ngOnInit(): void {
    if (this.placeholderForExerciseItem) {
      this.exerciseTemplate = this.getPlaceholderExerciseTemplate(this.placeholderForExerciseItem);
      this.connectedTo = [];
      this.collapsed = false;
    }
  }

  activate() {
    this.editInPlaceRef?.activate();
  }

  getPlaceholderExerciseTemplate(exerciseItem: FrontendExerciseItem): FrontendExerciseTemplate {
    return { name: 'New Exercise',
      order: 1,
      setTemplates: [ this.workoutTemplateService.getNewSetTemplate(exerciseItem) ],
      key: 'placeholder',
    };
  }

  handleSelectDropList(dropListId: string) {
    if (this.collapsed) {
      this.onToggleButtonClicked.emit();
    }

    this.targetDropListChange.emit(dropListId);
  }
}
