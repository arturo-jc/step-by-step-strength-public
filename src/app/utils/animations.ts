import { animate, state, style, transition, trigger } from "@angular/animations";

export const collapse = trigger('collapse', [
  state('collapsed', style({ height: '0' })),
  state('expanded', style({ height: '*' })),
  transition('expanded <=> collapsed', [animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')]),
    transition('void => *', animate(0)),
])
