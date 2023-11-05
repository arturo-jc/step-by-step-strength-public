import { Pipe, PipeTransform } from '@angular/core';
import dayjs from '../shared/dayjs/dayjs';
import { FrontendProgram } from '../shared/types';

@Pipe({
  name: 'programDescription',
  standalone: true
})
export class ProgramDescriptionPipe implements PipeTransform {

  transform(program: FrontendProgram): string {

    const dates = program.workouts.map(w => dayjs(w.start));

    const earliest = dayjs.min(dates);
    const latest = dayjs.max(dates);

    if (!earliest || !latest) {
      throw new Error('Invalid dates');
    }

    return `${earliest.format('MMM D')} - ${latest.format('MMM D')}`;
  }

}
