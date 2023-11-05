import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { EditInPlaceComponent } from '../../shared/edit-in-place/edit-in-place.component';
import { ButtonModule } from 'primeng/button';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { BehaviorSubject, Subject, filter, map, switchMap, take } from 'rxjs';
import { WorkoutTemplatesService } from '../../services/workout-templates.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SubSink } from 'subsink';
import { FieldsetModule } from 'primeng/fieldset';
import { StepsModule } from 'primeng/steps';
import { MessageModule } from 'primeng/message';
import { IncrementComponent } from '../../increments/increment/increment.component';
import { SchedulePreviewComponent } from '../../schedules/schedule-preview/schedule-preview.component';
import { notEmpty } from '../../utils/typescript';
import { ScheduleDropdownComponent } from '../../schedules/schedule-dropdown/schedule-dropdown.component';
import dayjs from '../../shared/dayjs/dayjs';
import { dateRange } from '../../validators/date-range.validator';
import { IcsService, EventInput } from '../../services/ics.service';
import { Router } from '@angular/router';
import { ProgramPreviewComponent } from '../program-preview/program-preview.component';
import { DATE_FORMAT, RESOURCE_MAP } from '../../global';
import { ToastsService } from '../../services/toasts.service';
import {
  DurationType,
  FrontendExercise,
  FrontendProgramSet,
  FrontendSchedule,
  FrontendScheduleWorkout,
  FrontendSetTemplate,
  FrontendWorkout,
  FrontendWorkoutTemplate,
  Increment,
  Metric,
  MutateProgramInput,
} from '../../shared/types';
import { ProgramsService } from '../../services/programs.service';
import { getDateTime } from '../../utils/time';
import { maxWorkouts } from '../../validators/max-workouts.validator';
import { WorkoutsService } from '../../services/workouts.service';
import { IncrementsMap } from '../../increments/increments.util';
import { getNextIntensity } from '../../utils/metric';
import { Intensity } from '../../../generated/graphql.types';
import { HasUnsavedChanged } from '../../guards/unsaved-changes.guard';
import { SelectedItemPlaceholderComponent } from '../../shared/selected-item-placeholder/selected-item-placeholder.component';
import { SchedulesService } from '../../services/schedules.service';
import { LayoutService } from '../../services/layout.service';
import { NavigationService } from '../../services/navigation.service';

export type FrequencyUnit = 'session' | 'week';
export type IncrementForm = FormGroup<{
  exerciseItemKey: FormControl<string | null>;
  increment: FormControl<number | null>;
  frequency: FormControl<number | null>;
  frequencyUnit: FormControl<FrequencyUnit | null>;
  metric: FormControl<Metric | null>;
}>;

export type IncrementByExerciseType = {
  header: string;
  increments: IncrementForm[];
  exerciseItemKey: string;
}

@Component({
  selector: 'app-generate-program',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditInPlaceComponent,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    InputNumberModule,
    DividerModule,
    RadioButtonModule,
    SplitButtonModule,
    FieldsetModule,
    StepsModule,
    MessageModule,
    IncrementComponent,
    SchedulePreviewComponent,
    ScheduleDropdownComponent,
    ProgramPreviewComponent,
    SelectedItemPlaceholderComponent,
  ],
  templateUrl: './generate-program.component.html',
  styleUrls: ['./generate-program.component.scss'],
})
export class GenerateProgramComponent implements OnInit, OnDestroy, HasUnsavedChanged {

  @ViewChild('endDateCalendar') endDateCalendarRef?: Calendar;

  subs = new SubSink();

  maxWorkouts = 1000;

  warnings = {
    maxWorkoutsMessage: `Selected duration will generate over ${ this.maxWorkouts } workouts.`,
    noSchedule: 'Select a schedule to view available increments.',
    invalidIncrements: 'Invalid increments values.',
  }

  programForm = this.fb.group({
    name: this.fb.control('New Program', { validators: [ Validators.required ]}),
    baseSchedule: this.fb.control<FrontendSchedule | null>(null, { validators: [ Validators.required ] }),
    durationType: this.fb.control<DurationType>('weeks', { validators: [ Validators.required ]}),
    startDate: this.fb.control(dayjs().format(DATE_FORMAT), { validators: [ Validators.required ]}),
    weeks: { value: 1, disabled: false },
    endDate: { value: '', disabled: true },
    increments: this.fb.array<IncrementForm>([]),
  }, { validators: [ dateRange('string'), maxWorkouts(this.maxWorkouts) ]});

