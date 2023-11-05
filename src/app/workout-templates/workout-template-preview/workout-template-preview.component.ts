import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { collapse } from '../../utils/animations';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FrontendSetTemplate, FrontendWorkoutTemplate, Metric } from '../../shared/types';
import { notEmpty } from '../../utils/typescript';
import { MetricComponent } from '../../metric/metric.component';
import { WorkoutTemplateDescriptionPipe } from '../workout-template-description.pipe';
import { TooltipModule } from 'primeng/tooltip';
import { WorkoutTemplatesService } from '../../services/workout-templates.service';
import { SchedulesService } from '../../services/schedules.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ToastsService } from '../../services/toasts.service';
import { NavigationExtras, Router } from '@angular/router';
import { take } from 'rxjs';
import { WorkoutTemplateItemComponent } from '../workout-template-item/workout-template-item.component';

@Component({
  selector: 'app-workout-template-preview',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    MetricComponent,
    WorkoutTemplateDescriptionPipe,
    TooltipModule,
    MenuModule,
    WorkoutTemplateItemComponent,
  ],
  templateUrl: './workout-template-preview.component.html',
  styleUrls: ['./workout-template-preview.component.scss'],
  animations: [ collapse ],
})
export class WorkoutTemplatePreviewComponent {

  @Input() workoutTemplate?: FrontendWorkoutTemplate;

  @Input() showHeader = true;

  @Input() showButtons = false;

  @Input() rowsExpandedByDefault = true;

  @Input() linkToWorkoutTemplate = false;

  setTemplates: (FrontendSetTemplate & {
    exerciseTemplateKey: string;
    exerciseName: string;
    exerciseTemplateOrder: number;
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

  moreActions: MenuItem[] = [
    {
      label: 'Fork',
      icon: 'pi pi-share-alt',
      command: () => this.fork(),
      tooltipOptions: { tooltipLabel: 'Make an editable copy of this workout', tooltipPosition: 'left' },
    }
  ];

  constructor(
    private workoutTemplatesService: WorkoutTemplatesService,
    private schedulesService: SchedulesService,
    private confirmationService: ConfirmationService,
    private toasts: ToastsService,
    private router: Router,
  ) {}

  ngOnChanges() {
    if (this.workoutTemplate) {
      this.setWorkoutTemplate(this.workoutTemplate);
    }
  }

  setWorkoutTemplate(workoutTemplate: FrontendWorkoutTemplate) {
    this.workoutTemplate = workoutTemplate;
    this.setSetTemplates();
    this.setActiveCols();
  }

  setSetTemplates() {

    if (!this.workoutTemplate) {
      throw new Error('workoutTemplate is undefined');
    }

    const setTemplates: typeof this.setTemplates = [];

    for (const exerciseTemplate of this.workoutTemplate.exerciseTemplates) {

      for (const setTemplate of exerciseTemplate.setTemplates) {

        setTemplates.push({
          ...setTemplate,
          exerciseTemplateKey: exerciseTemplate.key,
          exerciseName: exerciseTemplate.name,
          exerciseTemplateOrder: exerciseTemplate.order,
        });
      }

      this.expandedRowKeys[exerciseTemplate.key] = this.rowsExpandedByDefault;
    }

    this.setTemplates = setTemplates;
  }

  setActiveCols() {

    let activeColCount = 0;

    for (const col of this.cols) {

      col.active = this.setTemplates.some(setTemplate => notEmpty(setTemplate[col.field]));

      if (col.active) {
        activeColCount++;
      }

    }

    this.activeColCount = activeColCount;
  }

  editWorkoutTemplate() {

    if (!this.workoutTemplate) {
      throw new Error('No workout template provided');
    }

    const navCommands = [ 'workouts', 'edit' ];

    const extras: NavigationExtras = {};

    if (this.workoutTemplate.id) {
      navCommands.push(this.workoutTemplate.id);
    } else {
      extras.state = {
        workoutTemplateKey: this.workoutTemplate.key,
      };
    }
    this.router.navigate(navCommands, extras);
  }

  confirmDeleteWorkoutTemplate() {

    this.schedulesService.schedules$.pipe(take(1))
      .subscribe(schedules => {

        const scheduleWorkouts = schedules.flatMap(schedule => schedule.weeks.flatMap(week => week.workouts));

        const isInSchedule = scheduleWorkouts.some(workout => workout.workoutTemplateKey === this.workoutTemplate?.key);

        if (isInSchedule) {

          this.confirmationService.confirm({
            header: 'Delete Workout Template?',
            message: 'Deleting this workout template will remove it from any schedules it is currently in. Any schedules left with no workout templates will also be deleted.',
            accept: () => this.deleteWorkoutTemplate(),
            acceptIcon: 'pi pi-trash',
            acceptLabel: 'Delete',
            acceptButtonStyleClass: 'p-button-danger',
            rejectLabel: 'Cancel',
            rejectIcon: 'pi pi-times',
            key: 'dialog',
          });

        } else {
          this.deleteWorkoutTemplate();
        }

      });

  }

  async deleteWorkoutTemplate() {

    if (!this.workoutTemplate) {
      throw new Error('No workout template selected');
    }

    const deleted = await this.workoutTemplatesService.removeWorkoutTemplate(this.workoutTemplate);

    if (deleted) {
      this.toasts.success('Workout template deleted');
    }
  }

  async fork() {

    if (!this.workoutTemplate) {
      throw new Error('No workout template selected');
    }

    const forkedWorkoutTemplate = await this.workoutTemplatesService.fork(this.workoutTemplate);

    if (forkedWorkoutTemplate) {

      this.toasts.success('Workout template forked');

      const navCommands = [ '/workouts', 'edit' ];

      const extras: NavigationExtras = {};

      if (forkedWorkoutTemplate.id) {
        navCommands.push(forkedWorkoutTemplate.id);
      } else if (forkedWorkoutTemplate.key) {
        extras.state = {
          workoutTemplateKey: forkedWorkoutTemplate.key,
        };
      }

      this.router.navigate(navCommands, extras);

    }
  }
}
