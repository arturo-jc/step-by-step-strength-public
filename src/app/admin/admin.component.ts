import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { PresetExerciseItemsComponent } from './preset-exercise-items/preset-exercise-items.component';
import { PresetWorkoutTemplatesComponent } from './preset-workout-templates/preset-workout-templates.component';
import { PresetSchedulesComponent } from './preset-schedules/preset-schedules.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    PresetExerciseItemsComponent,
    PresetWorkoutTemplatesComponent,
    PresetSchedulesComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

}
