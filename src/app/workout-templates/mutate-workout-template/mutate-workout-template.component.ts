import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseItemsComponent } from '../../exercise-items/exercise-items.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { cloneDeep } from 'lodash-es';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { catchError, map, switchMap, take, tap } from 'rxjs';
import { WorkoutTemplatesService } from '../../services/workout-templates.service';
import { FormsModule } from '@angular/forms';
import { SubSink } from 'subsink';
import { ExerciseTemplatesService } from '../../services/exercise-templates.service';
import { AuthService } from '../../services/auth.service';
import { throwIfUndefined } from '../../utils/typescript';
import { ButtonModule } from 'primeng/button';
import { EditInPlaceComponent } from '../../shared/edit-in-place/edit-in-place.component';
import { ColorPickerModule } from 'primeng/colorpicker';
import { collapse } from '../../utils/animations';
import { ExerciseTemplateDraggableComponent } from '../../exercise-templates/exercise-template-draggable/exercise-template-draggable.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FieldsetModule } from 'primeng/fieldset';
import { FixedOverlayComponent } from '../../shared/fixed-overlay/fixed-overlay.component';
import { ToastsService } from '../../services/toasts.service';
import { ExerciseItemsService, FrontendExerciseItem } from '../../services/exercise-items.service';
import { ConfirmationService } from 'primeng/api';
import { FrontendExerciseTemplate, FrontendSetTemplate, FrontendWorkoutTemplate, MutateWorkoutTemplateInput } from '../../shared/types';
import { SchedulesService } from '../../services/schedules.service';
import { WorkoutTemplatesGQL } from '../../../generated/graphql.generated';
import { HasUnsavedChanged } from '../../guards/unsaved-changes.guard';
import { TooltipModule } from 'primeng/tooltip';
import { NavigationService } from '../../services/navigation.service';

export const DEFAULT_BG_COLOR = '#0097a7';

export const EXERCISE_TEMPLATES_DROP_LIST_ID = 'exercise-templates';

@Component({
  selector: 'app-mutate-workout-template',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ExerciseItemsComponent,
    DragDropModule,
    ButtonModule,
    EditInPlaceComponent,
    ColorPickerModule,
    ExerciseTemplateDraggableComponent,
    RadioButtonModule,
    FieldsetModule,
    FixedOverlayComponent,
    TooltipModule,
  ],
  templateUrl: './mutate-workout-template.component.html',
  styleUrls: ['./mutate-workout-template.component.scss'],
  animations: [ collapse ],
})
export class MutateWorkoutTemplateComponent implements OnInit, OnDestroy, AfterViewInit, HasUnsavedChanged {

  mode!: 'create' | 'edit';

  name = 'New Workout';

  backgroundColor = DEFAULT_BG_COLOR;

  exerciseTemplates: FrontendExerciseTemplate[] = [];

  workoutTemplateId?: string;

  workoutTemplateKey?: string;

  exerciseTemplatesDropListId = EXERCISE_TEMPLATES_DROP_LIST_ID;

  targetDropList: string | null = this.exerciseTemplatesDropListId;

  exerciseTemplateDropLists: string[] = [];

  subs = new SubSink();

  collapsedExerciseTemplateMap: Record<string, boolean> = {};

  exerciseTemplateAdded = false;

  lastExerciseTemplateAddedKey?: string;

  saving = false;

  passedData = {
    workoutTemplateName: undefined,
    workoutTemplateKey: undefined,
  }

  autoFocusOnNewExerciseTemplate = false;

  hasChanges = false;

  @ViewChildren(ExerciseTemplateDraggableComponent) exerciseTemplateQueryList?: QueryList<ExerciseTemplateDraggableComponent>;

  @ViewChild(FixedOverlayComponent) fixedOverlayRef?: FixedOverlayComponent;

  constructor(
    private workoutTemplateService: WorkoutTemplatesService,
    private exerciseItemsService: ExerciseItemsService,
    private schedulesService: SchedulesService,
    private route: ActivatedRoute,
    private router: Router,
    private exerciseTemplatesService: ExerciseTemplatesService,
    private workoutTemplatesGQL: WorkoutTemplatesGQL,
    private auth: AuthService,
    private toastsService: ToastsService,
    private confirmationService: ConfirmationService,
    private navigationService: NavigationService,
  ) {

    const navigation = this.router.getCurrentNavigation();

    const { workoutTemplateName, workoutTemplateKey } = navigation?.extras?.state || {};

    this.passedData.workoutTemplateName = workoutTemplateName;
    this.passedData.workoutTemplateKey = workoutTemplateKey;
  }

