import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { Calendar, CalendarOptions, DatesSetArg, EventClickArg, EventHoveringArg } from '@fullcalendar/core';
import dayGridWeek from '@fullcalendar/daygrid';
import timeGridWeek from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid'
import interaction from '@fullcalendar/interaction';
import { cloneDeep } from 'lodash-es';
import { FullCalendarService } from '../../services/full-calendar.service';
import dayjs from '../../shared/dayjs/dayjs';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { DATE_FORMAT } from '../../global';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MutateWorkoutComponent } from '../../workouts/mutate-workout/mutate-workout.component';
import { EventImpl } from '@fullcalendar/core/internal';
import { FrontendExercise, FrontendProgram, FrontendWorkout } from '../../shared/types';
import { BehaviorSubject } from 'rxjs';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { WorkoutPreviewComponent } from '../../workouts/workout-preview/workout-preview.component';
import { ProgramDescriptionPipe } from '../program-description.pipe';
import { ProgramsService } from '../../services/programs.service';
import { NavigationExtras, Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ToastsService } from '../../services/toasts.service';
import { Menu, MenuModule } from 'primeng/menu';

export type ViewOption = 'day' | 'week' | 'month';

export interface OnDateSetOutput {
  viewTitle: string;
  dateInfo: DatesSetArg;
  currentDate: Date;
}

@Component({
  selector: 'app-program-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    ButtonModule,
    SelectButtonModule,
    ToggleButtonModule,
    OverlayPanelModule,
    WorkoutPreviewComponent,
    ProgramDescriptionPipe,
    MenuModule,
  ],
  templateUrl: './program-preview.component.html',
  styleUrls: ['./program-preview.component.scss'],
})
export class ProgramPreviewComponent implements AfterViewInit, OnChanges {

  @Input() program?: FrontendProgram;

  @Input() workouts: FrontendWorkout[] = [];

  @Input() editable = false;

  @Input() previewWorkoutOnHover = false;

  @Input() showMutateButtons = true;

  @Output() workoutsChange = new EventEmitter<FrontendWorkout[]>();

  @ViewChild(FullCalendarComponent, { static: false }) calendar?: FullCalendarComponent;

  @ViewChild(OverlayPanel) overlayPanel?: OverlayPanel;

  @ViewChild(Menu) menuRef?: Menu;

  earliestWorkoutDate?: dayjs.Dayjs;

  latestWorkoutDate?: dayjs.Dayjs;

  // Workout being previed
  activeWorkout$ = new BehaviorSubject<FrontendWorkout | undefined>(undefined);

  calendarTitle?: string;

  calendarEventViews: { label: string; value: ViewOption }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  selectedView: ViewOption = 'week';

  showTimes = false;

  prevEnabled = true;

  nextEnabled = true;

  todayEnabled = false;

  calendarApi?: Calendar;

  currentYear?: string;

  mutateWorkoutDialogRef?: DynamicDialogRef;

  clearOverlayTimeout?: NodeJS.Timeout;

  activeWorkoutEvent?: EventImpl;

