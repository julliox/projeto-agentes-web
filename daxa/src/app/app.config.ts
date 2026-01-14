// src/app/app.config.ts
// Configuração base compartilhada entre cliente e servidor
import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import {JwtInterceptor} from "./services/jwt.interceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        // provideClientHydration() removido - será adicionado apenas no cliente (main.ts)
        // provideAnimationsAsync(), provideAnimations() e BrowserAnimationsModule removidos
        // - serão adicionados apenas no cliente (main.ts)
        // MatSnackBarModule removido - será adicionado apenas no cliente (main.ts)
        provideHttpClient(withFetch(), withInterceptorsFromDi())
        // Outros provedores
    ]
};
