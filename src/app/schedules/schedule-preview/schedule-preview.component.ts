import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { FullCalendarService } from '../../services/full-calendar.service';
import dayGridWeek from '@fullcalendar/daygrid';
import timeGridWeek from '@fullcalendar/timegrid';
import interaction from '@fullcalendar/interaction';
import { Calendar, CalendarOptions, EventClickArg, EventHoveringArg } from '@fullcalendar/core';
import { cloneDeep } from 'lodash-es';
import { WorkoutTemplatesService } from '../../services/workout-templates.service';
import { SubSink } from 'subsink';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { FormsModule } from '@angular/forms';
import { debounceTime, delay, map, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, Subject, merge } from 'rxjs';
import { FrontendSchedule, FrontendScheduleWeek, FrontendScheduleWorkout, FrontendWorkoutTemplate } from '../../shared/types';
import { WorkoutTemplatePreviewComponent } from '../../workout-templates/workout-template-preview/workout-template-preview.component';
import { ScheduleDescriptionPipe } from '../schedule-description.pipe';
import { TooltipModule } from 'primeng/tooltip';
import { SchedulesService } from '../../services/schedules.service';
import { NavigationExtras, Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ToastsService } from '../../services/toasts.service';
import { SplitButtonModule } from 'primeng/splitbutton';
import { PresetIndicatorComponent } from '../../shared/preset-indicator/preset-indicator.component';
import { EventImpl } from '@fullcalendar/core/internal';
import { Menu, MenuModule } from 'primeng/menu';
import { LayoutService } from '../../services/layout.service';
import { throwIfUndefined } from '../../utils/typescript';
import { DialogModule } from 'primeng/dialog';
import { WorkoutTemplateItemComponent } from '../../workout-templates/workout-template-item/workout-template-item.component';

@Component({
  selector: 'app-schedule-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    ButtonModule,
    ToggleButtonModule,
    OverlayPanelModule,
    WorkoutTemplatePreviewComponent,
    ScheduleDescriptionPipe,
    TooltipModule,
    SplitButtonModule,
    PresetIndicatorComponent,
    MenuModule,
    DialogModule,
    WorkoutTemplateItemComponent,
  ],
  templateUrl: './schedule-preview.component.html',
  styleUrls: ['./schedule-preview.component.scss'],
})
export class SchedulePreviewComponent implements AfterViewInit, OnChanges, OnInit, OnDestroy {

  @Input() schedule?: FrontendSchedule;

  @Input() weeks: FrontendScheduleWeek[] = [];

  @Input() editable = false;

  @Input() showMutateButtons = false;

  @Input() displayShowTimesButton = false;

  @Input() previewWorkoutTemplateOnHover = false;

  @Output() weeksChange = new EventEmitter<FrontendScheduleWeek[]>();

  @Output() onEventAllowed = new EventEmitter<void>();

  @Output() onWorkoutTemplatedDropped = new EventEmitter<void>();

  @ViewChild(FullCalendarComponent, { static: false }) calendar?: FullCalendarComponent;

  @ViewChild(OverlayPanel) workoutTemplatePreviewOverlay?: OverlayPanel;

  @ViewChild(Menu) actionsMenuRef?: Menu;

  onEventDropped$ = new Subject<void>();

  onEventDeleted$ = new Subject<void>();

  onCalendarReady$ = new Subject<void>();

  activeWeek$ = new BehaviorSubject<FrontendScheduleWeek | undefined>(undefined);

  activeWeekIndex = 0;

  calendarApi?: Calendar;

  showTimes = false;

  clearOverlayTimeout?: NodeJS.Timeout;

  subs = new SubSink();

  workoutTemplatePreviewVisible = false;

  activeEvent$ = new BehaviorSubject<EventImpl | undefined>(undefined);

  activeWorkoutTemplateKey$ = this.activeEvent$.pipe(
    map(event => event?.extendedProps['key'] as string),
    withLatestFrom(this.workoutTemplatesService.workoutTemplates$),
    map(([ activeWorkoutTemplateKey, workoutTemplates ]) => {
      return workoutTemplates.find(wt => wt.key === activeWorkoutTemplateKey)?.key;
    }),
  );

