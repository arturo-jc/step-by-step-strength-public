import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inplace, InplaceModule } from 'primeng/inplace';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgModel } from '@angular/forms';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { asapScheduler } from 'rxjs';

@Component({
  selector: 'app-edit-in-place',
  standalone: true,
  imports: [
    CommonModule,
    InplaceModule,
    FormsModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './edit-in-place.component.html',
  styleUrls: ['./edit-in-place.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: EditInPlaceComponent,
  }],
})
export class EditInPlaceComponent implements AfterViewInit, ControlValueAccessor {

  @Input() text!: string;

  @Input() displayStyle: Record<string, string | number> = {
    'font-size': '1.25rem',
    'font-weight': '500',
    'line-height': '1',
  }

  @Output() textChange = new EventEmitter();

  @Input() placeholder!: string;

  @Input() disabled = false;

  @Output() onActivate = new EventEmitter();

  @ViewChild(Inplace) inplaceRef?: Inplace;

  @ViewChildren(InputText) inputQueryList?: QueryList<InputText>;

  @ViewChild('inputModelRef') inputModelRef?: NgModel;

  onChange = (_text: string) => {};

  onTouched = () => {};

  editedText!: string;

  touched = false;

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.autoFocusOnActive();
  }

  autoFocusOnActive() {
    this.inputQueryList?.changes.subscribe((queryList) => {
      if (queryList.length > 0) {
        const input = queryList.first.el.nativeElement;
        input.focus();

        if (!this.touched) {
          asapScheduler.schedule(() => input.select());
        }
      }
    });
  }

  updateText() {
    if (!this.inputModelRef?.valid) { return; }
    this.text = this.editedText;
    this.textChange.emit(this.text);
    this.onChange(this.text);
    this.markAsTouched();
    this.inplaceRef?.deactivate();
  }

  handleActivate() {
    this.editedText = this.text;
    this.onActivate.emit();
  }

  writeValue(text: string): void {
    this.text = text;
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabled(disabled: boolean) {
    this.disabled = disabled;
  }

  get active() {
    if (!this.inplaceRef) {
      return false;
    }

    return this.inplaceRef.active;
  }

  activate() {

    if (!this.inplaceRef) {
      throw new Error('activate called before view init');
    }

    this.inplaceRef.activate();

    this.cd.detectChanges();
  }
}
