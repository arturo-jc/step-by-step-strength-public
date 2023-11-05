import { ActivatedRouteSnapshot, CanDeactivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

export interface HasUnsavedChanged {
  hasUnsavedChanges(): boolean;
  canSaveChanges(): {
    canSave: boolean;
    message?: string;
  }
  saveChanges: (_navigateOnSuccess?: boolean) => Promise<void>;
  markAsChanged: () => void;
}

export function createUnsavedChangesGuard(
  confirmationService: ConfirmationService,
  router: Router,
): CanDeactivateFn<HasUnsavedChanged> {
  return (
    component: HasUnsavedChanged,
    _currentRoute: ActivatedRouteSnapshot,
    _currentState: RouterStateSnapshot,
    _nextState?: RouterStateSnapshot
  )  => {

    if (!component.hasUnsavedChanges()) {
      return true;
    }

    const skipUnsavedChangesCheck = router.getCurrentNavigation()?.extras?.state?.['skipUnsavedChangesCheck'];

    if (skipUnsavedChangesCheck) {
      return true;
    }

    return new Promise<boolean>((resolve, reject) => {

      if (component.hasUnsavedChanges()) {

        const { canSave, message: cannotSaveMessage } = component.canSaveChanges();

        let message = 'Do you want to leave without saving your changes?';

        let acceptLabel = 'Save and Leave';

        let acceptIcon = 'pi pi-save';

        let accept = async () => {
          await component.saveChanges();
          resolve(true);
        }

        if (!canSave) {

          message = cannotSaveMessage || message;

          acceptLabel = 'Continue Editing';

          acceptIcon = 'pi pi-play';

          accept = async () => resolve(false);
        }

        confirmationService.confirm({
          header: 'Unsaved changes',
          message,
          acceptLabel,
          acceptIcon,
          rejectLabel: 'Discard and Leave',
          rejectIcon: 'pi pi-trash',
          rejectButtonStyleClass: 'p-button-danger p-button-outlined',
          accept,
          key: 'dialog',
          reject: (arg: any) => {

            const discarded = arg === 1;

            const closed = arg === 2;

            if (discarded) {
              resolve(true);
              return;
            }

            if (closed) {
              resolve(false);
              return;
            }

            reject(new Error('Unexpected confirmation result'));
          }
        });

      }
    });

  }
}
