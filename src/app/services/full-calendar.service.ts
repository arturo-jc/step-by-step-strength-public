import { Injectable } from '@angular/core';
import { Calendar, EventContentArg, EventInput } from '@fullcalendar/core';
import { DateMarker, EventImpl } from '@fullcalendar/core/internal';
import { DEFAULT_BG_COLOR } from '../workout-templates/mutate-workout-template/mutate-workout-template.component';
import dayjs from '../shared/dayjs/dayjs';
import { FrontendExercise, FrontendExerciseTemplate, FrontendProgramSet, FrontendScheduleWeek, FrontendScheduleWorkout, FrontendSetTemplate, FrontendWorkout, FrontendWorkoutTemplate } from '../shared/types';
import { getDateTime } from '../utils/time';
import { notEmpty } from '../utils/typescript';

export interface ExerciseTemplateLine {
  name: string;
  setTemplateCount: number;
};

@Injectable({
  providedIn: 'root'
})
export class FullCalendarService {

  ellipsis = {
    'overflow': 'hidden',
    'white-space': 'nowrap',
    'text-overflow': 'ellipsis',
  }

  marginBottom = {
    'margin-bottom': '0.25rem',
  }

  titleStyle = {
    'font-size': '1rem',
    'text-align': 'center',
    'font-weight': 'bold',
    ...this.marginBottom,
    ...this.ellipsis,
  }

  displayBlock = {
    'display': 'block',
  }

  displayFlex = {
    'display': 'flex',
  }

  underlined = {
    'text-decoration': 'underline',
  }

  exerciseTypeStyle = {
    'flex': '1',
    ...this.ellipsis,
  }

  exerciseNameStyle = {
    ...this.underlined,
    ...this.ellipsis,
  }

  getScheduleEventContent(args: EventContentArg) {
    const { event } = args;
    const containerEl = this.createContainer(event);
    const titleEl = this.createTitle(event.title);
    const { bodyEl, andMore } = this.createScheduleWorkoutBody(event);
    containerEl.append(titleEl, bodyEl);

    if (andMore && event.allDay) {
      this.applyFadeOverlay(containerEl, event.textColor);
    }

    return { domNodes: [ containerEl ] };
  }

  getProgramEventcontent(args: EventContentArg) {
    const { event } = args;
    const containerEl = this.createContainer(event);
    const titleEl = this.createTitle(event.title);
    const { bodyEl, andMore } = this.createProgramWorkoutBody(event);
    containerEl.append(titleEl, bodyEl);

    if (andMore && event.allDay) {
      this.applyFadeOverlay(containerEl, event.textColor);
    }

    return { domNodes: [ containerEl ] };
  }

  createContainer(event: EventImpl): HTMLDivElement {
    const containerEl = document.createElement('div');
    containerEl.style.setProperty('color', event.textColor);
    containerEl.classList.add('main-container');
    return containerEl;
  }

  createTitle(title: string): HTMLSpanElement {
    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    this.applyStyle(this.titleStyle, titleEl);
    return titleEl;
  }

  createScheduleWorkoutBody(event: EventImpl, maxEventLines = 6): { bodyEl: HTMLDivElement, andMore: boolean } {

    const bodyEl = document.createElement('div');
    this.applyStyle(this.displayBlock, bodyEl);

    if (!event.extendedProps) {
      console.warn('Cannot read extendedProps');
      return { bodyEl, andMore: false };
    }

    const exerciseTemplates = event.extendedProps['exerciseTemplates'] as FrontendExerciseTemplate[];

    if (!exerciseTemplates) {
      throw new Error('Cannot read exerciseTemplates');
    }

    let eventLines = 0;

    for (const exerciseTemplate of exerciseTemplates) {

      if (eventLines >= maxEventLines) {
        break;
      }

      const exerciseNameEl = document.createElement('div');
      this.applyStyle(this.exerciseNameStyle, exerciseNameEl);
      exerciseNameEl.textContent = exerciseTemplate.name;
      bodyEl.append(exerciseNameEl);
      eventLines++;

      for (const [ index, set ] of exerciseTemplate.setTemplates.entries()) {

        if (eventLines >= maxEventLines) {
          break;
        }

        const setTemplateEl = document.createElement('div');
        this.applyStyle(this.displayFlex, setTemplateEl);

        const exerciseTypeEl = document.createElement('div');
        this.applyStyle(this.exerciseTypeStyle, exerciseTypeEl);
        exerciseTypeEl.textContent = set.exerciseType;
        setTemplateEl.append(exerciseTypeEl);

        const setDataEl = document.createElement('div');
        setDataEl.textContent = this.getSetTemplateDescription(set);
        setTemplateEl.append(setDataEl);

        if (index === exerciseTemplate.setTemplates.length - 1) {
          this.applyStyle(this.marginBottom, setTemplateEl);
        }

        bodyEl.append(setTemplateEl);
        eventLines++;
      }

    }

    const setTemplateCount = exerciseTemplates.flatMap(t => t.setTemplates).length;

    const andMore = eventLines < exerciseTemplates.length + setTemplateCount;

    return { bodyEl, andMore };
  }

