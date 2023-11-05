import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubSink } from 'subsink';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramsService } from '../../services/programs.service';
import { map, switchMap, take, tap } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { AuthService } from '../../services/auth.service';
import { throwIfUndefined } from '../../utils/typescript';
import { UserProgramsGQL } from '../../../generated/graphql.generated';
import { ProgramPreviewComponent } from '../program-preview/program-preview.component';
import { EditInPlaceComponent } from '../../shared/edit-in-place/edit-in-place.component';
import { ButtonModule } from 'primeng/button';
import { ToastsService } from '../../services/toasts.service';
import { FrontendProgram, FrontendWorkout, MutateProgramInput } from '../../shared/types';
import { HasUnsavedChanged } from '../../guards/unsaved-changes.guard';
import { TooltipModule } from 'primeng/tooltip';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-mutate-program',
  standalone: true,
  imports: [
    CommonModule,
    ProgramPreviewComponent,
    EditInPlaceComponent,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './mutate-program.component.html',
  styleUrls: ['./mutate-program.component.scss']
})
export class MutateProgramComponent implements OnInit, HasUnsavedChanged, OnDestroy {

  programId?: string;

  programKey?: string;

  name = '';

  workouts: FrontendWorkout[] = [];

  passedData = {
    programKey: undefined,
  }

  subs = new SubSink();

  saving = false;

  hasChanges = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programsService: ProgramsService,
    private auth: AuthService,
    private userProgramsGQL: UserProgramsGQL,
    private toasts: ToastsService,
    private navigationService: NavigationService,
  ) {
    const navigation = this.router.getCurrentNavigation();

    const { programKey } = navigation?.extras?.state || {};

    this.passedData.programKey = programKey;
  }

  ngOnInit() {
    this.watchUrl();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  watchUrl() {
    this.subs.sink = this.route.paramMap.pipe(
      tap(params => this.programId = params.get('programId') || undefined),
      switchMap(() => this.programsService.programs$)
    ).subscribe(programs => {

      const activeProgram = programs.find(program => program.key === this.passedData.programKey);

      if (activeProgram) {
        this.loadProgram(activeProgram);
        return;
      }

      if (this.programId) {
        this.fetchProgramById(this.programId);
        return;
      }

      console.error('Unable to load program: no ID in URL and no active workout template found');

      this.router.navigate([ '/programs' ]);
    });
  }

  loadProgram(program: FrontendProgram) {
    this.name = program.name;
    this.programKey = program.key;
    this.workouts = cloneDeep(program.workouts);
  }

  fetchProgramById(programId: string) {
    this.auth.userId$
      .pipe(
        take(1),
        throwIfUndefined(() => 'Unable to fetch program: no user id found'),
        map(userId => ({ userId, filter: { programIds: [ programId ] }})),
        switchMap(queryVariables => this.userProgramsGQL.fetch(queryVariables).pipe(
          map(result => result.data.user?.programs),
          throwIfUndefined(() => `Unable to fetch program: no program found with id ${programId}`),
          map(fullProgramFragments => this.programsService.convertPrograms(fullProgramFragments)),
          map(programs => programs?.[0]),
        )),
      ).subscribe(program => this.loadProgram(program));
  }

  async saveChanges(navigateOnSuccess?: boolean) {

    const name = this.name.trim();

    if (!name) {
      throw new Error('Unable to save program: no name entered');
    }

    if (this.workouts.length === 0) {
      throw new Error('Unable to save program: no workouts');
    }

    const program: MutateProgramInput = {
      name,
      workouts: this.workouts,
      id: this.programId,
    }

    this.saving = true;

    const mutatedProgram = await this.programsService.editProgram(program, {
      programId: this.programId,
      programKey: this.programKey,
    });

    this.saving = false;

    if (mutatedProgram) {
      this.hasChanges = false;

      this.toasts.success('Program saved');
    }

    if (mutatedProgram && navigateOnSuccess) {
      this.router.navigate([ '/programs' ], {
        state: {
          programKey: mutatedProgram.key,
        },
      });
    }
  }

  hasUnsavedChanges(): boolean {
    return this.hasChanges;
  }

  markAsChanged() {
    this.hasChanges = true;
  }

  canSaveChanges(): { canSave: boolean; message?: string | undefined; } {

    const canSave = this.workouts.length > 0 && Boolean(this.name);


    if (canSave) {
      return { canSave };
    }


    let message: string | undefined = undefined;

    if (this.workouts.length === 0) {
      message = `You have unsaved changes, but they can't be saved until you generate a program.`;
    } else if (!this.name) {
      message = `You have unsaved changes, but they can't be saved until you enter a name.`;
    }

    return {
      canSave,
      message,
    }
  }

  discardChanges() {
    this.hasChanges = false;
    this.navigationService.goBack('/programs');
  }
}
