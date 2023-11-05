import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-preset-indicator',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
  ],
  templateUrl: './preset-indicator.component.html',
  styleUrls: ['./preset-indicator.component.scss']
})
export class PresetIndicatorComponent {

  @Input() preset!: boolean;

  @Input() objectType!: string;

}
