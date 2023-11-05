import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export type BannerType = 'default' | 'guestMode';

export interface BannerInput {
  bannerType: BannerType;
  closable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private smallBreakpoint = 768;

  private _activeBanner$ = new BehaviorSubject<BannerInput | undefined>(undefined);

  private _screenSize$ = new BehaviorSubject<number>(window.innerWidth);

  private _sidebarClicked$ = new BehaviorSubject<boolean>(false);

  sidebarClicked$ = this._sidebarClicked$.asObservable();

  isSmallScreen$ = this._screenSize$.pipe(map(size => size < this.smallBreakpoint));

  activeBanner$ = this._activeBanner$.asObservable();

  constructor() { }

  setBanner(input: BannerInput) {

    if (input.closable === undefined) {
      input.closable = true;
    }

    this._activeBanner$.next(input);
  }

  clearBanner() {
    this._activeBanner$.next(undefined);
  }

  setScreenSize() {
    this._screenSize$.next(window.innerWidth);
  }

  registerSidebarClick() {
    this._sidebarClicked$.next(true);
  }
}