  applyFadeOverlay(containerEl: HTMLDivElement, textColor: string) {

    const fadeOverlay = this.createFadeOverlay(textColor);

    this.applyStyle({
      position: 'relative',
      overflow: 'hidden',
    }, containerEl);

    containerEl.append(fadeOverlay);
  }

  createFadeOverlay(_textColor: string) {

    const backgroundColor = 'rgba(0, 0, 0, 0.45)';

    const fadeOverlay = document.createElement('div');

    this.applyStyle({
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      height: '60%',
      'background-image': `linear-gradient(to top, ${backgroundColor}, transparent)`
    }, fadeOverlay);

    return fadeOverlay;
  }

  createProgramWorkoutBody(event: EventImpl, maxEventLines = 6): { bodyEl: HTMLDivElement, andMore: boolean } {

    const bodyEl = document.createElement('div');
    this.applyStyle(this.displayBlock, bodyEl);

    if (!event.extendedProps) {
      console.warn('Cannot read extendedProps');
      return { bodyEl, andMore: false };
    }

    const exercises = event.extendedProps['exercises'] as FrontendExercise[];

    if (!exercises) {
      throw new Error('Cannot read exercises');
    }

    let eventLines = 0;

    for (const exercise of exercises) {

      if (eventLines >= maxEventLines) {
        break;
      }

      const exerciseNameEl = document.createElement('div');
      this.applyStyle(this.exerciseNameStyle, exerciseNameEl);
      exerciseNameEl.textContent = exercise.name;
      bodyEl.append(exerciseNameEl);
      eventLines++;

      for (const [ index, set ] of exercise.sets.entries()) {

        if (eventLines >= maxEventLines) {
          break;
        }

        const setTemplateEl = document.createElement('div');
        this.applyStyle(this.displayFlex, setTemplateEl);

        const exerciseTypeEl = document.createElement('div');
        this.applyStyle(this.exerciseTypeStyle, exerciseTypeEl);
        exerciseTypeEl.textContent = set.exerciseType;
        setTemplateEl.append(exerciseTypeEl);

        const setDataEl = document.createElement('div');
        setDataEl.textContent = this.getSetTemplateDescription(set);
        setTemplateEl.append(setDataEl);

        if (index === exercise.sets.length - 1) {
          this.applyStyle(this.marginBottom, setTemplateEl);
        }

        bodyEl.append(setTemplateEl);
        eventLines++;
      }

    }

    const setCount = exercises.flatMap(t => t.sets).length;

    const andMore = eventLines < exercises.length + setCount;

    return { bodyEl, andMore };
  }

  createProgramWorkoutExerciseEl(exercise: FrontendExercise): HTMLDivElement {
    const exerciseEl = document.createElement('div');
    this.applyStyle(this.displayFlex, exerciseEl);

    const exerciseTypeEl = document.createElement('div');
    exerciseTypeEl.textContent = exercise.name;
    this.applyStyle(this.ellipsis, exerciseTypeEl);
    exerciseEl.append(exerciseTypeEl);

    return exerciseEl;
  }

  applyStyle(styles: Record<string, string | null>, element: HTMLElement) {
    for (const [ style, value ] of Object.entries(styles)) {
      element.style.setProperty(style, value);
    }
  }

  getSetTemplateDescription(setTemplate: FrontendSetTemplate | FrontendProgramSet) {

    const metrics: string[] = [];

    if (notEmpty(setTemplate.weight)) {
      metrics.push(`${setTemplate.weight} lbs`);
    }

    if (notEmpty(setTemplate.duration)) {

      const duration = dayjs.duration(setTemplate.duration, 'seconds');

      const hours = duration.hours().toString().padStart(2, '0');
      const minutes = duration.minutes().toString().padStart(2, '0');
      const seconds = duration.seconds().toString().padStart(2, '0');

      metrics.push(`${hours}:${minutes}:${seconds}`);
    }

    if (notEmpty(setTemplate.distance)) {
      metrics.push(`${setTemplate.distance} mi`);
    }

    if (notEmpty(setTemplate.incline)) {
      metrics.push(`${setTemplate.incline}%`);
    }

    if (notEmpty(setTemplate.intensity)) {
      metrics.push(`${setTemplate.intensity}`);
    }

    let description = metrics.slice(0, 2).join(' | ');

    if (notEmpty(setTemplate.reps)) {
      description = `${setTemplate.reps} x ${description}`;
    }

    return description;
  }

