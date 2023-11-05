import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { map, switchMap, take } from "rxjs";
import { AuthService } from "../services/auth.service";

export const isAuthenticated: CanActivateFn = (
    _route = inject(ActivatedRouteSnapshot),
    state = inject(RouterStateSnapshot),
    authService = inject(AuthService),
    router = inject(Router)
) => {
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      authService.redirectUrl = state.url;
      return router.createUrlTree([ '/login' ]);
    }),
  );
}

export const hasRole: CanActivateFn = (
    route = inject(ActivatedRouteSnapshot),
    _state = inject(RouterStateSnapshot),
    authService = inject(AuthService),
    router = inject(Router)
) => {
  return authService.onFirstAuthAttempt$.pipe(
    take(1),
    switchMap(() => authService.user$.pipe(take(1))),
    map(user => {
      if (route.data['role'] !== user?.role) {
        return router.createUrlTree([ '/access-denied' ]);
      }
      return true;
    }),
  );
}

export const isDeauthenticated: CanActivateFn = (
    _route = inject(ActivatedRouteSnapshot),
    _state = inject(RouterStateSnapshot),
    authService = inject(AuthService),
    router = inject(Router)
) => {
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }
      return router.createUrlTree([ '/dashboard' ]);
    }));
}