  steps = [
    {
      label: 'Enter Basic Info',
      disabled: false,
    },
    {
      label: 'Set Duration',
      disabled: false,
    },
    {
      label: 'Set Increments',
      disabled: false,
    },
    {
      label: 'Generate Program',
      disabled: false,
    },
  ];

  activeStep$ = new BehaviorSubject({ index: 0 });

  selectedBaseSchedule$ = new BehaviorSubject<FrontendSchedule | null>(null);

  onGenerateProgram$ = new Subject<void>();

  workouts: FrontendWorkout[] = [];

  chosenStartDate$ = new BehaviorSubject(new Date());

  saving = false;

  generating = false;

  generatingTimeOut?: NodeJS.Timeout;

  incrementsByExerciseType: IncrementByExerciseType[] = [];

  hasChanges = false;

  resourceMap = RESOURCE_MAP;

  passedData = {
    scheduleKey: undefined,
  }

  constructor(
    private programsService: ProgramsService,
    private fb: FormBuilder,
    private workoutTemplatesService: WorkoutTemplatesService,
    private icsService: IcsService,
    private router: Router,
    private toasts: ToastsService,
    private workoutsService: WorkoutsService,
    private schedulesService: SchedulesService,
    public layoutService: LayoutService,
    private navigationService: NavigationService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.passedData.scheduleKey = navigation?.extras?.state?.['scheduleKey'];
  }

