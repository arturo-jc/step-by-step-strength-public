import {Component} from '@angular/core';
import {AppMainComponent} from './app.main.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [
      CommonModule,
      RouterLink,
    ],
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopbarComponent {

  constructor(
    public appMain: AppMainComponent,
    public auth: AuthService,
  ) {}
}
