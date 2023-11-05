import { Category, Intensity } from "../generated/graphql.generated";

export const APP_NAME = 'Step by Step Strength';

export const DATE_FORMAT = 'YYYY/MM/DD';

export const INTENSITY_MAP = {
  [Intensity.Low]: {
    label: 'Low',
    styleClass: 'p-button-success',
    icon: 'pi pi-thumbs-up',
    severity: 'success'
  },
  [Intensity.Medium]: {
    label: 'Medium',
    styleClass: 'p-button-warning',
    icon: 'pi pi-bolt',
    severity: 'warning'
  },
  [Intensity.High]: {
    label: 'High',
    styleClass: 'p-button-danger',
    icon: 'pi pi-exclamation-triangle',
    severity: 'danger'
  },
}

export const CATEGORIES: Category[] = [
  Category.Balance,
  Category.Cardio,
  Category.Core,
  Category.Flexibility,
  Category.Functional,
  Category.Lowerbody,
  Category.Plyometrics,
  Category.Upperbody,
]

export const CATEGORY_MAP = {
  [Category.Balance]: {
    label: 'Balance',
  },
  [Category.Cardio]: {
    label: 'Cardio',
  },
  [Category.Core]: {
    label: 'Core',
  },
  [Category.Flexibility]: {
    label: 'Flexibility',
  },
  [Category.Functional]: {
    label: 'Functional',
  },
  [Category.Lowerbody]: {
    label: 'Lower Body',
  },
  [Category.Plyometrics]: {
    label: 'Plyometrics',
  },
  [Category.Upperbody]: {
    label: 'Upper Body',
  },
}

export const RESOURCE_MAP = {
  dashboard: {
    icon: 'pi pi-home',
  },
  start: {
    icon: 'pi pi-flag',
  },
  workouts: {
    icon: 'pi pi-table',
  },
  schedules: {
    icon: 'pi pi-calendar',
  },
  programs: {
    icon: 'pi pi-chart-line',
  },
}
