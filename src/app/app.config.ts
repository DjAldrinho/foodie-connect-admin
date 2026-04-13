import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { loadingInterceptorFactory } from './core/interceptors/loading.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { RetryInterceptor } from './core/interceptors/retry.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // HttpClient con interceptors funcionales
    provideHttpClient(withInterceptorsFromDi()),

    // Interceptors en orden correcto:
    // 1. Retry (reintentar peticiones fallidas)
    // 2. Auth (agregar token JWT)
    // 3. Loading (mostrar loading indicator)
    // 4. Error (manejar errores)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RetryInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useValue: authInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: loadingInterceptorFactory,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },

    // Animations
    BrowserAnimationsModule,

    // Client hydration
    provideClientHydration(),
  ],
};
