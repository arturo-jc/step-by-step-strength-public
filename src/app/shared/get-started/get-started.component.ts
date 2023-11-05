import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RESOURCE_MAP } from '../../global';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { MarkdownRouterLinkDirective } from '../markdown-router-link.directive';

@Component({
  selector: 'app-get-started',
  standalone: true,
  imports: [
    CommonModule,
    TimelineModule,
    ButtonModule,
    RouterLink,
    MarkdownModule,
    MarkdownRouterLinkDirective,
  ],
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss']
})
export class GetStartedComponent {

  resourceMap = RESOURCE_MAP;

    steps = [
    {
      header: 'Create a Workout',
      body: 'Think of this as a blueprint for a day at the gym. [Design your own](/workouts/new), or opt for one of [our expertly crafted presets](/workouts) and move on to the next step.',
      link: [ '/workouts', 'new' ],
      buttonLabel: 'Create Workout',
      icon: this.resourceMap.workouts.icon,
    },
    {
      header: 'Craft Your Schedule',
      body: 'A schedule is like your weekly planner, telling you which workout to follow on which day. But hey, if designing isn\'t your thing just yet, simply embrace one of [our preset schedules](/schedules) and you\'re good to go!',
      link: [ '/schedules', 'new' ],
      buttonLabel: 'Create Schedule',
      icon: this.resourceMap.schedules.icon,
    },
    {
      header: 'Generate Your Program',
      body: '<p>Choose a schedule, set your preferred start and end dates, decide on the increments, and watch the magic unfold.</p><p>Download your program as an ICS file, and <a href="https://support.google.com/calendar/answer/37118?hl=en" target="_blank">import it into Google Calendar</a>!</p>',
      link: [ '/programs', 'new' ],
      buttonLabel: 'Create Program',
      icon: this.resourceMap.programs.icon,
    },
  ];

}
