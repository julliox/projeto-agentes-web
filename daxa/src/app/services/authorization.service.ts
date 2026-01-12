import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtDecodeService, UserProfile } from './jwt-decode.service';

export interface MenuPermission {
    route: string;
    allowedProfiles: string[];
    icon?: string;
    label?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthorizationService {
    private currentUserProfileSubject = new BehaviorSubject<UserProfile | null>(null);
    public currentUserProfile$ = this.currentUserProfileSubject.asObservable();

    private menuPermissions: MenuPermission[] = [
        // Dashboard
        { route: '/', allowedProfiles: ['ADMINISTRATOR'] },

        // Turnos (sistema específico)
        { route: '/turno/create', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/turno/view', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/view-turnos/', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/turnos-calendar', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/help-desk-page/tipo-turno', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/help-desk-page/tipo-adicao', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/help-desk-page/adicao-salario', allowedProfiles: ['ADMINISTRATOR'] },

        // Agentes
        { route: '/help-desk-page/agents', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/help-desk-page/add-agent', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/help-desk-page/edit-agent/', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/help-desk-page/agent-profile/', allowedProfiles: ['ADMINISTRATOR'] },
        { route: '/help-desk-page/turno-tabela/', allowedProfiles: ['ADMINISTRATOR'] },

        // Equipes
        { route: '/teams', allowedProfiles: ['ADMINISTRATOR'] },

        // Profile
        { route: '/my-profile', allowedProfiles: ['ADMINISTRATOR'] },

        // Ponto (AGENT)
        { route: '/ponto', allowedProfiles: ['AGENT', 'ADMINISTRATOR'] },
    ];

    constructor(
        private jwtDecodeService: JwtDecodeService
    ) {
        this.initializeUserProfile();
    }

    /**
     * Obtém o token da sessão
     */
    private getSession(): string {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('token') || '';
        }
        return '';
    }

    /**
     * Inicializa o perfil do usuário baseado no token atual
     */
    private initializeUserProfile(): void {
        const token = this.getSession();
        if (token) {
            const profile = this.jwtDecodeService.getUserProfile(token);
            this.currentUserProfileSubject.next(profile);
        }
    }

    /**
     * Atualiza o perfil do usuário quando o token muda
     */
    updateUserProfile(token: string): void {
        const profile = this.jwtDecodeService.getUserProfile(token);
        this.currentUserProfileSubject.next(profile);
    }

    /**
     * Verifica se o usuário tem permissão para acessar uma rota
     */
    canAccessRoute(route: string): boolean {
        const currentProfile = this.currentUserProfileSubject.value;
        if (!currentProfile) return false;

        // Verificar rota exata primeiro
        let permission = this.menuPermissions.find(p => p.route === route);
        
        // Se não encontrar, verificar se a rota começa com algum padrão permitido
        if (!permission) {
            permission = this.menuPermissions.find(p => {
                // Para rotas com parâmetros, verificar se a rota atual começa com o padrão
                if (p.route.endsWith('/')) {
                    return route.startsWith(p.route);
                }
                return false;
            });
        }

        if (!permission) return false;

        return permission.allowedProfiles.includes(currentProfile.name);
    }

    /**
     * Verifica se um perfil específico pode acessar uma rota
     */
    canAccessRouteByProfile(route: string, profileName: string): boolean {
        const permission = this.menuPermissions.find(p => p.route === route);
        if (!permission) return false;

        return permission.allowedProfiles.includes(profileName);
    }

    /**
     * Retorna todas as rotas que o usuário atual pode acessar
     */
    getAccessibleRoutes(): string[] {
        const currentProfile = this.currentUserProfileSubject.value;
        if (!currentProfile) return [];

        return this.menuPermissions
            .filter(p => p.allowedProfiles.includes(currentProfile.name))
            .map(p => p.route);
    }

    /**
     * Obtém o perfil do usuário atual
     */
    getCurrentUserProfile(): UserProfile | null {
        const token = this.getSession();
        if (token) {
            return this.jwtDecodeService.getUserProfile(token);
        }
        return null;
    }

    /**
     * Verifica se o usuário atual é administrador
     */
    isAdministrator(): boolean {
        const profile = this.getCurrentUserProfile();
        return profile?.name === 'ADMINISTRATOR';
    }

    /**
     * Obtém o nome do usuário atual
     */
    getCurrentUserName(): string | null {
        const token = this.getSession();
        if (token) {
            return this.jwtDecodeService.getUserName(token);
        }
        return null;
    }

    /**
     * Obtém o email do usuário atual
     */
    getCurrentUserEmail(): string | null {
        const token = this.getSession();
        if (token) {
            return this.jwtDecodeService.getUserEmail(token);
        }
        return null;
    }

    /**
     * Limpa o perfil do usuário (usado no logout)
     */
    clearUserProfile(): void {
        this.currentUserProfileSubject.next(null);
    }
}
