import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutTemplateDescriptionPipe } from '../workout-template-description.pipe';
import { FrontendWorkoutTemplate } from '../../shared/types';
import { PresetIndicatorComponent } from '../../shared/preset-indicator/preset-indicator.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workout-template-item',
  standalone: true,
  imports: [
    CommonModule,
    WorkoutTemplateDescriptionPipe,
    PresetIndicatorComponent,
  ],
  templateUrl: './workout-template-item.component.html',
  styleUrls: ['./workout-template-item.component.scss']
})
export class WorkoutTemplateItemComponent {

  constructor(
    private router: Router,
  ) {}

  @Input() workoutTemplate!: FrontendWorkoutTemplate;

  @Input() size?: 'small' | 'medium' | 'large' = 'medium';

  @Input() linkToWorkoutTemplate = false;

  @Output() onNavigate = new EventEmitter();

  goToWorkoutTemplate(event: Event) {

    event.preventDefault();

    if (!this.workoutTemplate) {
      throw new Error('No workout template selected');
    }

    this.router.navigate([ 'workouts' ], {
      state: {
        workoutTemplateKey: this.workoutTemplate.key,
      }
    });

    this.onNavigate.emit();
  }
}
