import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';
import { filter, map, switchMap, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { APP_NAME } from '../../global';

type NewType = MouseEvent;

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

  appName = APP_NAME;

  guestModeDialogVisible = false;

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.onAuthSuccess$.pipe(
      switchMap(() => this.layoutService.activeBanner$.pipe(take(1))),
      map(activeBanner => activeBanner?.bannerType),
      filter(activeBanner => activeBanner === 'guestMode'),
    ).subscribe(() => this.layoutService.clearBanner());
  }

  close() {
    this.layoutService.clearBanner();
  }

  openGuestModeDialog(event: NewType) {
    event.preventDefault();
    this.guestModeDialogVisible = true;
  }

  goToAuth(authType: '/signup' | '/login') {
    this.guestModeDialogVisible = false;
    this.router.navigate([ authType ]);
  }

}
