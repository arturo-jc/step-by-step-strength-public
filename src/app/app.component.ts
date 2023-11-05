import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { WorkoutTemplatesService } from './services/workout-templates.service';
import { Apollo } from 'apollo-angular';
import { SchedulesService } from './services/schedules.service';
import { PrimeNGConfig } from 'primeng/api';
import { ProgramsService } from './services/programs.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ExerciseItemsService } from './services/exercise-items.service';
import { catchError, combineLatest, firstValueFrom, map, of, switchMap } from 'rxjs';
import { SaveDraftsGQL } from '../generated/graphql.generated';
import { ToastsService } from './services/toasts.service';
import { LayoutService } from './services/layout.service';
import { NavigationService } from './services/navigation.service';
import { APP_NAME } from './global';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ConfirmDialogModule,
    ConfirmPopupModule,
    ToastModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = APP_NAME;

  layoutMode = 'static';

  darkMenu = true;

  inputStyle = 'outlined';

  ripple = true;

  compactMode = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.layoutService.setScreenSize();
  }

  constructor(
    private router: Router,
    public auth: AuthService,
    private exerciseItemsService: ExerciseItemsService,
    private workoutTemplatesService: WorkoutTemplatesService,
    private schedulesService: SchedulesService,
    private programsService: ProgramsService,
    private apollo: Apollo,
    private primengConfig: PrimeNGConfig,
    private saveDraftsGQL: SaveDraftsGQL,
    private toasts: ToastsService,
    private layoutService: LayoutService,
    private navigationService: NavigationService,
  ) { }

  ngOnInit(): void {
    this.initializeServices();
    this.primengConfig.ripple = true;
    this.auth.onAuthSuccess$.subscribe(user => this.onAuthSuccess(user.userId))
    this.auth.onLogout$.subscribe(() => this.onLogout());
  }

  async initializeServices() {
    this.navigationService.init();
    await this.auth.init();
    await this.exerciseItemsService.init();
    await this.workoutTemplatesService.init();
    await this.schedulesService.init();
  }

  async onAuthSuccess(userId: string) {
    await this.saveDrafts();
    await this.exerciseItemsService.onAuthSuccess(userId);
    await this.workoutTemplatesService.onAuthSuccess(userId);
    await this.schedulesService.onAuthSuccess(userId);
    await this.programsService.onAuthSuccess(userId);
    this.auth.finishLoadingData();
  }

  async onLogout() {
    this.auth.reset();
    this.exerciseItemsService.reset();
    this.workoutTemplatesService.reset();
    this.schedulesService.reset();
    this.programsService.reset();
    this.apollo.client.clearStore();
    this.router.navigate([ '/login' ], {
      state: { skipUnsavedChangesCheck: true }
    });
  }

  saveDrafts() {
    const success$ = combineLatest([
      this.exerciseItemsService.drafts$,
      this.workoutTemplatesService.drafts$,
      this.schedulesService.drafts$,
      this.programsService.drafts$,
    ]).pipe(
    map(([
      exerciseItems,
      workoutTemplates,
      schedules,
      programs,
    ]) => ({
      exerciseItems,
      workoutTemplates,
      schedules,
      programs,
    })),
    switchMap(drafts => {

      const draftsAvailable = Object.values(drafts).some(draft => draft.length > 0);

      if (!draftsAvailable) {
        return of (false);
      }

      return this.saveDraftsGQL.mutate({ drafts }).pipe(
        map(res => res?.data?.saveDrafts || false),
        catchError(err => {
          this.toasts.apolloError(err, 'Unable to save drafts');
          return of (false);
        }),
      );

    }));

    return firstValueFrom(success$, { defaultValue: false });
  }

}
