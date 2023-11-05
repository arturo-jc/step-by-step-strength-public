import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, Subject, switchMap } from 'rxjs';
import { AuthenticateGQL, AuthenticateOutput, LogInGQL, LogOutGQL, SignInWithGoogleGQL, SignUpGQL } from '../../generated/graphql.generated';
import { GraphQLModule } from '../graphql.module';
import { ApolloError } from '@apollo/client/core';
import { ToastsService } from './toasts.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { throwIfUndefined } from '../utils/typescript';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _user = new BehaviorSubject<AuthenticateOutput | null>(null);

  private _onFirstAuthAttempt = new Subject<void>();

  private _onAuthSuccess = new Subject<AuthenticateOutput>();

  private _onAuthFail = new Subject<void>();

  private _onLogout = new Subject<void>();

  private _onDataLoaded = new Subject<void>();

  user$ = this._user.asObservable();

  onFirstAuthAttempt$ = this._onFirstAuthAttempt.asObservable();

  isAuthenticated$ = this._user.pipe(map(user => Boolean(user)));

  userId$ = this._user.pipe(map(user => user?.userId));

  onAuthSuccess$ = this._onAuthSuccess.asObservable();

  onAuthFail$ = this._onAuthFail.asObservable();

  onLogout$ = this._onLogout.asObservable();

  onDataLoaded$ = this._onDataLoaded.asObservable();

  redirectUrl: string | undefined;

  googleSignInWrapper: HTMLDivElement | null = null;

  googleSignInLabel?: string;

  constructor(
    private logInGQL: LogInGQL,
    private authenticateGQL: AuthenticateGQL,
    private signUpGQL: SignUpGQL,
    private logOutGQL: LogOutGQL,
    private graphQLModule: GraphQLModule,
    private toasts: ToastsService,
    private socialAuthService: SocialAuthService,
    private signInWithGoogleGQL: SignInWithGoogleGQL,
  ) { }

  async init() {

    this.graphQLModule.onAuthenticationError.subscribe(() => {
      this.logOut();
    });

    this.socialAuthService.authState
      .pipe(
        map(googleUser => googleUser?.idToken),
        throwIfUndefined(() => new Error('Google user is undefined')),
        switchMap(idToken => this.signInWithGoogleGQL.mutate({ idToken })),
      ).subscribe({
        next: res => this.handleAuthSuccess(res.data?.signInWithGoogle),
        error: err => this.handleAuthErr(err, 'Failed to sign in with Google'),
      });

    await this.authenticate();
  }

  authenticate() {
    this.authenticateGQL.fetch().subscribe({
      next: res => {
        this.handleAuthSuccess(res.data?.authenticate);
        this._onFirstAuthAttempt.next();
      },
      error: err => {
        this.handleAuthErr(err, 'Failed to authenticate');
        this._onFirstAuthAttempt.next();
      }
    });

    return firstValueFrom(this.onFirstAuthAttempt$);
  }

  signUp(email: string, password: string) {
    this.signUpGQL.mutate({ email, password }).subscribe({
      next: res => this.handleAuthSuccess(res.data?.signUp),
      error: err => this.handleAuthErr(err, 'Failed to sign up')
    });
  }

  logIn(email: string, password: string) {
    this.logInGQL.fetch({ email, password }).subscribe({
      next: res => this.handleAuthSuccess(res.data?.logIn),
      error: err => this.handleAuthErr(err, 'Failed to log in')
    })
  }

  logOut() {
    this.logOutGQL.fetch().subscribe({
      next: () => this._onLogout.next(),
      error: err => this.handleAuthErr(err, 'Logout failed')
    })
  }

  handleAuthSuccess(authenticateOutput: AuthenticateOutput | undefined | null) {
    if (!authenticateOutput) { return; }

    this.loadUser(authenticateOutput);
  }

  loadUser(user?: AuthenticateOutput | null ) {
    if (!user) { return; }
    this._user.next(user);
    this._onAuthSuccess.next(user);
  }

  reset() {
    this._user.next(null);
  }

  finishLoadingData() {
    this._onDataLoaded.next();
  }

  handleAuthErr(err: ApolloError, summary: string) {
    this.toasts.apolloError(err, summary);
    this._onAuthFail.next();
  }

  initGoogleSignIn() {

    if (this.googleSignInWrapper) { return; }

    this.googleSignInWrapper = this.createGoogleSignInWrapper();

    this.googleSignInLabel = this.googleSignInWrapper?.querySelector<HTMLSpanElement>('#button-label')?.innerText;
  }

  createGoogleSignInWrapper() {

    const googleLoginWrapper = document.createElement('div');

    googleLoginWrapper.style.display = 'none';

    document.body.appendChild(googleLoginWrapper);

    window.google.accounts.id.renderButton(googleLoginWrapper, {
      type: 'icon',
      width: '200',
    });

    return googleLoginWrapper.querySelector<HTMLDivElement>(
      'div[role=button]'
    );
  }

  signInWithGoogle() {

    if (!this.googleSignInWrapper) {
      throw new Error('Google sign in wrapper is undefined');
    }

    this.googleSignInWrapper.click();
  }
}

