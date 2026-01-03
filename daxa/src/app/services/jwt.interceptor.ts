import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(
        private authenticationService: AuthenticationService,
        private router: Router
    ) {
        console.log("JWT Interceptor initialized");
    }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const token = this.authenticationService.session;

        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Token expirado ou inválido
                    console.warn('Token expirado ou inválido. Redirecionando para login...');
                    this.authenticationService.logout();
                    this.router.navigate(['/authentication']);
                } else if (error.status === 403) {
                    // Acesso negado
                    console.warn('Acesso negado. Redirecionando para login...');
                    this.authenticationService.logout();
                    this.router.navigate(['/authentication']);
                }
                
                return throwError(() => error);
            })
        );
    }
}
