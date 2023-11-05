import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { merge } from 'rxjs';
import { SubSink } from 'subsink';
import { DividerModule } from 'primeng/divider';

type AuthType = 'login' | 'signup';

interface AuthForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  username?: FormControl<string | null>;
  rememberMe: FormControl<boolean | null>;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CheckboxModule,
    InputTextModule,
    ButtonModule,
    DividerModule,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

  authForm = new FormGroup<AuthForm>({
    email: new FormControl('', [ Validators.required, Validators.email ]),
    password: new FormControl('', [ Validators.required, Validators.minLength(8) ]),
    rememberMe: new FormControl(false),
  });

  authType!: AuthType;

  authenticating = false;

  subs = new SubSink();

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {

    this.authService.initGoogleSignIn();

    this.setAuthType();

    if (this.authType === 'signup') {
      this.authForm.addControl('username', new FormControl(''));
    };

    this.authService.onDataLoaded$.subscribe(() => {
      const redirectUrl = this.authService.redirectUrl || '/dashboard';
      this.authService.redirectUrl = undefined;
      this.router.navigate([ redirectUrl ]);
    });

    this.subs.sink = merge(this.authService.onAuthSuccess$, this.authService.onAuthFail$).subscribe(() => {
      this.authenticating = false;
    });
  }

  setAuthType() {
    const [ urlFragment ] = this.route.snapshot.url;
    const { path } = urlFragment;
    this.authType = path as AuthType;
  }

  authenticate() {

    this.authenticating = true;

    const { email, password } = this.authForm.value;

    if (!email || !password) { return; }

    if (this.authType === 'login') {
      this.authService.logIn(email, password);
    } else if (this.authType === 'signup') {
      this.authService.signUp(email, password);
    }
  }
}
