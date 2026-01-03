import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../services/authorization.service';
import { AuthenticationService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {

    constructor(
        private authorizationService: AuthorizationService,
        private authService: AuthenticationService,
        private router: Router
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        
        // Verificar se está autenticado
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/authentication']);
            return false;
        }

        // Verificar se tem permissão para a rota
        const currentRoute = state.url;
        if (!this.authorizationService.canAccessRoute(currentRoute)) {
            console.warn(`Acesso negado para a rota: ${currentRoute}`);
            
            // Redirecionar para uma página de acesso negado ou dashboard
            this.router.navigate(['/']);
            return false;
        }

        return true;
    }
} 