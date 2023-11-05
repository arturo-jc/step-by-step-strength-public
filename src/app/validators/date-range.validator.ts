import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

type DateType = 'string' | 'date' | 'number' | 'dayjs';

 export function dateRange(dateType: DateType): ValidatorFn {

   if (dateType !== 'string') {
     throw new Error('not implemented');
   }

   return (control: AbstractControl): ValidationErrors | null => {
     const startDate = control.get("startDate");
     const endDate = control.get("endDate");

     if (!startDate?.value || !endDate?.value) {
       return null;
     }

     if (Date.parse(startDate.value) <= Date.parse(endDate.value)) {
       return null;
     }

     return { dateRange: true };
   };
 }