  ngOnInit(): void {
    this.watchBaseSchedule();
    this.watchDurationType();

    this.programForm.controls.startDate.valueChanges
      .pipe(filter(notEmpty))
      .subscribe(startDate => this.chosenStartDate$.next(new Date(startDate)));

    this.subs.sink = this.onGenerateProgram$
      .pipe(switchMap(() => this.workoutTemplatesService.workoutTemplates$))
      .subscribe(workoutTemplates => this.generateProgram(workoutTemplates));

    if (this.passedData.scheduleKey) {
      this.schedulesService.schedules$.pipe(
        take(1),
        map(schedules => schedules.find(s => s.key === this.passedData.scheduleKey) || null),
      ).subscribe(activeSchedule => {
          this.programForm.controls.baseSchedule.setValue(activeSchedule);
        });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get increments() {
    return this.programForm.get('increments') as FormArray;
  }

  getIncrementByIndex(index: number) {
    return this.increments.at(index) as FormGroup;
  }

  setDisabledControlsByName(controlNames: string[], disabled: boolean) {
    for (const controlName of controlNames) {

      const control = this.programForm.get(controlName);

      if (control === null) { continue; }

      if (disabled) {
        control.disable();
      } else {
        control.enable();
      }
    }
  }

  setIncrements(setTemplates: FrontendSetTemplate[] | null) {

    if (setTemplates === null) {
      this.increments.clear();
      return;
    }

    const incrementableMetrics: Metric[] = [
      'weight',
      'duration',
      'distance',
      'incline',
      'intensity',
    ];

    const allIncrements: IncrementForm[] = [];

    const incrementsByExerciseType: IncrementByExerciseType[] = [];

    for (const setTemplate of setTemplates) {

      let incrementByExerciseType = incrementsByExerciseType.find(i => i.exerciseItemKey === setTemplate.exerciseItemKey);

      if (incrementByExerciseType) { continue; }

      incrementByExerciseType = {
        exerciseItemKey: setTemplate.exerciseItemKey,
        header: setTemplate.exerciseType,
        increments: [],
      }

      for (const metric of incrementableMetrics) {
        if (notEmpty(setTemplate[metric])) {

          const increment = this.fb.group({
            exerciseItemKey: setTemplate.exerciseItemKey,
            increment: this.fb.control(this.getDefaultIncrement(metric), { validators: this.getIncrementValidators(metric) }),
            frequency: this.fb.control(1, { validators: [ Validators.required, Validators.min(0)] }),
            frequencyUnit: "session" as FrequencyUnit,
            metric,
          })

          incrementByExerciseType.increments.push(increment);

          allIncrements.push(increment);
        }
      }

      incrementsByExerciseType.push(incrementByExerciseType);
    }

    this.incrementsByExerciseType = incrementsByExerciseType;
    this.programForm.setControl('increments', this.fb.array(allIncrements));
  }

  watchBaseSchedule() {

    this.programForm.controls.baseSchedule.valueChanges.subscribe(selectedSchedule => this.selectedBaseSchedule$.next(selectedSchedule));

    this.selectedBaseSchedule$
      .pipe(
        filter(notEmpty),
        map(schedule => schedule.weeks.flatMap(week => week.workouts)),
        map(workouts => workouts.map(w => w.workoutTemplateKey)),
        switchMap(workoutTemplateKeys => this.workoutTemplatesService.filterWorkoutTemplatesByKey(workoutTemplateKeys)),
        map(workoutTemplates => workoutTemplates.flatMap(wt => wt.exerciseTemplates)),
        map(exerciseTemplates => exerciseTemplates.flatMap(et => et.setTemplates)),
      ).subscribe(setTemplates => this.setIncrements(setTemplates));
  }

  watchDurationType() {
    this.programForm.controls.durationType.valueChanges
      .subscribe(durationType => {
        this.setDisabledDurationControls(durationType);
        this.setDurationControlsValidators(durationType);
        this.programForm.updateValueAndValidity();
      });
  }

  setDisabledDurationControls(durationType: DurationType | null) {
    if (durationType === 'weeks') {
      this.programForm.controls.weeks.enable();
      this.programForm.controls.weeks.setValue(1);

      this.programForm.controls.endDate.disable();
      this.programForm.controls.endDate.setValue(null);
    } else if (durationType === 'endDate') {
      this.programForm.controls.weeks.disable();
      this.programForm.controls.weeks.setValue(null);

      this.programForm.controls.endDate.enable();

      const startDate = this.programForm.controls.startDate.value;

      if (startDate) {
        const nextDay = dayjs(startDate).add(1, 'day').format(DATE_FORMAT);
        this.programForm.controls.endDate.setValue(nextDay);
      }

      if (this.endDateCalendarRef) {
        this.endDateCalendarRef.showOverlay();
      }
    }
  }

  setDurationControlsValidators(durationType: DurationType | null) {
    const { weeks, endDate } = this.programForm.controls;

    if (durationType === 'endDate') {
      weeks.clearValidators();
      endDate.addValidators(Validators.required);
    } else if (durationType === 'weeks') {
      weeks.addValidators(Validators.required);
      endDate.clearValidators();
    }
  }

  setActiveStep(index: number) {
    this.activeStep$.next({ index });
  }

  generateProgram(workoutTemplates: FrontendWorkoutTemplate[]) {

    this.markAsChanged();

    const formData = this.validateProgramFormData();

    let currentDate = formData.startDate;

    let currentWeek = 0;

    const incrementsMap = new IncrementsMap();

    const intensityRecord: { [ exerciseItemKey: string]: Intensity } = {};

    const sessionIncrements = formData.increments.filter(increment => increment.frequencyUnit === 'session');

    const weeklyIncrements = formData.increments.filter(increment => increment.frequencyUnit === 'week');

    let exerciseItemsInvolvedInTheWeek: string[] = [];

    const exerciseItemWeekCount: { [ exerciseItemKey: string ]: number } = {};

    const exerciseItemSessionCount: { [ exerciseItemKey: string ]: number } = {};

    const programWorkouts: FrontendWorkout[] = [];

    while (currentDate.isBefore(formData.endDate)) {

      const currentDow = currentDate.day();

      const isNewWeek = currentDate.isAfter(formData.startDate) && currentDow === 0;

      if (isNewWeek) {
        currentWeek++;
      }

      const weekIndex = currentWeek % formData.baseSchedule.weeks.length;

      const week = formData.baseSchedule.weeks[weekIndex];

      if (isNewWeek) {

        // Update count with exercise items from previous week
        for (const exerciseItemKey of exerciseItemsInvolvedInTheWeek) {
          exerciseItemWeekCount[exerciseItemKey] = exerciseItemWeekCount[exerciseItemKey] || 0;
          exerciseItemWeekCount[exerciseItemKey]++;
        }

        // Resolve exercise items involved in the week
        const exerciseItemsInWeek = week.workouts.flatMap(workout => workout.workoutTemplateKey)
          .map(workoutTemplateKey => workoutTemplates.find(wt => wt.key === workoutTemplateKey))
          .filter(notEmpty)
          .flatMap(wt => wt.exerciseTemplates)
          .flatMap(et => et.setTemplates)
          .map(st => st.exerciseItemKey);

        // Increase any increments that need to be increased weekly
        const applicableWeeklyIncrements = weeklyIncrements.filter(increment => {
          const hasOcurred = exerciseItemWeekCount[increment.exerciseItemKey] > 0;
          const matchesFrequency = exerciseItemWeekCount[increment.exerciseItemKey] % increment.frequency === 0;
          const inCurrentWeek = exerciseItemsInWeek.includes(increment.exerciseItemKey);
          return hasOcurred && matchesFrequency && inCurrentWeek;
        });

        for (const increment of applicableWeeklyIncrements) {
          this.increase(increment, incrementsMap, intensityRecord);
        }

        exerciseItemsInvolvedInTheWeek = [];
      }

      const workoutsOfTheDay = week.workouts.filter(workout => workout.dow === currentDow);

      // Each loop represents a workout session
      for (const workout of workoutsOfTheDay) {

        const workoutTemplate = workoutTemplates.find(wt => wt.key === workout.workoutTemplateKey);

        if (!workoutTemplate) {
          throw new Error(`Could not generate program: workout template not found for key ${ workout.workoutTemplateKey }`);
        }

        const exerciseItemsInWorkoutTemplate = workoutTemplate.exerciseTemplates.flatMap(et => et.setTemplates.map(st => st.exerciseItemKey));

        const applicableSessionIncrements = sessionIncrements
          .filter(increment => {
            const hasOcurred = exerciseItemSessionCount[increment.exerciseItemKey] > 0;
            const matchesFrequency = exerciseItemSessionCount[increment.exerciseItemKey] % increment.frequency === 0;
            const inCurrentWorkout = exerciseItemsInWorkoutTemplate.includes(increment.exerciseItemKey);
            return hasOcurred && matchesFrequency && inCurrentWorkout;
          });

        // Increase any increments that need to be increased per session
        for (const increment of applicableSessionIncrements) {
          this.increase(increment, incrementsMap, intensityRecord);
        }

        const exercises: FrontendExercise[] = [];

        for (const exerciseTemplate of workoutTemplate.exerciseTemplates) {

          const exercise: FrontendExercise = {
            name: exerciseTemplate.name,
            key: this.workoutsService.currentKey,
            sets: [],
            order: exerciseTemplate.order,
          }

          for (const setTemplate of exerciseTemplate.setTemplates) {

            const newSet: FrontendProgramSet = { ...setTemplate  };

            if (notEmpty(setTemplate.weight)) {
              const weightIncrement = incrementsMap.getIncrement(setTemplate.exerciseItemKey, 'weight') || 0;
              newSet.weight = (setTemplate.weight || 0) + weightIncrement;
            }

            if (notEmpty(setTemplate.duration)) {
              const durationIncrement = incrementsMap.getIncrement(setTemplate.exerciseItemKey, 'duration') || 0;
              newSet.duration = (setTemplate.duration || 0) + durationIncrement;
            }

            if (notEmpty(setTemplate.distance)) {
              const distanceIncrement = incrementsMap.getIncrement(setTemplate.exerciseItemKey, 'distance') || 0;
              newSet.distance = (setTemplate.distance || 0) + distanceIncrement;
            }

            if (notEmpty(setTemplate.incline)) {
              const inclineIncrement = incrementsMap.getIncrement(setTemplate.exerciseItemKey, 'incline') || 0;
              const sum = (setTemplate.incline || 0) + inclineIncrement;
              newSet.incline = Math.min(sum, 1) ;
            }

            if (notEmpty(setTemplate.intensity)) {
              newSet.intensity = intensityRecord[setTemplate.exerciseItemKey] || Intensity.Low;
            }

            exercise.sets.push(newSet);

            if (!exerciseItemsInvolvedInTheWeek.includes(setTemplate.exerciseItemKey)) {
              exerciseItemsInvolvedInTheWeek.push(setTemplate.exerciseItemKey);
            }
          }

          exercises.push(exercise);
        }

        for (const exerciseItemKey of exerciseItemsInWorkoutTemplate) {
          exerciseItemSessionCount[exerciseItemKey] = exerciseItemSessionCount[exerciseItemKey] || 0;
          exerciseItemSessionCount[exerciseItemKey]++;
        }

        const start = this.getProgramWorkoutTime(workout, currentDate, 'start');
        const end = this.getProgramWorkoutTime(workout, currentDate, 'end');

        programWorkouts.push({
          name: workoutTemplate.name,
          key: this.workoutsService.currentKey,
          exercises,
          start,
          end,
          backgroundColor: workoutTemplate.backgroundColor,
        });
      }

      currentDate = currentDate.add(1, 'day');
    }

    this.workouts = programWorkouts;
  }

  getProgramWorkoutTime(
    workout: FrontendScheduleWorkout,
    date: dayjs.Dayjs,
    selectedTime: 'start' | 'end',
  ): string {

    const day = date.format(DATE_FORMAT);

    if (workout.allDay) {
      return day;
    }

    const time = selectedTime === 'start' ? workout.start : workout.end;

    if (!time) {
      throw new Error(`Could not generate program: no ${ selectedTime } time set for workout ${ workout.workoutTemplateKey } on ${ day }`);
    }

    const formattedTime = getDateTime(time, date).format('hh:mm A');

    return `${ day } ${ formattedTime }`;
  }

  validateProgramFormData() {

    const {
      name,
      baseSchedule,
      durationType,
      startDate,
      endDate,
      weeks,
      increments,
    } = this.programForm.value;

    if (!name) {
      throw new Error('Unable to generate program: no name entered');
    }

    if (!baseSchedule) {
      throw new Error('Unable to generate program: no schedule selected');
    }

    if (!startDate) {
      throw new Error('Unable to generate program: no start date selected');
    }

    const validatedStartDate = dayjs(startDate);

    if (!durationType) {
      throw new Error('Unable to generate program: no duration type selected');
    }

    let validatedEndDate: dayjs.Dayjs | null = null;

    if (durationType === 'weeks') {
      if (!weeks) {
        throw new Error('Duration type was set to weeks but no weeks were selected');
      } else {
        validatedEndDate = validatedStartDate.add(weeks, 'week');
      }
    }

    if (durationType === 'endDate') {
      if (!endDate) {
        throw new Error('Duration type was set to end date but no end date was selected');
      } else {
        validatedEndDate = dayjs(endDate);
      }
    }

    if (!validatedEndDate) {
      throw new Error('Unable to generate program: no end date selected');
    }

    if (validatedEndDate.isBefore(validatedStartDate)) {
      throw new Error('Unable to generate program: end date is before start date');
    }

    const hasWorkouts = baseSchedule.weeks.flatMap(week => week.workouts).length > 0;

    const hasIncrements = increments && increments?.length > 0;

    if (hasWorkouts && !hasIncrements) {
      throw new Error('Unable to generate program: no increments selected');
    }

    const validatedIncrements: Increment[] = [];

    if (increments) {
      for (const increment of increments) {

        if (!notEmpty(increment.metric)) {
          throw new Error('Unable to generate program: increment metric is missing');
        }

        if (!increment.exerciseItemKey) {
          throw new Error('Unable to generate program: exercise item key for increment is missing');
        }

        if (!notEmpty(increment.frequency)) {
          throw new Error('Unable to generate program: increment frequency is missing');
        }

        if (!notEmpty(increment.frequencyUnit)) {
          throw new Error('Unable to generate program: invalid increment frequency unit');
        }

        if (!notEmpty(increment.increment) && increment.metric !== 'intensity') {
          throw new Error('Unable to generate program: increment increment is missing');
        }

        validatedIncrements.push({
          exerciseItemKey: increment.exerciseItemKey,
          frequency: increment.frequency,
          frequencyUnit: increment.frequencyUnit,
          increment: increment.increment || 0,
          metric: increment.metric,
        });
      }
    }

    return {
      name,
      baseSchedule,
      durationType,
      startDate: validatedStartDate,
      endDate: validatedEndDate,
      increments: validatedIncrements,
    }
  }

  increase(increment: Increment, incrementMap: IncrementsMap, intensityRecord: Record<string, Intensity>) {

    switch(increment.metric) {
      case 'intensity':
        intensityRecord[increment.exerciseItemKey] = intensityRecord[increment.exerciseItemKey] || Intensity.Low;
        intensityRecord[increment.exerciseItemKey] = getNextIntensity(intensityRecord[increment.exerciseItemKey], false);
        break;
      case 'incline':
        const current = incrementMap.getIncrement(increment.exerciseItemKey, increment.metric);
        const newIncrement = current ? current + increment.increment : increment.increment;
        incrementMap.setIncrement(increment.exerciseItemKey, increment.metric, Math.min(newIncrement, 1));
        break;
      default:
        incrementMap.addToIncrement(increment.exerciseItemKey, increment.metric, increment.increment);
    }
  }

  downloadProgramIcs() {
    if (!this.workouts.length) {
      throw new Error('Unable to download program: no exercises');
    }

    const name = this.programForm.value.name;

    if (!name) {
      throw new Error('Unable to download program: no name entered');
    }

    const eventInputs: EventInput[] = this.workouts.map(workout => ({
      subject: workout.name,
      description: this.getProgramWorkoutDescription(workout),
      begin: workout.start,
      stop: workout.end,
    }));

    this.icsService.downloadCalendar(eventInputs, name);
  }

  getProgramWorkoutDescription(workout: FrontendWorkout) {

    const descriptionArray: string[] = [];

    for (const exercise of workout.exercises) {

      descriptionArray.push(exercise.name);

      for (const set of exercise.sets) {
        descriptionArray.push(`${set.exerciseType} x ${ set.reps } x ${ set.weight } lbs.`);
      }

      descriptionArray.push('');
    }

    return descriptionArray.join('\\n');
  }

  get isValid() {
    return this.programForm.valid && this.workouts.length > 0;
  }

  async saveChanges(navigateOnSuccess?: boolean) {

    const name = this.programForm.value.name;

    if (!name) {
      throw new Error('Unable to save program: no name entered');
    }

    if (this.workouts.length === 0) {
      throw new Error('Unable to save program: no workouts');
    }

    const program: MutateProgramInput = {
      name,
      workouts: this.workouts,
    }

    this.saving = true;

    const mutatedProgram = await this.programsService.addProgram(program);

    this.saving = false;

    if (mutatedProgram) {
      this.hasChanges = false;

      this.toasts.success('Program saved');
    }

    if (mutatedProgram && navigateOnSuccess) {
      this.router.navigate([ '/programs' ], {
        state: {
          programKey: mutatedProgram.key,
        },
      });
    }
  }

  getDefaultIncrement(metric: Metric) {
    switch (metric) {
      case 'intensity':
        return null;
      case 'incline':
        // incline in percent
        return 0.025;
      case 'duration':
        // duration in seconds
        return 300; // 5 minutes
      case 'distance':
        // distance in miles
        return 0.25;
      case 'weight':
        // weight in lbs
        return 5;
      default:
        return 5;
    }

  }

  getIncrementValidators(metric: Metric) {

    const validators: ValidatorFn[] = [];

    switch (metric) {
      case 'intensity':
        break;
      case 'incline':
        validators.push(Validators.min(0));
        validators.push(Validators.max(1));
        break;
      default:
        validators.push(Validators.min(0));
        validators.push(Validators.required);
    }

    return validators;
  }

  hasUnsavedChanges(): boolean {
    return this.hasChanges;
  }

  markAsChanged() {
    this.hasChanges = true;
  }

  canSaveChanges(): { canSave: boolean; message?: string | undefined; } {

    const canSave = this.workouts.length > 0 && Boolean(this.programForm.value.name);

    if (canSave) {
      return { canSave };
    }

    let message: string | undefined = undefined;

    if (this.workouts.length === 0) {
      message = `You have unsaved changes, but they can't be saved until you generate a program.`;
    } else if (!this.programForm.value.name) {
      message = `You have unsaved changes, but they can't be saved until you enter a name.`;
    }

    return {
      canSave,
      message,
    }
  }

  discardChanges() {
    this.hasChanges = false;
    this.navigationService.goBack('/programs');
  }
}