  ngOnInit(): void {
    this.handleDeleteExerciseItem();
    this.checkUrl();
  }

  ngAfterViewInit(): void {
    this.activateWorkoutTemplateOnAdd();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  checkUrl() {
    this.subs.sink = this.route.url.pipe(
      tap(url => this.setMode(url)),
      switchMap(() => this.route.paramMap),
      tap(paramMap => this.workoutTemplateId = paramMap.get('workoutTemplateId') || undefined),
      switchMap(() => this.workoutTemplateService.workoutTemplates$.pipe(take(1))),
    )
    .subscribe(workoutTemplates => {

      if (this.mode === 'create') {

        this.reset();

        if (this.passedData.workoutTemplateName) {
          this.name = this.passedData.workoutTemplateName;
          this.hasChanges = true;
        }

        return;
      }

      const activeWorkoutTemplate = workoutTemplates.find(workoutTemplate => workoutTemplate.key === this.passedData.workoutTemplateKey);

      if (activeWorkoutTemplate) {
        this.loadWorkoutTemplate(activeWorkoutTemplate);
        return;
      }

      if (this.workoutTemplateId) {
        this.fetchWorkoutTemplate();
        return;
      }

      console.error('Unable to load workout template: no ID in URL and no active workout template found');

      this.router.navigate([ '/workouts' ]);
    });
  }

  setMode(url: UrlSegment[]) {

    const { path } = url?.[0];

    if (!path) {
      this.router.navigate([ '/not-found' ]);
    }

    if (path === 'new') {
      this.mode = 'create';
    } else if (path === 'edit') {
      this.mode = 'edit';
    } else {
      this.router.navigate([ '/not-found' ]);
    }
  }

  reset() {
    this.name = 'New Workout';
    this.backgroundColor = DEFAULT_BG_COLOR;
    this.exerciseTemplates = [];
    this.workoutTemplateId = undefined;
    this.setDropLists();
  }

  loadWorkoutTemplate(workoutTemplate: FrontendWorkoutTemplate) {
    this.name = workoutTemplate.name;
    this.workoutTemplateKey = workoutTemplate.key;
    this.backgroundColor = workoutTemplate.backgroundColor || DEFAULT_BG_COLOR;
    this.exerciseTemplates = cloneDeep(workoutTemplate.exerciseTemplates);
    this.setDropLists();
  }

  fetchWorkoutTemplate() {
    this.auth.userId$.pipe(
      take(1),
      throwIfUndefined(() => 'Unable to fetch workout template: no user ID'),
      map(userId => {

        if (!this.workoutTemplateId) {
          throw new Error('Unable to fetch workout template: no workout template ID');
        }

        return {
          userId,
          filter: { workoutTemplateIds: [ this.workoutTemplateId ] },
        };

      }),
      switchMap(queryVariables => this.workoutTemplatesGQL.fetch(queryVariables)),
      map(res => res.data?.workoutTemplates?.[0]),
      throwIfUndefined(() => 'Failed to fetch workout template'),
      map(workoutTemplate => this.workoutTemplateService.convertWorkoutTemplates([ workoutTemplate ], true)),
      map(workoutTemplates => workoutTemplates[0]),
      catchError(err => {
        console.error(err);
        this.router.navigate([ '/workouts' ]);
        return [];
      }),
    ).subscribe(workoutTemplate => this.loadWorkoutTemplate(workoutTemplate));
  }

  onExerciseTemplateListDrop(dropEvent: CdkDragDrop<
    FrontendExerciseTemplate[],
    FrontendExerciseTemplate[] | FrontendExerciseItem[],
    FrontendExerciseTemplate | FrontendExerciseItem
  >) {

    this.markAsChanged();

    const exerciseItem = dropEvent.item.data;

    if (dropEvent.previousContainer.id === 'exercise-items') {
      this.addExerciseTemplate(exerciseItem as FrontendExerciseItem, dropEvent.currentIndex);
      this.fixedOverlayRef?.show();
      return;
    }

    if (dropEvent.previousContainer.id === this.exerciseTemplatesDropListId) {
      moveItemInArray(dropEvent.container.data, dropEvent.previousIndex, dropEvent.currentIndex);
      this.setExerciseTemplatesOrder();
      return;
    }
  }

  onExerciseTemplateDrop(dropEvent: CdkDragDrop<
    FrontendExerciseTemplate,
    FrontendExerciseTemplate | FrontendExerciseItem[],
    FrontendExerciseItem | FrontendSetTemplate
  >) {

    this.markAsChanged();

    const exerciseTemplate = dropEvent.container.data;

    const item = dropEvent.item.data;

    if (dropEvent.previousContainer.id === 'exercise-items') {
      this.addSetTemplate(item as FrontendExerciseItem, exerciseTemplate, dropEvent.currentIndex);
      this.fixedOverlayRef?.show();
      return;
    }

    if (dropEvent.previousContainer.id === dropEvent.container.id) {
      this.reorderSetTemplates(exerciseTemplate, dropEvent.previousIndex, dropEvent.currentIndex);
      return;
    }

    // If we are here, it means we are moving a set template from one exercise template to another

    const previousExerciseTemplate = dropEvent.previousContainer.data as FrontendExerciseTemplate;

    // We shall treat this as deleting the set template from one exercise template and adding a copy to another
    // Delete the ID so that it is treated as a new set template
    delete item.id;

    this.moveSetTemplate(
      previousExerciseTemplate,
      exerciseTemplate,
      dropEvent.previousIndex,
      dropEvent.currentIndex,
    );
  }

  addExerciseTemplate(exerciseItem: FrontendExerciseItem, index: number) {

    const newExerciseTemplate: FrontendExerciseTemplate = {
      name: exerciseItem.exerciseType,
      order: 0,
      setTemplates: [ this.workoutTemplateService.getNewSetTemplate(exerciseItem) ],
      key: this.exerciseTemplatesService.currentKey,
    }

    const updatedTemplates = [ ...this.exerciseTemplates ];

    updatedTemplates.splice(index, 0, newExerciseTemplate);

    this.lastExerciseTemplateAddedKey = newExerciseTemplate.key;

    this.exerciseTemplateAdded = true;

    this.exerciseTemplates = updatedTemplates;

    this.setExerciseTemplatesOrder();

    if (this.autoFocusOnNewExerciseTemplate) {
      this.targetDropList = newExerciseTemplate.key;
    }

    this.setDropLists();
  }

  addSetTemplate(
    exerciseItem: FrontendExerciseItem,
    targetExerciseTemplate: FrontendExerciseTemplate,
    index: number
  ) {

    const currentSetTemplates = targetExerciseTemplate.setTemplates || [];

    const newSetTemplate = this.workoutTemplateService.getNewSetTemplate(exerciseItem);

    const updatedSetTemplates = [ ...currentSetTemplates ];

    updatedSetTemplates.splice(index, 0, newSetTemplate);

    targetExerciseTemplate.setTemplates = updatedSetTemplates;

    this.setSetTemplatesOrder(targetExerciseTemplate);

    this.exerciseTemplates = cloneDeep(this.exerciseTemplates);

  }

  moveSetTemplate(
    currentExerciseTemplate: FrontendExerciseTemplate,
    targetExerciseTemplate: FrontendExerciseTemplate,
    currentIndex: number,
    index: number,
  ) {

    currentExerciseTemplate.setTemplates = currentExerciseTemplate.setTemplates || [];

    targetExerciseTemplate.setTemplates = targetExerciseTemplate.setTemplates || [];

    transferArrayItem(currentExerciseTemplate.setTemplates, targetExerciseTemplate.setTemplates, currentIndex, index);

    this.setSetTemplatesOrder(currentExerciseTemplate);

    this.setSetTemplatesOrder(targetExerciseTemplate);

    this.removeEmptyExerciseTemplates();
  }

  removeEmptyExerciseTemplates() {

    const nonEmptyExerciseTemplates = this.exerciseTemplates.filter(template => template.setTemplates && template.setTemplates.length > 0);

    this.exerciseTemplates = nonEmptyExerciseTemplates;

    this.setExerciseTemplatesOrder();

    this.setDropLists();
  }

  removeExerciseTemplate(exerciseTemplate: FrontendExerciseTemplate) {

    this.markAsChanged();

    const exerciseTemplateIndex = this.exerciseTemplates.indexOf(exerciseTemplate);

    const updatedTemplates = [ ...this.exerciseTemplates ];

    updatedTemplates.splice(exerciseTemplateIndex, 1);

    this.exerciseTemplates = updatedTemplates;

    this.setExerciseTemplatesOrder();

    this.setDropLists();
  }

  removeSetTemplate(setTemplate: FrontendSetTemplate, exerciseTemplate: FrontendExerciseTemplate) {

    this.markAsChanged();

    const setTemplateIndex = exerciseTemplate.setTemplates.indexOf(setTemplate);

    const updateSetTemplates = [ ...exerciseTemplate.setTemplates ];

    updateSetTemplates.splice(setTemplateIndex, 1);

    exerciseTemplate.setTemplates = updateSetTemplates;

    this.setSetTemplatesOrder(exerciseTemplate);

    this.removeEmptyExerciseTemplates();
  }

  copySetTemplate(setTemplate: FrontendSetTemplate, exerciseTemplate: FrontendExerciseTemplate) {

    this.markAsChanged();

    const originalSetTemplateIndex = exerciseTemplate.setTemplates.indexOf(setTemplate);

    const {
      id,
      ...copy
    } = setTemplate;

    const updateSetTemplates = [ ...exerciseTemplate.setTemplates ];

    updateSetTemplates.splice(originalSetTemplateIndex + 1, 0, copy);

    exerciseTemplate.setTemplates = updateSetTemplates;

    this.setSetTemplatesOrder(exerciseTemplate);
  }

  reorderSetTemplates(exerciseTemplate: FrontendExerciseTemplate, previousIndex: number, currentIndex: number) {

    exerciseTemplate.setTemplates = exerciseTemplate.setTemplates || [];

    moveItemInArray(exerciseTemplate.setTemplates, previousIndex, currentIndex);

    this.setSetTemplatesOrder(exerciseTemplate);
  }

  setSetTemplatesOrder(exerciseTemplate: FrontendExerciseTemplate) {

    for (let i = 0; i < exerciseTemplate.setTemplates.length; i++) {

      const setTemplate = exerciseTemplate.setTemplates[i];

      setTemplate.order = i + 1;
    }
  }

  setExerciseTemplatesOrder() {

    for (let i = 0; i < this.exerciseTemplates.length; i++) {

      const exerciseTemplate = this.exerciseTemplates[i];

      exerciseTemplate.order = i + 1;
    }

    this.exerciseTemplates = cloneDeep(this.exerciseTemplates);
  }

  setDropLists(){

    const exerciseTemplateDropLists: string[] = [];

    for (const exerciseTemplate of this.exerciseTemplates) {

      if (!exerciseTemplate.key) {
        console.warn('Could not add exercise template to drop lists because it has no key', exerciseTemplate);
        continue;
      }

      // You should not be able to drop a set template into a collapsed exercise template
      if (this.collapsedExerciseTemplateMap[exerciseTemplate.key]) {
        continue;
      }

      exerciseTemplateDropLists.push(exerciseTemplate.key);
    }

    this.exerciseTemplateDropLists = exerciseTemplateDropLists;

    const targetDropListInactive = this.targetDropList &&
      this.targetDropList !== this.exerciseTemplatesDropListId &&
      !this.exerciseTemplateDropLists.includes(this.targetDropList);

    if (targetDropListInactive) {
      this.targetDropList = this.exerciseTemplatesDropListId;
    }
  }

  toggleExerciseTemplateCollapsed(exerciseTemplate: FrontendExerciseTemplate) {
    this.collapsedExerciseTemplateMap[exerciseTemplate.key] = !this.collapsedExerciseTemplateMap[exerciseTemplate.key];
    this.setDropLists();
  }

  async saveChanges(navigateOnSuccess?: boolean) {

    const input: MutateWorkoutTemplateInput = {
      name: this.name,
      backgroundColor: this.backgroundColor,
      exerciseTemplates: this.exerciseTemplates,
    }

    if (this.mode === 'edit') {
      this.confirmEditWorkoutTemplate(input, navigateOnSuccess);
      return;
    }

    this.saving = true;

    const createdWorkoutTemplate = await this.workoutTemplateService.addWorkoutTemplate(input);

    this.saving = false;

    if (createdWorkoutTemplate) {
      this.hasChanges = false;

      this.toastsService.success('Workout template created');
    }

    if (createdWorkoutTemplate && navigateOnSuccess) {

      this.router.navigate([ '/workouts' ], {
        state: {
          workoutTemplateKey: createdWorkoutTemplate.key,
        },
      });
    }
  }

  confirmEditWorkoutTemplate(input: MutateWorkoutTemplateInput, navigateOnSuccess?: boolean) {

    this.schedulesService.schedules$.pipe(take(1)).subscribe(schedules => {

      const schedulesReferecingWorkout = schedules
        .filter(
          schedule => schedule.weeks
            .flatMap(week => week.workouts)
            .some(workout => workout.workoutTemplateKey === this.workoutTemplateKey),
        );

      if (schedulesReferecingWorkout.length > 0) {

        const noun = schedulesReferecingWorkout.length === 1 ? 'schedule' : 'schedules';

        this.confirmationService.confirm({
          header: 'Save Changes?',
          message: `This will update any schedules that reference this workout (${schedulesReferecingWorkout.length} ${noun}).`,
          accept: () => this.editWorkoutTemplate(input, navigateOnSuccess),
          acceptIcon: 'pi pi-save',
          acceptLabel: 'Save',
          rejectLabel: 'Cancel',
          rejectIcon: 'pi pi-times',
          rejectButtonStyleClass: 'p-button-outlined p-button-danger',
          key: 'dialog',
        })
      } else {
        this.editWorkoutTemplate(input, navigateOnSuccess);
      }
    });

  }

  async editWorkoutTemplate(input: MutateWorkoutTemplateInput, navigateOnSuccess?: boolean) {

    this.saving = true;

    const editedWorkoutTemplate = await this.workoutTemplateService.editWorkoutTemplate(input, {
      workoutTemplateId: this.workoutTemplateId,
      workoutTemplateKey: this.workoutTemplateKey,
    });

    this.saving = false;

    if (editedWorkoutTemplate) {
      this.hasChanges = false;

      this.toastsService.success('Workout template updated');
    }

    if (editedWorkoutTemplate && navigateOnSuccess) {
      this.router.navigate([ '/workouts' ], {
        state: {
          workoutTemplateKey: editedWorkoutTemplate.key,
        },
      });
    }

  }

  activateWorkoutTemplateOnAdd() {
    this.exerciseTemplateQueryList?.changes.subscribe(() => {

      if (!(this.exerciseTemplateAdded && this.lastExerciseTemplateAddedKey)) { return; }

      const exerciseTemplates = this.exerciseTemplateQueryList?.toArray();

      if (!exerciseTemplates) {
        throw new Error('Exercise templates not found')
      }

      const lastExerciseTemplateAdded = exerciseTemplates.find(et => et.exerciseTemplate.key === this.lastExerciseTemplateAddedKey);

      if (!lastExerciseTemplateAdded) {
        throw new Error('Last exercise template added not found');
      }

      lastExerciseTemplateAdded.activate();

      this.exerciseTemplateAdded = false;

      this.lastExerciseTemplateAddedKey = undefined;
    });
  }

  handleDeleteExerciseItem() {
    this.subs.sink = this.exerciseItemsService.exerciseItemDeleted$.subscribe(exerciseItemKey => {

      let updatedExerciseTemplates = cloneDeep(this.exerciseTemplates);

      for (const exerciseTemplate of updatedExerciseTemplates) {
        exerciseTemplate.setTemplates = exerciseTemplate.setTemplates?.filter(setTemplate => setTemplate.exerciseItemKey !== exerciseItemKey);
      }

      updatedExerciseTemplates = updatedExerciseTemplates.filter(exerciseTemplate => exerciseTemplate.setTemplates.length > 0);

      this.exerciseTemplates = updatedExerciseTemplates;

      if (!this.exerciseTemplates.length) {
        this.router.navigate([ '/workouts' ]);
      }

    });
  }

  hasUnsavedChanges(): boolean {
    return this.hasChanges;
  }

  markAsChanged() {
    this.hasChanges = true;
  }

  canSaveChanges(): { canSave: boolean; message?: string | undefined; } {

    const canSave = this.exerciseTemplates.length > 0 && Boolean(this.name);

    if (canSave) {
      return { canSave };
    }

    let message: string | undefined = undefined;

    if (this.exerciseTemplates.length === 0) {
      message = `You have unsaved changes, but they can't be saved until you add some exercises to this workout.`;
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
    this.navigationService.goBack('/workouts');
  }
}
