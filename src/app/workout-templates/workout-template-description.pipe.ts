import { Pipe, PipeTransform } from '@angular/core';
import { FrontendWorkoutTemplate } from '../shared/types';

@Pipe({
  name: 'workoutTemplateDescription',
  standalone: true
})
export class WorkoutTemplateDescriptionPipe implements PipeTransform {

  transform(workoutTemplate: FrontendWorkoutTemplate, max = 3): string {

    const exerciseDescriptions: string[] = [];

    for (const exerciseTemplate of workoutTemplate.exerciseTemplates) {

      if (exerciseDescriptions.length >= max) { break; }

      const description = `${ exerciseTemplate.name } x${ exerciseTemplate.setTemplates.length }`;

      exerciseDescriptions.push(description);
    }

    const remaining = workoutTemplate.exerciseTemplates.length - max;

    if (remaining > 0) {
      exerciseDescriptions.push(`and ${ remaining } more`);
    }

    return exerciseDescriptions.join(', ');
  }

}
