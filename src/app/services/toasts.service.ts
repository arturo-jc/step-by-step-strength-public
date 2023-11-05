import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { getApolloErrorMessage } from '../utils/apollo';

@Injectable({
  providedIn: 'root'
})
export class ToastsService {

  constructor(
    private messageService: MessageService,
  ) { }

  success(summary: string, detail?: string) {
    this.messageService.add({ severity: 'success', icon: 'pi pi-check-circle', summary, detail });
  }

  info(summary: string, detail?: string) {
    this.messageService.add({ severity: 'info', icon: 'pi pi-info-circle', summary, detail });
  }

  warn(summary: string, detail?: string) {
    this.messageService.add({ severity: 'warn', icon: 'pi pi-exclamation-triangle', summary, detail });
  }

  error(summary: string, detail?: string) {
    this.messageService.add({ severity: 'error', icon: 'pi pi-times-circle', summary, detail });
  }

  apolloError(error: any, summary: string) {
    this.error(summary, getApolloErrorMessage(error));
  }

}
