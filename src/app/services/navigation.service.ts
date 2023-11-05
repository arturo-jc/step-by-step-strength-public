import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private history: string[] = [];

  private maxLength = 10;

  constructor(private router: Router) {}

  init() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {

        this.history.push(event.urlAfterRedirects);

        if (this.history.length > this.maxLength) {
          this.history.shift();
        }
      });
    }

  get availableUrls() {
    return this.history.slice(0, this.history.length - 1)
      .filter(url => !url.includes('edit'));
  }

  get lastAvailableUrl() {
    return this.availableUrls[this.availableUrls.length - 1];
  }

  goBack(fallbackUrl: string) {
    if (this.availableUrls.length > 0) {
      this.router.navigateByUrl(this.lastAvailableUrl);
    } else {
      this.router.navigateByUrl(fallbackUrl);
    }
  }
}
