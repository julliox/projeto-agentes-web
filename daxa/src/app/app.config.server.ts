import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(),
        // Usa NoopAnimationsModule no servidor (sem animações)
        importProvidersFrom(NoopAnimationsModule)
    ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);