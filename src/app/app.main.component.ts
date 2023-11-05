import { Component, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import {AppComponent} from './app.component';
import { AppTopbarComponent } from './app.topbar.component';
import { AppSideBarComponent } from './app.sidebar.component';
import { AppFooterComponent } from './app.footer.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './shared/banner/banner.component';
import { LayoutService } from './services/layout.service';

@Component({
    selector: 'app-main',
    templateUrl: './app.main.component.html',
    standalone: true,
    imports: [
      AppTopbarComponent,
      AppSideBarComponent,
      AppFooterComponent,
      BannerComponent,
      RouterOutlet,
      CommonModule,
    ]
})
export class AppMainComponent implements AfterViewInit, OnDestroy {

    activeTabIndex?: number;

    sidebarActive?: boolean;

    topbarMenuActive?: boolean;

    sidebarClick?: boolean;

    topbarItemClick?: boolean;

    activeTopbarItem: any;

    documentClickListener: any;

    configActive?: boolean;

    configClick?: boolean;

    constructor(
      public renderer: Renderer2,
      private primengConfig: PrimeNGConfig,
      public app: AppComponent,
      private layoutService: LayoutService,
    ) {}

    ngAfterViewInit() {
        this.documentClickListener = this.renderer.listen('body', 'click', (event) => {
            if (!this.topbarItemClick) {
                this.activeTopbarItem = null;
                this.topbarMenuActive = false;
            }

            if (!this.sidebarClick && (this.overlay || !this.isDesktop())) {
                this.sidebarActive = false;
            }

            if (this.configActive && !this.configClick) {
                this.configActive = false;
            }

            this.configClick = false;
            this.topbarItemClick = false;
            this.sidebarClick = false;
        });
    }

    onTabClick(event: Event, index: number) {
        if (this.activeTabIndex === index) {
            this.sidebarActive = !this.sidebarActive;
        } else {
            this.activeTabIndex = index;
            this.sidebarActive = true;
        }

        event.preventDefault();
    }

    closeSidebar(event: Event) {
        this.sidebarActive = false;
        event.preventDefault();
    }

    onSidebarClick($event: MouseEvent) {
        this.sidebarClick = true;
        this.layoutService.registerSidebarClick();
    }

    onTopbarMenuButtonClick(event: MouseEvent) {
        this.topbarItemClick = true;
        this.topbarMenuActive = !this.topbarMenuActive;

        event.preventDefault();
    }

    onTopbarItemClick(event: MouseEvent, item: HTMLElement) {
        this.topbarItemClick = true;

        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null; } else {
            this.activeTopbarItem = item; }

        event.preventDefault();
    }

    onTopbarSubItemClick(event: MouseEvent) {
        event.preventDefault();
    }

    onConfigClick(event: MouseEvent) {
        this.configClick = true;
    }

    onRippleChange(event: { checked: boolean }) {
        this.app.ripple = event.checked;
        this.primengConfig = event.checked as unknown as PrimeNGConfig;
    }

    get overlay(): boolean {
        return this.app.layoutMode === 'overlay';
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    ngOnDestroy() {
        if (this.documentClickListener) {
            this.documentClickListener();
        }
    }
}
