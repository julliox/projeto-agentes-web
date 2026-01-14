// Polyfill para 'global' - deve ser importado primeiro
import './global-polyfill';

import { bootstrapApplication } from '@angular/platform-browser';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { importProvidersFrom, mergeApplicationConfig } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Adiciona providers específicos do browser apenas no cliente
const clientConfig = mergeApplicationConfig(appConfig, {
    providers: [
        provideClientHydration(),
        provideAnimationsAsync(),
        provideAnimations(),
        importProvidersFrom(BrowserAnimationsModule, MatSnackBarModule)
    ]
});

bootstrapApplication(AppComponent, clientConfig)
    .catch((err) => console.error(err));