  workoutActions: MenuItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.openMutateWorkoutDialog(),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.deleteActiveWorkout(),
    }
  ]

  defaultCalendarOptions: CalendarOptions = {
    headerToolbar: false,
    editable: this.editable,
    initialView: 'dayGridWeek',
    aspectRatio: 2.5,
    plugins: [ dayGridWeek, timeGridWeek, dayGridPlugin, interaction ],
    dayHeaderFormat: { weekday: 'long' },
    eventOrder: 'lastModified',
    forceEventDuration: true,
    eventContent: (args) => this.fullCalendarService.getProgramEventcontent(args),
    datesSet: (dateInfo) => {
      if (!this.calendarApi) { return; }
      const { viewTitle, currentDate } = this.calendarApi.getCurrentData();
      this.handleDateSet({ viewTitle, dateInfo, currentDate });
    },
    eventChange: () => {
      this.handleEventChange();
    },
    eventClick: (args) => {
      if (this.editable) {
        this.openMenu(args);
      }
    },
    eventMouseEnter: (args) => {
      const exerciseKey = args.event.extendedProps['key'] as string;
      this.handleWorkoutHover(args, exerciseKey);
    },
    eventMouseLeave: (args) => {
      this.startClearOverlayCountdown();
    }
  }

  calendarOptions = cloneDeep(this.defaultCalendarOptions);

  constructor(
    private fullCalendarService: FullCalendarService,
    private cd: ChangeDetectorRef,
    private dialogService: DialogService,
    private programsService: ProgramsService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private toasts: ToastsService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['workouts']) {
      this.setDates();
      this.loadWorkouts();
    }

    if (changes['editable']) {
      if (this.calendarApi) {
        this.calendarApi.setOption('editable', this.editable);
      } else {
        this.calendarOptions.editable = this.editable;
      }
    }
  }

  ngAfterViewInit(): void {
    this.calendarApi = this.calendar?.getApi();
    this.loadWorkouts();
  }

  loadWorkouts() {

    if (!this.calendarApi) { return; }

    const currentDate = this.calendarApi.getDate();

    this.currentYear = dayjs(currentDate).format('YYYY');

    this.loadCurrentBatch(this.calendarApi);
  }

  loadCurrentBatch(calendar: Calendar) {

    const currentBatch = this.getCurrentBatch();

    const { showTimes } = this.fullCalendarService.loadProgramWorkouts(currentBatch, calendar);

    this.showTimes = showTimes;

    this.setCalendarView(showTimes);
  }

  setCalendarView(showTimes: boolean) {

    this.showTimes = showTimes;

    this.updateCalendarView();
  }

  updateCalendarView() {
    if (!this.calendarApi) { return; }

    if (this.selectedView === 'month') {
      this.calendarApi.changeView('dayGridMonth');
      return;
    }

    if (this.selectedView === 'week' && this.showTimes) {
      this.calendarApi.changeView('timeGridWeek');
      return;
    }

    if (this.selectedView === 'week' && !this.showTimes) {
      this.calendarApi.changeView('dayGridWeek');
      return;
    }

    if (this.selectedView === 'day' && this.showTimes) {
      this.calendarApi.changeView('timeGridDay');
      return;
    }

    if (this.selectedView === 'day' && !this.showTimes) {
      this.calendarApi.changeView('dayGridDay');
      return;
    }
  }

  goToPrev() {
    if (!this.calendarApi) {
      throw new Error('Calendar API not initialized');
    }
    this.calendarApi.prev();
  }

  goToNext() {
    if (!this.calendarApi) {
      throw new Error('Calendar API not initialized');
    }
    this.calendarApi.next();
  }

  goToToday() {
    if (!this.calendarApi) {
      throw new Error('Calendar API not initialized');
    }
    this.calendarApi.today();
  }

  handleDateSet(onDateSetOutput: OnDateSetOutput) {
    this.setCalendarTitle(onDateSetOutput.viewTitle);
    this.setTodayEnabled(onDateSetOutput.dateInfo);
    this.setPrevEnabled(onDateSetOutput.dateInfo);
    this.setNextEnabled(onDateSetOutput.dateInfo);
    this.checkYear(onDateSetOutput.currentDate);
    this.cd.detectChanges();
  }

  setCalendarTitle(date?: string) {
    this.calendarTitle = date;
  }

  setTodayEnabled(date: DatesSetArg) {
    const todayShown = dayjs().isBetween(date.start, date.end);
    this.todayEnabled = !todayShown;
  }

  setPrevEnabled(date: DatesSetArg) {
    const isAfterEarliestWorkout = this.earliestWorkoutDate && dayjs(date.start).isAfter(this.earliestWorkoutDate);
    const isAfterToday = dayjs(date.start).isAfter(dayjs());
    this.prevEnabled = isAfterEarliestWorkout || isAfterToday;
  }

  setNextEnabled(date: DatesSetArg) {
    const isBeforeLatestWorkout = this.latestWorkoutDate && dayjs(date.end).isBefore(this.latestWorkoutDate);
    const isBeforeToday = dayjs(date.end).isBefore(dayjs());
    this.nextEnabled = isBeforeLatestWorkout || isBeforeToday;
  }

  checkYear(currentDate: Date) {

    const year = dayjs(currentDate).format('YYYY');

    if (this.currentYear === year) { return; }

    this.currentYear = year;

    if (!this.calendarApi) {
      throw new Error('Calendar API not initialized');
    }

    this.loadCurrentBatch(this.calendarApi);
  }

  setDates() {
    if (!this.workouts.length) { return; }

    const dates = this.workouts.map(w => dayjs(w.start));

    const earliest = dayjs.min(dates);
    const latest = dayjs.max(dates);

    if (!earliest || !latest) {
      throw new Error('Invalid dates');
    }

    this.earliestWorkoutDate = earliest;
    this.latestWorkoutDate = latest;
  }

  handleEventChange() {

    if (!this.calendarApi) {
      throw new Error('handleEventchanged called before calendarApi was initialized');
    }

    const events = this.calendarApi.getEvents();

    const updatedWorkouts = [];

    for (const workout of this.workouts) {

      const updatedWorkout = events.find(event => event.extendedProps['key'] === workout.key);

      if (updatedWorkout) {
        updatedWorkouts.push(this.getWorkout(updatedWorkout));
      };

    }

    this.workouts = updatedWorkouts;

    this.workoutsChange.emit(updatedWorkouts);
  }

  getWorkout(event: EventImpl): FrontendWorkout {

    if (!event.start) { 
      throw new Error('Event start date is undefined');
    }

    const exercises = event.extendedProps['exercises'] as FrontendExercise[];

    const key = event.extendedProps['key'] as string;

    const start = this.getWorkoutDateTime(event.start, event.allDay);

    const end = event.allDay ? start : this.getWorkoutDateTime(event.end, event.allDay);

    if (!start || !end) {
      throw new Error('Event start or end date is undefined');
    }

    return {
      name: event.title,
      id: event.id,
      key,
      exercises,
      start,
      end,
      backgroundColor: event.backgroundColor,
    }
  }

  getWorkoutDateTime(dateTime: Date | null, allDay?: boolean) {

    if (!dateTime) { return; }

    const day = dayjs(dateTime).format(DATE_FORMAT);

    if (allDay) {
      return day;
    }

    const time = dayjs(dateTime).format('h:mm A');

    return `${day} ${time}`;
  }

  openMutateWorkoutDialog() {

    if (!this.activeWorkoutEvent) {
      throw new Error('No active event');
    }

    this.menuRef?.hide();

    const workout = this.getWorkout(this.activeWorkoutEvent);

    this.mutateWorkoutDialogRef = this.dialogService.open(MutateWorkoutComponent, {
      header: `Edit ${workout.name} on ${workout.start}`,
      data: { workout },
    });

    this.mutateWorkoutDialogRef.onClose.subscribe((editedWorkout?: FrontendWorkout) => {

      if (!editedWorkout) { return; }

      const editedWorkoutIndex = this.workouts.findIndex(w => w.key === editedWorkout.key);

      const updatedWorkouts = [ ...this.workouts ];

      updatedWorkouts[editedWorkoutIndex] = editedWorkout;

      this.workouts = updatedWorkouts;

      this.workoutsChange.emit(updatedWorkouts);
    })
  }

  getCurrentBatch() {
    if (!this.currentYear) {
      throw new Error('Current year is undefined');
    }

    const previousYear = dayjs(this.currentYear).subtract(1, 'year').format('YYYY');

    const nextYear = dayjs(this.currentYear).add(1, 'year').format('YYYY');

    return this.workouts.filter(w => {

      if (w.start.startsWith(this.currentYear as string)) { return true; }

      const startsEndOfLastYear = w.start.startsWith(`${previousYear}/12`);

      const startsBeginningOfNextYear = w.start.startsWith(`${nextYear}/01`);

      return startsEndOfLastYear || startsBeginningOfNextYear;
    });
  }

  handleWorkoutHover(args: EventHoveringArg, workoutKey?: string) {

    if (!workoutKey || !this.previewWorkoutOnHover) { return; }

    const workout = this.workouts.find(w => w.key === workoutKey);

    if (!workout) {
      throw new Error(`Workout not found for key ${workoutKey}`);
    }

    this.cancelClearOverlayCountdown();

    this.activeWorkout$.next(workout);

    const alreadyShown = this.overlayPanel?.overlayVisible;

    this.overlayPanel?.show(args.jsEvent, args.el);

    if (alreadyShown) {
      this.overlayPanel?.align();
    }
  }

  startClearOverlayCountdown() {

    if (!this.previewWorkoutOnHover) { return; }

    this.clearOverlayTimeout = setTimeout(() => {
      this.overlayPanel?.hide();
    }, 100);
  }

  cancelClearOverlayCountdown() {
    if (this.clearOverlayTimeout) {
      clearTimeout(this.clearOverlayTimeout);
    }
  }

  editProgram() {

    if (!this.program) {
      throw new Error('No program provided');
    }

    const navCommands = [ 'programs', 'edit' ];

    const extras: NavigationExtras = {}

    if (this.program.id) {
      navCommands.push(this.program.id);
    } else if (this.program.key) {
      extras.state = { programKey: this.program.key }
    }

    this.router.navigate(navCommands, extras);
  }

  confirmDeleteProgram() {

    this.confirmationService.confirm({
      header: 'Delete Program?',
      message: 'Are you sure you want to delete this program? This action cannot be undone.',
      accept: () => this.deleteProgram(),
      acceptIcon: 'pi pi-trash',
      acceptLabel: 'Delete',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Cancel',
      rejectIcon: 'pi pi-times',
      key: 'dialog',
    });
  }

  async deleteProgram() {

    if (!this.program) {
      throw new Error('No program selected');
    }

    const deleted = await this.programsService.removeProgram(this.program);

    if (deleted) {
      this.toasts.success('Program deleted');
    }
  }

  openMenu(args: EventClickArg) {

    this.activeWorkoutEvent = args.event;

    if (this.menuRef) {
      this.menuRef.toggle(args.jsEvent);
      this.menuRef.target = args.jsEvent.target;
    }
  }

  deleteActiveWorkout() {

    if (!this.activeWorkoutEvent) {
      throw new Error('No active event');
    }

    this.menuRef?.hide();

    this.activeWorkoutEvent.remove();

    this.handleEventChange();
  }
}
