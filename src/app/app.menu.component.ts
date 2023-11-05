import {Component, Input} from '@angular/core';
import { AppMenuitemComponent } from './app.menuitem.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [
      AppMenuitemComponent,
      CommonModule,
    ],
    template: `
        <div class="menu-scroll-content">
			<ul class="navigation-menu">
				<li app-menuitem *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true"></li>
			</ul>
        </div>
    `
})
export class AppMenuComponent {

    @Input() public model!: any[];
}