  activeWorkoutTemplate$ = this.activeWorkoutTemplateKey$.pipe(
    withLatestFrom(this.workoutTemplatesService.workoutTemplates$),
    map(([ activeWorkoutTemplateKey, workoutTemplates ]) => {
      return workoutTemplates.find(wt => wt.key === activeWorkoutTemplateKey);
    }),
  );

  scheduleActions: MenuItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.editSchedule(),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.confirmDeleteSchedule(),
    },
    {
      id: 'fork',
      label: 'Fork',
      icon: 'pi pi-share-alt',
      command: () => this.fork(),
      tooltipOptions: { tooltipLabel: 'Make an editable copy of this schedule', tooltipPosition: 'left' },
    }
  ];

  workoutTemplateActions: MenuItem[] = [
    {
      id: 'view',
      label: 'View',
      icon: 'pi pi-eye',
      command: () => this.workoutTemplatePreviewVisible = true,
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.editWorkoutTemplate(),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.removeWorkoutTemplate(),
    }
  ];

  defaultCalendarOptions: CalendarOptions = {
    headerToolbar: false,
    editable: this.editable,
    initialView: 'dayGridWeek',
    aspectRatio: 2.5,
    plugins: [ dayGridWeek, timeGridWeek, interaction ],
    dayHeaderFormat: { weekday: 'long' },
    eventOrder: 'lastModified',
    forceEventDuration: true,
    eventDidMount: (args) => {
      const { event } = args;
      if (!event.allDay) { return; }
      event.setExtendedProp('lastModified', new Date().getTime());
    },
    eventContent: (args) => this.fullCalendarService.getScheduleEventContent(args),
    eventAllow: () => {
      this.onEventAllowed.emit();
      return true;
    },
    eventClick: (args) => {
      this.handleWorkoutTemplateClick(args);
    },
    drop: () => this.onWorkoutTemplatedDropped.emit(),
    eventDrop: () => {
      this.onEventDropped$.next();
    },
    eventReceive: () => {
      this.onEventDropped$.next();
    },
    eventResize: () => {
      this.onEventDropped$.next();
    },
    eventMouseEnter: (args) => {
      this.handleWorkoutTemplateHover(args);
    },
    eventMouseLeave: () => {
      this.startClearOverlayCountdown();
    },
  }

  calendarOptions = cloneDeep(this.defaultCalendarOptions);

  constructor(
    private fullCalendarService: FullCalendarService,
    public workoutTemplatesService: WorkoutTemplatesService,
    private schedulesService: SchedulesService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private toasts: ToastsService,
    private cd: ChangeDetectorRef,
    private layoutService: LayoutService,
  ) {}

  ngOnInit(): void {
    this.subs.sink = merge(this.onEventDropped$, this.onEventDeleted$).pipe(
      switchMap(() => this.workoutTemplatesService.workoutTemplates$),
      withLatestFrom(this.activeWeek$),
    ).subscribe(([ workoutTemplates, activeWeek ]) => {

        if (!this.calendarApi) { return; }

        const updatedWeek = {
          ...activeWeek,
          workouts: this.getCalendarWorkouts(workoutTemplates),
        }

        const updatedWeeks = [ ...this.weeks ];

        updatedWeeks[this.activeWeekIndex] = updatedWeek;

        this.weeks = updatedWeeks;

        this.weeksChange.emit(updatedWeeks);
      });

    this.subs.sink = this.onCalendarReady$.pipe(
      take(1),
      switchMap(() => this.activeWeek$),
      withLatestFrom(this.workoutTemplatesService.workoutTemplates$),
    ).subscribe(([ activeWeek, workoutTemplates ]) => this.loadWeekWorkouts(workoutTemplates, activeWeek));

    this.layoutService.sidebarClicked$
      .pipe(
        debounceTime(100),
        delay(100),
      )
    .subscribe(() => {
      this.calendarApi?.updateSize();
    });
  }

  ngAfterViewInit(): void {
    this.initCalendarApi();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['editable']) {
      this.setEditable();
    }

    if (changes['weeks']) {
      this.activeWeek$.next(this.weeks[this.activeWeekIndex]);
    }

    if (changes['schedule']) {
      this.setDisabledActions();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  initCalendarApi() {
    if (!this.calendar) {
      throw new Error('Calendar not found');
    }

    this.calendarApi = this.calendar.getApi();

    this.onCalendarReady$.next();
  }

  setEditable() {
    if (this.calendarApi) {
      this.calendarApi.setOption('editable', this.editable);
    } else {
      this.calendarOptions.editable = this.editable;
    }
  }

  updateCalendarView() {
    if (!this.calendarApi) { return; }

    if (this.showTimes) {
      this.calendarApi.changeView('timeGridWeek');
    } else {
      this.calendarApi.changeView('dayGridWeek');
    }
  }

  loadWeekWorkouts(workoutTemplates: FrontendWorkoutTemplate[], week?: FrontendScheduleWeek) {

    if (!week) {
      this.calendarApi?.removeAllEvents();
      return;
    }

    const { showTimes } = this.fullCalendarService.loadScheduleWeekWorkouts(week, workoutTemplates, this.calendarApi);

    this.setCalendarView(showTimes);

    this.cd.detectChanges();
  }

  setCalendarView(showTimes: boolean) {
    this.showTimes = showTimes;
    this.updateCalendarView();
  }

  setActiveWeek(index: number) {
    this.activeWeekIndex = index;
    this.activeWeek$.next(this.weeks[this.activeWeekIndex]);
  }

  getCalendarWorkouts(workoutTemplates: FrontendWorkoutTemplate[]): FrontendScheduleWorkout[] {

    if (!this.calendarApi) {
      throw new Error('getCalendarWorkouts called before calendarApi was set');
    }

    const events = this.calendarApi.getEvents();

    const workouts: FrontendScheduleWorkout[] = [];

    for (const event of events) {

      if (!event.start) { continue; }

      let dow = event.start.getDay();

      const workoutTemplateKey = event.extendedProps['key'];

      const workoutTemplate = workoutTemplates.find(wt => wt.key === workoutTemplateKey);

      const newWorkout: FrontendScheduleWorkout = {
        workoutTemplateKey,
        dow,
        allDay: event.allDay,
        id: event.id.length ? event.id : undefined,
        workoutTemplateId: workoutTemplate?.id,
      }

      if (!event.allDay) {

        if (!event.end) {
          throw new Error('Events with times must have an end time');
        }

        newWorkout.start = event.start.toTimeString().split(' ')[0];
        newWorkout.end = event.end.toTimeString().split(' ')[0];
      }

      workouts.push(newWorkout);
    }

    return workouts;
  }

  addWeek() {
    const updatedWeeks = [ ...this.weeks ];

    updatedWeeks.push({ workouts: [] });

    this.weeks = updatedWeeks;

    this.weeksChange.emit(updatedWeeks);

    this.setActiveWeek(updatedWeeks.length - 1);
  }

  deleteWeek(currentWeekIndex: number) {

    const updatedWeeks = [ ...this.weeks ];

    updatedWeeks.splice(currentWeekIndex, 1);

    this.weeks = updatedWeeks;

    this.weeksChange.emit(updatedWeeks);

    if (currentWeekIndex > 0) {
      this.setActiveWeek(currentWeekIndex - 1);
    } else {
      this.setActiveWeek(0);
    }
  }

  handleWorkoutTemplateClick(args: EventClickArg) {

    if (!this.editable) { return; }

    this.workoutTemplatePreviewOverlay?.hide();

    this.activeEvent$.next(args.event);

    this.activeWorkoutTemplate$.pipe(
      take(1),
      throwIfUndefined(() => new Error('No active workout template')),
    ).subscribe(activeWorkoutTemplate => {

      this.setWorkoutTemplateActionsDisabled(activeWorkoutTemplate);

      if (this.actionsMenuRef) {
        this.actionsMenuRef.toggle(args.jsEvent);
        this.actionsMenuRef.target = args.el;
      }
    });
  }

  handleWorkoutTemplateHover(args: EventHoveringArg) {

    if (!this.previewWorkoutTemplateOnHover) { return; }

    this.activeEvent$.next(args.event);

    this.cancelClearOverlayCountdown();

    const alreadyShown = this.workoutTemplatePreviewOverlay?.overlayVisible;

    this.workoutTemplatePreviewOverlay?.show(args.jsEvent, args.el);

    if (alreadyShown) {
      this.workoutTemplatePreviewOverlay?.align();
    }
  }

  startClearOverlayCountdown() {

    if (!this.previewWorkoutTemplateOnHover) { return; }

    this.clearOverlayTimeout = setTimeout(() => {
      this.workoutTemplatePreviewOverlay?.hide();
    }, 100);
  }

  cancelClearOverlayCountdown() {
    if (this.clearOverlayTimeout) {
      clearTimeout(this.clearOverlayTimeout);
    }
  }

  editSchedule() {

    if (!this.schedule) {
      throw new Error('No schedule provided');
    }

    const navCommands = [ 'schedules', 'edit' ];

    const extras: NavigationExtras = {};

    if (this.schedule.id) {
      navCommands.push(this.schedule.id);
    } else if (this.schedule?.key) {
      extras.state = { scheduleKey: this.schedule.key };
    }

    this.router.navigate(navCommands, extras);
  }

  confirmDeleteSchedule() {

    this.confirmationService.confirm({
      header: 'Delete Schedule?',
      message: 'Are you sure you want to delete this schedule? This action cannot be undone.',
      accept: () => this.deleteSchedule(),
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Delete',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      rejectIcon: 'pi pi-times',
      key: 'dialog',
    });
  }

  async deleteSchedule() {

    if (!this.schedule) {
      throw new Error('No schedule selected');
    }

    const deleted = await this.schedulesService.removeSchedule(this.schedule);

    if (deleted) {
      this.toasts.success('Schedule deleted');
    }
  }

  generateProgram() {

    if (!this.schedule) {
      throw new Error('No schedule provided');
    }

    this.router.navigate([ 'programs', 'new' ], {
      state: {
        scheduleKey: this.schedule.key,
      }
    });
  }

  setDisabledActions() {
    for (const action of this.scheduleActions) {

      if (action.id === 'fork') { continue; }

      const disabled = !this.schedule || this.schedule.preset;

      const tooltipLabel = `Cannot ${action?.label?.toLowerCase()} a preset schedule`;

      action.disabled = disabled;

      action.tooltipOptions = disabled ? { tooltipLabel, tooltipPosition: 'left' } : undefined;
    }
  }

  async fork() {

    if (!this.schedule) {
      throw new Error('No schedule provided');
    }

    const forkedSchedule = await this.schedulesService.fork(this.schedule);

    if (forkedSchedule) {

      this.toasts.success('Schedule forked');

      const extras: NavigationExtras = {};

      const navCommands = [ '/schedules', 'edit' ];

      if (forkedSchedule?.id) {
        navCommands.push(forkedSchedule.id);
      } else {
        extras.state = { scheduleKey: forkedSchedule.key };
      }

      this.router.navigate(navCommands, extras);
    }
  }

  removeWorkoutTemplate() {

    this.activeEvent$.pipe(
      take(1),
      throwIfUndefined(() => new Error('No active event')),
    ).subscribe(event => {

      event.remove();

      this.onEventDeleted$.next();
    });

  }

  editWorkoutTemplate() {
    this.activeWorkoutTemplate$.pipe(
      take(1),
      throwIfUndefined(() => new Error('No active workout template')),
    )
      .subscribe(workoutTemplate => {

        const navCommands = [ 'workouts', 'edit' ];

        const extras: NavigationExtras = {};

        if (workoutTemplate?.id) {
          navCommands.push(workoutTemplate.id);
        } else {
          extras.state = { workoutTemplateKey: workoutTemplate.key };
        }

        this.router.navigate(navCommands, extras);
      });
  }

  setWorkoutTemplateActionsDisabled(activeWorkoutTemplate: FrontendWorkoutTemplate) {

    const editAction = this.workoutTemplateActions.find(action => action.id === 'edit');

    if (!editAction) {
      throw new Error('Edit action not found');
    }

    editAction.disabled = activeWorkoutTemplate.preset;

    editAction.tooltipOptions = editAction.disabled ? { tooltipLabel: 'Cannot edit a preset workout template', tooltipPosition: 'left' }: undefined;
  }

}
