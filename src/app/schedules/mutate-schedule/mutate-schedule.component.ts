import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild  } from '@angular/core';
import { Draggable } from '@fullcalendar/interaction';
import { FullCalendarService } from '../../services/full-calendar.service';
import { WorkoutTemplatesService } from '../../services/workout-templates.service';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, switchMap, take, tap } from 'rxjs';
import { SubSink } from 'subsink';
import { WorkoutTemplateDataPipe } from '../../workout-templates/workout-template-data.pipe';
import { FormsModule } from '@angular/forms';
import { throwIfUndefined } from '../../utils/typescript';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CommonModule } from '@angular/common';
import { EditInPlaceComponent } from '../../shared/edit-in-place/edit-in-place.component';
import { FixedOverlayComponent } from '../../shared/fixed-overlay/fixed-overlay.component';
import { Listbox, ListboxModule } from 'primeng/listbox';
import { WorkoutTemplateItemComponent } from '../../workout-templates/workout-template-item/workout-template-item.component';
import { SchedulePreviewComponent } from '../schedule-preview/schedule-preview.component';
import { ToastsService } from '../../services/toasts.service';
import { FrontendSchedule, FrontendScheduleWeek, FrontendWorkoutTemplate, MutateScheduleInput } from '../../shared/types';
import { SchedulesService } from '../../services/schedules.service';
import { SchedulesGQL } from '../../../generated/graphql.generated';
import { partition } from 'lodash-es';
import { HasUnsavedChanged } from '../../guards/unsaved-changes.guard';
import { TooltipModule } from 'primeng/tooltip';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-mutate-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WorkoutTemplateDataPipe,
    InputTextModule,
    ButtonModule,
    ToggleButtonModule,
    EditInPlaceComponent,
    FixedOverlayComponent,
    ListboxModule,
    WorkoutTemplateItemComponent,
    SchedulePreviewComponent,
    TooltipModule,
  ],
  templateUrl: './mutate-schedule.component.html',
  styleUrls: ['./mutate-schedule.component.scss']
})
export class MutateScheduleComponent implements AfterViewInit, OnDestroy, HasUnsavedChanged {

  @ViewChild(SchedulePreviewComponent) schedulePreviewRef?: SchedulePreviewComponent;

  @ViewChild(Listbox) listboxRef?: Listbox;

  @ViewChild(FixedOverlayComponent) fixedOverlayRef?: FixedOverlayComponent;

  mode!: 'create' | 'edit';

  scheduleId?: string;

  scheduleKey?: string;

  name = 'New Schedule';

  weeks: FrontendScheduleWeek[] = [
    { workouts: [] },
  ];

  subs = new SubSink();

  workoutTemplates$ = this.workoutTemplatesService.workoutTemplates$.pipe(map(workoutTemplates => this.groupWorkoutTemplates(workoutTemplates)));;

  draggableSelector = 'fc-workout';

  saving = false;

  hasChanges = false;

  workoutCount = 0;

  passedData = {
    scheduleKey: undefined,
    scheduleName: undefined,
  }

  constructor(
    public fullCalendar: FullCalendarService,
    private schedulesService: SchedulesService,
    private schedulesGQL: SchedulesGQL,
    private workoutTemplatesService: WorkoutTemplatesService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private cd: ChangeDetectorRef,
    private toasts: ToastsService,
    private navigationService: NavigationService,
  ) {

    const navigation = this.router.getCurrentNavigation();

    const { scheduleName, scheduleKey } = navigation?.extras?.state || {};

    this.passedData.scheduleName = scheduleName;
    this.passedData.scheduleKey = scheduleKey;
  }

