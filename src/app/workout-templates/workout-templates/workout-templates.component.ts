import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutTemplatesService } from '../../services/workout-templates.service';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { WorkoutTemplatePreviewComponent } from '../workout-template-preview/workout-template-preview.component';
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { WorkoutTemplateDescriptionPipe } from '../workout-template-description.pipe';
import { WorkoutTemplateItemComponent } from '../workout-template-item/workout-template-item.component';
import { SubSink } from 'subsink';
import { FrontendWorkoutTemplate } from '../../shared/types';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectedItemPlaceholderComponent } from '../../shared/selected-item-placeholder/selected-item-placeholder.component';
import { RESOURCE_MAP } from '../../global';

@Component({
  selector: 'app-workout-templates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    WorkoutTemplatePreviewComponent,
    ListboxModule,
    WorkoutTemplateDescriptionPipe,
    WorkoutTemplateItemComponent,
    RouterLink,
    ToggleButtonModule,
    SelectedItemPlaceholderComponent,
  ],
  templateUrl: './workout-templates.component.html',
  styleUrls: ['./workout-templates.component.scss'],
})
export class WorkoutTemplatesComponent implements OnInit, OnDestroy {

  @Input() selectedWorkoutTemplate?: FrontendWorkoutTemplate;

  hidePresets$ = new BehaviorSubject<boolean>(false);

  subs = new SubSink();

  passedData = {
    workoutTemplateKey: undefined,
  }

  filteredWorkoutTemplates$ = combineLatest([
    this.workoutTemplatesService.workoutTemplates$,
    this.hidePresets$,
  ]).pipe(
    map(([ workoutTemplates, hidePresets ]) => workoutTemplates.filter(workoutTemplate => !hidePresets || !workoutTemplate.preset)),
  );

  resourceMap = RESOURCE_MAP;

  constructor(
    public workoutTemplatesService: WorkoutTemplatesService,
    private router: Router,
  ) {
    const { workoutTemplateKey } = this.router.getCurrentNavigation()?.extras?.state || {};
    this.passedData.workoutTemplateKey = workoutTemplateKey;
  }

  ngOnInit(): void {
    this.subs.sink = this.filteredWorkoutTemplates$.subscribe(workoutTemplates => {

      if (workoutTemplates.length === 0) {
        this.selectedWorkoutTemplate = undefined;
        return;
      }

      const activeWorkoutTemplate = workoutTemplates.find(workoutTemplate => workoutTemplate.key === this.passedData.workoutTemplateKey);

      if (activeWorkoutTemplate) {

        const requiredTemplate = workoutTemplates.find(workoutTemplate => workoutTemplate.key === activeWorkoutTemplate.key);

        this.selectedWorkoutTemplate = requiredTemplate || workoutTemplates[0];

        return;
      }

      if (!this.selectedWorkoutTemplate || !workoutTemplates.includes(this.selectedWorkoutTemplate)) {
        this.selectedWorkoutTemplate = workoutTemplates[0];
      }

    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleHidePresets(hide?: boolean) {
    this.hidePresets$.next(hide || false);
    this.passedData.workoutTemplateKey = undefined;
  }

}
