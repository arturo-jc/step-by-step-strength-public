import {Component} from '@angular/core';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import { CommonModule } from '@angular/common';
import { AppMenuComponent } from './app.menu.component';
import { AppSidebartabcontentComponent } from './app.sidebartabcontent.component';
import { RippleModule } from 'primeng/ripple';
import { RESOURCE_MAP } from './global';

@Component({
    selector: 'app-sidebar',
    templateUrl: './app.sidebar.component.html',
    standalone: true,
    imports: [
      CommonModule,
      AppMenuComponent,
      AppSidebartabcontentComponent,
      RippleModule,
    ]
})
export class AppSideBarComponent {

    constructor(public app: AppComponent, public appMain: AppMainComponent) {}

    sidebarMenu = [
        {
            header: 'Main Menu',
            icon: 'pi pi-fw pi-home',
            items: [
                { label: 'Dashboard', icon: `pi-fw ${RESOURCE_MAP['dashboard'].icon}`, routerLink: ['/dashboard'] },
                { label: 'Workouts', icon: `pi-fw ${RESOURCE_MAP['workouts'].icon}`, routerLink: ['/workouts'] },
                { label: 'Schedules', icon: `pi-fw ${RESOURCE_MAP['schedules'].icon}`, routerLink: ['/schedules'] },
                { label: 'Programs', icon: `pi-fw ${RESOURCE_MAP['programs'].icon}`, routerLink: ['/programs'] },
            ]
        }
    ]

}