  ngAfterViewInit(): void {
    this.watchUrl();
    this.initDraggables();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  watchUrl() {
    this.subs.sink = this.route.url.pipe(
      tap(url => this.setMode(url)),
      switchMap(() => this.route.paramMap),
      tap(paramMap => this.scheduleId = paramMap.get('scheduleId') || undefined),
      switchMap(() => this.schedulesService.schedules$.pipe(take(1))),
    )
    .subscribe(schedules => {

      if (this.mode === 'create') {

        this.reset();

        if (this.passedData.scheduleName) {
          this.name = this.passedData.scheduleName;
          this.hasChanges = true;
          this.cd.detectChanges();
        }

        return;
      }

      const activeSchedule = schedules.find(s => s.key === this.passedData.scheduleKey);

      if (activeSchedule) {
        this.loadSchedule(activeSchedule);
        return;
      }

      if (this.scheduleId) {
        this.fetchScheduleById(this.scheduleId);
        return;
      }

      console.error('Unable to load workout template: no schedule key or ID found');

      this.router.navigate([ '/schedules' ]);
    });
  }

  fetchScheduleById(scheduleId: string) {
    this.auth.userId$
      .pipe(
        take(1),
        throwIfUndefined(() => 'Unable to fetch schedule: no user ID found'),
        map(userId => {

          return {
            userId,
            filter: { scheduleIds: [ scheduleId ] },
          };

        }),
        switchMap(queryVariables => this.schedulesGQL.fetch(queryVariables).pipe(
          map(res => res.data?.schedules?.[0]),
          throwIfUndefined(() => `Failed to fetch schedule with ID ${ scheduleId }`),
          map(fullScheduleFragment => this.schedulesService.convertSchedules([ fullScheduleFragment ])),
          map(frontendSchedules => frontendSchedules[0]),
        )),
      ).subscribe(schedule => this.loadSchedule(schedule));
  }

  setMode(url: UrlSegment[]) {

    const { path } = url?.[0];

    if (!path) {
      this.router.navigate([ '/not-found' ]);
    }

    if (path === 'new') {
      this.mode = 'create';
    } else if (path === 'edit') {
      this.mode = 'edit';
    } else {
      this.router.navigate([ '/not-found' ]);
    }
  }

  showWorkoutTemplates() {
    if (this.fixedOverlayRef && !this.fixedOverlayRef.overlayVisible) {
      this.fixedOverlayRef.show();
    }
  }

  hideWorkoutTemplates() {
    if (this.fixedOverlayRef && this.fixedOverlayRef.overlayVisible) {
      this.fixedOverlayRef.hide();
    }
  }

  async saveChanges(navigateOnSucces?: boolean) {

    const input: MutateScheduleInput = {
      name: this.name,
      weeks: this.weeks,
    }

    let editedSchedule: FrontendSchedule | null = null;

    this.saving = true;

    if (this.mode === 'create') {
      editedSchedule = await this.schedulesService.addSchedule(input);
    } else if (this.mode === 'edit') {
      editedSchedule = await this.schedulesService.editSchedule(input, {
        scheduleKey: this.scheduleKey,
        scheduleId: this.scheduleId,
      });
    }

    this.saving = false;

    if (editedSchedule) {
      this.hasChanges = false;

      const successMsg = this.mode === 'create' ? 'Schedule created' : 'Schedule saved';

      this.toasts.success(successMsg);
    }

    if (editedSchedule && navigateOnSucces) {
      this.router.navigate([ 'schedules' ], {
        state: {
          scheduleKey: editedSchedule.key,
        },
      });
    }
  }

  loadSchedule(activeSchedule: FrontendSchedule) {
    this.name = activeSchedule.name;
    this.scheduleKey = activeSchedule.key;
    this.weeks = activeSchedule.weeks;
    this.workoutCount = activeSchedule.weeks.flatMap(week => week.workouts).length;
    this.cd.detectChanges();
  }

  initDraggables() {
    if (!this.listboxRef) {
      throw new Error('Draggables listbox not found');
    }

    new Draggable(this.listboxRef.el.nativeElement, {
      itemSelector: `.${ this.draggableSelector }`,
    });
  }

  reset() {
    this.scheduleId = undefined;
    this.name = 'New Schedule';
    this.weeks =  [ { workouts: [] } ];
    this.passedData = {
      scheduleKey: undefined,
      scheduleName: undefined,
    };
  }

  groupWorkoutTemplates(workoutTemplates: FrontendWorkoutTemplate[]) {

    const output: {
      label: string;
      items: FrontendWorkoutTemplate[];
    }[] = [];

    const [ preset, custom ] = partition(workoutTemplates, 'preset');

    if (custom.length > 0) {
      output.push({
        label: 'Custom',
        items: custom,
      });
    }

    if (preset.length > 0) {
      output.push({
        label: 'Preset',
        items: preset,
      });
    }

    return output;
  }

  markAsChanged() {
    this.hasChanges = true;
  }

  hasUnsavedChanges(): boolean {
    return this.hasChanges;
  }

  goToCreateWorkoutTemplate(workoutTemplateName: string | null | undefined) {
    this.router.navigate([ '/workouts', 'new' ], {
      state: {
        workoutTemplateName,
      }
    });
  }

  canSaveChanges(): { canSave: boolean; message?: string | undefined; } {

    const canSave = this.workoutCount > 0 && Boolean(this.name);

    if (canSave) {
      return { canSave };
    }

    let message: string | undefined = undefined;

    if (this.workoutCount === 0) {
      message = `You have unsaved changes, but they can't be saved until you add some workouts to this schedule`;
    } else if (!this.name) {
      message = `You have unsaved changes, but they can't be saved until you enter a name.`;
    }

    return {
      canSave,
    }
  }

  handleWeekChanges(weeks: FrontendScheduleWeek[]) {
    const weekWorkouts = weeks.flatMap(week => week.workouts);
    this.workoutCount = weekWorkouts.length;
    this.markAsChanged();
  }


  discardChanges() {
    this.hasChanges = false;
    this.navigationService.goBack('/schedules');
  }
}

