import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { routes } from './app.routes';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { createUnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      GraphQLModule,
      HttpClientModule,
      BrowserAnimationsModule,
      MarkdownModule.forRoot(),
    ),
    {
      provide: 'unsavedChangesGuard',
      useFactory: createUnsavedChangesGuard,
      deps: [ ConfirmationService, Router ],
    },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('YOUR_CLIENT_ID', {
              oneTapEnabled: false,
              scopes: 'email profile'
            }),
          },
        ],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig
    },
    MarkdownService,
    MessageService,
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
    ConfirmationService,
  ]
};
