import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MetricComponent } from '../../metric/metric.component';
import { FrontendProgramSet, FrontendWorkout, Metric } from '../../shared/types';
import { notEmpty } from '../../utils/typescript';

@Component({
  selector: 'app-workout-preview',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    MetricComponent,
  ],
  templateUrl: './workout-preview.component.html',
  styleUrls: ['./workout-preview.component.scss']
})
export class WorkoutPreviewComponent implements OnInit {

  @Input() workout?: FrontendWorkout;

  @Input() rowsExpandedByDefault = true;

  programSets: (FrontendProgramSet & {
    exerciseKey: string;
    exerciseName: string;
  })[] = [];

  cols: { header: string; field: Metric; active: boolean }[] = [
    { header: 'Reps', field: 'reps', active: false },
    { header: 'Weight', field: 'weight', active: false },
    { header: 'Duration', field: 'duration', active: false },
    { header: 'Distance', field: 'distance', active: false },
    { header: 'Intensity', field: 'intensity', active: false },
    { header: 'Incline', field: 'incline', active: false },
  ];

  activeColCount = 0;

  expandedRowKeys: Record<string, boolean> = {};

  ngOnInit(): void {
    if (this.workout) {
      this.setProgramSets();
      this.setActiveCols();
    }
  }

  setProgramSets() {

    if (!this.workout) {
      throw new Error('No workout provided');
    }

    const programSets: typeof this.programSets = [];

    for (const exercise of this.workout.exercises) {

      for (const programSet of exercise.sets) {
        programSets.push({
          ...programSet,
          exerciseKey: exercise.key,
          exerciseName: exercise.name,
        });
      }

      this.expandedRowKeys[exercise.key] = this.rowsExpandedByDefault;
    }

    this.programSets = programSets;
  }

  setActiveCols() {

    let activeColCount = 0;

    for (const col of this.cols) {

      col.active = this.programSets.some(programSet => notEmpty(programSet[col.field]));

      if (col.active) {
        activeColCount++;
      }
    }

    this.activeColCount = activeColCount;
  }

}
