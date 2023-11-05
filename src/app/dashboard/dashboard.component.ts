import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RESOURCE_MAP } from '../global';
import { GetStartedComponent } from '../shared/get-started/get-started.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    GetStartedComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  resourceMap = RESOURCE_MAP;

  steps = [
    {
      header: 'Create a Workout',
      body: 'Think of this as a blueprint for a day at the gym. And if you\'re not quite ready to design your own? No worries! Opt for one of our expertly crafted defaults and move on to the next step.',
      link: [ '/workouts', 'new' ],
      buttonLabel: 'Create Workout',
      icon: this.resourceMap.workouts.icon,
    },
    {
      header: 'Craft Your Schedule',
      body: 'A schedule is like your weekly planner, telling you which workout to follow on which day. But hey, if designing isn\'t your thing just yet, simply embrace one of our default schedules and you\'re good to go!',
      link: [ '/schedules', 'new' ],
      buttonLabel: 'Create Schedule',
      icon: this.resourceMap.schedules.icon,
    },
    {
      header: 'Generate Your Program',
      body: 'Here\'s where the magic happens! Choose a schedule, set your preferred start and end dates, decide on the increments, and let our application craft the perfect program for you.',
      link: [ '/programs', 'new' ],
      buttonLabel: 'Create Program',
      icon: this.resourceMap.programs.icon,
    },
  ];
}
