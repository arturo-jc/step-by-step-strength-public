import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchedulesService } from '../../services/schedules.service';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { SchedulePreviewComponent } from '../schedule-preview/schedule-preview.component';
import { ScheduleDescriptionPipe } from '../schedule-description.pipe';
import { WorkoutTemplatesService } from '../../services/workout-templates.service';
import { SubSink } from 'subsink';
import { FrontendSchedule } from '../../shared/types';
import { TooltipModule } from 'primeng/tooltip';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RESOURCE_MAP } from '../../global';
import { SelectedItemPlaceholderComponent } from '../../shared/selected-item-placeholder/selected-item-placeholder.component';
import { PresetIndicatorComponent } from '../../shared/preset-indicator/preset-indicator.component';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ListboxModule,
    SchedulePreviewComponent,
    ButtonModule,
    ScheduleDescriptionPipe,
    TooltipModule,
    ToggleButtonModule,
    RouterLink,
    SelectedItemPlaceholderComponent,
    PresetIndicatorComponent,
  ],
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss'],
})
export class SchedulesComponent implements OnInit, OnDestroy {

  selectedSchedule?: FrontendSchedule;

  hidePresets$ = new BehaviorSubject<boolean>(false);

  subs = new SubSink();

  passedData = {
    scheduleKey: undefined,
  }

  filteredSchedules$ = combineLatest([
    this.schedulesService.schedules$,
    this.hidePresets$,
  ]).pipe(
    map(([ schedules, hidePresets ]) => schedules.filter(schedule => !hidePresets || !schedule.preset)),
  );

  resourceMap = RESOURCE_MAP;

  constructor(
    public schedulesService: SchedulesService,
    public workoutTemplatesService: WorkoutTemplatesService,
    private router: Router,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.passedData.scheduleKey = navigation?.extras?.state?.['scheduleKey'];
  }

  ngOnInit(): void {
    this.subs.sink  = this.filteredSchedules$.subscribe(schedules => {

      const activeSchedule = schedules.find(s => s.key === this.passedData.scheduleKey);

      if (schedules.length === 0) {
        this.selectedSchedule = undefined;
        return;
      }

      if (activeSchedule) {

        const requiredSchedule = schedules.find(s => s.key === activeSchedule.key);

        this.selectedSchedule = requiredSchedule || schedules[0];

        return;
      }

      if (!this.selectedSchedule || !schedules.includes(this.selectedSchedule)) {
        this.selectedSchedule = schedules[0];
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleHidePresets(hide?: boolean) {
    this.hidePresets$.next(hide || false);
    this.passedData.scheduleKey = undefined;
  }

}
