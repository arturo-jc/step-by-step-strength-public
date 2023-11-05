import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { BaseExerciseItemFragment, Intensity } from '../../../generated/graphql.generated';
import { FrontendProgramSet, FrontendSetTemplate, Metric } from '../../shared/types';
import { MetricComponent } from '../../metric/metric.component';
import { notEmpty } from '../../utils/typescript';

@Component({
  selector: 'app-set-template-draggable',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ButtonModule,
    MetricComponent,
  ],
  templateUrl: './set-template-draggable.component.html',
  styleUrls: ['./set-template-draggable.component.scss']
})
export class SetTemplateDraggableComponent implements OnInit {

  @Input() placeholderForExerciseItem?: BaseExerciseItemFragment;

  @Input() setTemplate!: FrontendSetTemplate | FrontendProgramSet;

  @Output() onCopyButtonClicked = new EventEmitter();

  @Output() onRemoveButtonClicked = new EventEmitter();

  @Output() onChanges = new EventEmitter();

  setTemplateMetrics: Metric[] = [];

  ngOnInit(): void {

    if (this.placeholderForExerciseItem) {
      this.setTemplate = this.getPlaceHolderSetTemplate(this.placeholderForExerciseItem);
    }

    this.setMetrics();
  }

  getPlaceHolderSetTemplate(exerciseItem: BaseExerciseItemFragment): FrontendSetTemplate {

    const setTemplate: FrontendSetTemplate = {
      exerciseType: exerciseItem.exerciseType,
      order: 1,
      exerciseItemKey: 'placeholder',
    }

    if (exerciseItem.trackWeight) {
      setTemplate.weight = 0;
    }

    if (exerciseItem.trackReps) {
      setTemplate.reps = 0;
    }

    if (exerciseItem.trackDuration) {
      setTemplate.duration = 0;
    }

    if (exerciseItem.trackDistance) {
      setTemplate.distance = 0;
    }

    if (exerciseItem.trackIntensity) {
      setTemplate.intensity = Intensity.Low;
    }

    if (exerciseItem.trackIncline) {
      setTemplate.incline = 0;
    }

    return setTemplate;
  }

  setMetrics() {

    if (!this.setTemplate) {
      throw new Error('setTemplate is undefined');
    }

    const metrics: Metric[] = [];

    if (notEmpty(this.setTemplate.reps)) {
      metrics.push('reps');
    }

    if (notEmpty(this.setTemplate.weight)) {
      metrics.push('weight');
    }

    if (notEmpty(this.setTemplate.duration)) {
      metrics.push('duration');
    }

    if (notEmpty(this.setTemplate.distance)) {
      metrics.push('distance');
    }

    if (notEmpty(this.setTemplate.intensity)) {
      metrics.push('intensity');
    }

    if (notEmpty(this.setTemplate.incline)) {
      metrics.push('incline');
    }

    this.setTemplateMetrics = metrics;

  }
}
