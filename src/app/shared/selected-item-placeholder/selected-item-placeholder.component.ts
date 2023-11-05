import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selected-item-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selected-item-placeholder.component.html',
  styleUrls: ['./selected-item-placeholder.component.scss']
})
export class SelectedItemPlaceholderComponent {

  @Input() placeholderText = 'Select an item';

  @Input() icon = 'pi pi-info-circle';
}