  getEventInput(workoutTemplate: FrontendWorkoutTemplate, scheduleWorkout?: FrontendScheduleWorkout, start?: DateMarker): EventInput {

    const backgroundColor = workoutTemplate.backgroundColor || DEFAULT_BG_COLOR;

    const eventInput: EventInput = {
      title: workoutTemplate.name,
      extendedProps: {
        key: workoutTemplate.key,
        exerciseTemplates: workoutTemplate.exerciseTemplates,
      },
      backgroundColor,
      borderColor: backgroundColor,
      textColor: this.getTextColor(backgroundColor),
    }

    if (!scheduleWorkout) {
      return eventInput;
    }

    if (scheduleWorkout.id) {
      eventInput.id = scheduleWorkout.id;
    }

    eventInput.allDay = scheduleWorkout.allDay || undefined;

    if (scheduleWorkout.dow === null || scheduleWorkout.dow === undefined) {
      throw new Error('Cannot read dow');
    }

    if (!start) {
      return eventInput;
    }

    const scheduleStart = this.findFirstSunday(dayjs(start));

    const eventDay = scheduleStart.add(scheduleWorkout.dow, 'day');

    if (eventInput.allDay) {

      eventInput.start = eventDay.toDate();

    } else {
      eventInput.start = this.getEventTime(scheduleWorkout.start, eventDay);
      eventInput.end = this.getEventTime(scheduleWorkout.end, eventDay);
    }

    return eventInput;
  }

  getEventTime(
    dateString: string | undefined | null,
    eventDay: dayjs.Dayjs,
  ) {
    if (!dateString) { return; }
    return getDateTime(dateString, eventDay).toDate();
  }

  getTextColor(backgroundColor: string): string {

    const lightTextColor = 'var(--gray-50)';

    const darkTextColor = 'var(--gray-800)';

    // Convert HEX to RGB
    const {r, b, g} = this.hexToRBG(backgroundColor);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    const isBgColorLight = luminance > 0.6;

    return isBgColorLight ? darkTextColor : lightTextColor;
  }

  hexToRBG(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return { r, g, b };
  }

  findFirstSunday(start: dayjs.Dayjs): dayjs.Dayjs {
    if (start.day() === 0) {
      return start;
    }
    return this.findFirstSunday(start.add(1, 'day'));
  }

  loadScheduleWeekWorkouts(
    activeScheduleWeek: FrontendScheduleWeek,
    workoutTemplates: FrontendWorkoutTemplate[],
    calendar: Calendar | undefined,
  ) {

    if (!calendar) {
      throw new Error('Calendar not found');
    }

    let showTimes = false;

    calendar.batchRendering(() => {

      calendar.removeAllEvents();

      for (const scheduleWorkout of activeScheduleWeek.workouts) {

        const workout = workoutTemplates.find(t => t.key === scheduleWorkout.workoutTemplateKey);

        if (!workout) {
          throw new Error('Workout template not found');
        }

        const { currentRange } = calendar.getCurrentData().dateProfile;

        const eventInput = this.getEventInput(workout, scheduleWorkout, currentRange.start);

        if (!eventInput.allDay) {
          showTimes = true;
        }

        calendar.addEvent(eventInput);
      }

    });

    return { showTimes };
  }

  loadProgramWorkouts(
    workouts: FrontendWorkout[],
    calendar: Calendar,
  ) {

    let showTimes = false;

    calendar.batchRendering(() => {

      calendar.removeAllEvents();

      for (const workout of workouts) {

        const backgroundColor = workout.backgroundColor || DEFAULT_BG_COLOR;

        const eventInput: EventInput = {
          title: workout.name,
          backgroundColor,
          allDay: workout.start === workout.end,
          start: new Date(workout.start),
          borderColor: backgroundColor,
          textColor: this.getTextColor(backgroundColor),
          extendedProps: {
            key: workout.key,
            exercises: workout.exercises,
          }
        }

        if (workout.id) {
          eventInput.id = workout.id;
        }

        if (!eventInput.allDay) {

          if (!workout.end) {
            throw new Error('Events with times must have an end time');
          }

          eventInput.end = new Date(workout.end);
          showTimes = true;
        }

        calendar.addEvent(eventInput);
      }
    });

    return { showTimes };
  }
}
