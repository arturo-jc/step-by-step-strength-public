import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

type ByDay = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';

export interface EventInput {
  subject: string;
  description: string;
  begin: string;
  stop: string;
  location?: string;
  rrule?: Rrule;
}

interface Rrule {
  freq: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  until?: string;
  interval?: number;
  count?: number;
  byDay?: ByDay[];
  rrule?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IcsService {

  separator = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n';

  calendarStart = [
    'BEGIN:VCALENDAR',
    'PRODID:Calendar',
    'VERSION:2.0',
  ].join(this.separator);

  calendarEnd = this.separator + 'END:VCALENDAR';

  uidDomain = 'default';

  prodId = 'Calendar';

  downloadCalendar(
    eventInputs: EventInput[],
    filename: string,
    extension = '.ics',
  ) {

    const calendarEvents: string[] = [];

    for (const eventInput of eventInputs) {
      const event = this.getEvent(eventInput, calendarEvents.length);
      calendarEvents.push(event);
    }

    const calendar = this.calendarStart + this.separator + calendarEvents.join(this.separator) + this.calendarEnd;

    const blob = new Blob([ calendar ]);

    saveAs(blob, filename + extension);
  }

  getEvent(eventInput: EventInput, index: number) {

    const isAllDay = eventInput.begin === eventInput.stop;

    const start = new Date(eventInput.begin);
    const end = new Date(eventInput.stop);
    const now = new Date();

    let calendarEventArr = [
      'BEGIN:VEVENT',
      'UID:' + index + '@' + this.uidDomain,
      'CLASS:PUBLIC',
      'DESCRIPTION:' + eventInput.description,
    ];

    const ruleString = this.getRuleString(eventInput.rrule);

    if (ruleString) {
      calendarEventArr.push('RRULE:' + ruleString);
    }

    calendarEventArr = calendarEventArr.concat([
      'DTSTAMP;VALUE=DATE-TIME:' + this.formatDate(now),
      'DTSTART;VALUE=DATE-TIME:' + this.formatDate(start, isAllDay),
      'DTEND;VALUE=DATE-TIME:' + this.formatDate(end, isAllDay),
    ]);

    if (eventInput.location) {
      calendarEventArr.push('LOCATION:' + eventInput.location);
    }

    calendarEventArr = calendarEventArr.concat([
      'SUMMARY;LANGUAGE=en-us:' + eventInput.subject,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    ]);


    return calendarEventArr.join(this.separator);
  }

  formatDate(providedDate: Date, isAllDay?: boolean) {
    const year = ('0000' + (providedDate.getFullYear().toString())).slice(-4);
    const month = ('00' + ((providedDate.getMonth() + 1).toString())).slice(-2);
    const day = ('00' + (providedDate.getDate().toString())).slice(-2);
    const hours = ('00' + (providedDate.getHours().toString())).slice(-2);
    const minutes = ('00' + (providedDate.getMinutes().toString())).slice(-2);
    const seconds = ('00' + (providedDate.getSeconds().toString())).slice(-2);

    const date = year + month + day;
    const time = hours + minutes + seconds;

    return isAllDay ? date : date + 'T' + time;
  }

  getRuleString(rrule?: Rrule) {

    if (!rrule) { return; }

    if (rrule.rrule) {
      return rrule.rrule;
    }

    this.validateRrule(rrule);

    const segments: string[] = [];

    segments.push('FREQ=' + rrule.freq);

    if (rrule.until) {
      const isoString = new Date(Date.parse(rrule.until)).toISOString();
      const until = isoString.substring(0, isoString.length - 13).replace(/[-]/g, '') + '000000Z';
      segments.push('UNTIL=' + until);
    }

    if (rrule.interval) {
      segments.push('INTERVAL=' + rrule.interval.toString());
    }

    if (rrule.count) {
      segments.push('COUNT=' + rrule.count.toString());
    }

    if (rrule.byDay && rrule.byDay.length > 0) {

      // Avoid duplicates
      rrule.byDay = rrule.byDay.filter((day) => rrule.byDay?.includes(day));

      const byDay = rrule.byDay.join(',');

      segments.push('BYDAY=' + byDay);
    }

    return segments.join(';');
  }

  validateRrule(rrule: Rrule) {

    if (rrule.until && Number.isNaN(Date.parse(rrule.until))) {
      throw new Error('Invalid UNTIL date');
    }

    if (rrule.interval && Number.isNaN(rrule.interval)) {
      throw new Error('Invalid INTERVAL');
    }

    if (rrule.count && Number.isNaN(rrule.count)) {
      throw new Error('Invalid COUNT');
    }
  }

}
