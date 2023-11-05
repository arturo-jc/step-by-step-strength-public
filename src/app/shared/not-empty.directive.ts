import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { notEmpty } from '../utils/typescript';

@Directive({
  selector: '[appNotEmpty]',
  standalone: true
})
export class NotEmptyDirective {

  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) { }

  @Input() set appNotEmpty(value: any) {

    const shouldDisplay = notEmpty(value);

    if (shouldDisplay && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!shouldDisplay && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }

  }

}
