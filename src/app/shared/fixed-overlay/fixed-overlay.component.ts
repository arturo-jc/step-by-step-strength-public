import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-fixed-overlay',
    templateUrl: './fixed-overlay.component.html',
    styleUrls: ['./fixed-overlay.component.scss'],
    animations: [
        trigger('overlayToggle', [
            state('void', style({
                transform: 'scaleY(0.8)',
                opacity: 0,
            })),
            state('close', style({
                transform: 'scaleY(0.8)',
                opacity: 0,
            })),
            state('open', style({
                transform: 'translateY(0)',
                opacity: 1,
            })),
            transition('* => open', animate('.12s cubic-bezier(0, 0, 0.2, 1)')),
        ]),
        trigger('buttonRotate', [
            state('close', style({})),
            state('open', style({ transform: 'rotate(45deg)' })),
            transition('open <=> close', animate('.12s cubic-bezier(0, 0, 0.2, 1)'))
        ])
    ],
    standalone: true,
    imports: [
      RippleModule,
      ButtonModule,
      NgIf,
      NgStyle,
    ]
})
export class FixedOverlayComponent {
  @Output() onShow = new EventEmitter();

  @Output() onHide = new EventEmitter();

  @ViewChild('overlayRef') overlay?: ElementRef;

  @HostListener('document:click', ['$event'])
  dismiss(event: MouseEvent) {
    if (this.animationInProgress) { return; }
    if (!this.overlayVisible) { return; }
    if (this.overlay?.nativeElement.contains(event.target)) { return; }
    this.hide();
  }

  render = false;

  overlayVisible = false;

  animationInProgress = false;

  toggleOverlay() {
    if (this.animationInProgress) { return; }

    if (this.overlayVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    this.overlayVisible = true;
    this.render = true;
    this.onShow.emit();
  }

  hide() {
    this.overlayVisible = false;
    this.onHide.emit();
  }

}
