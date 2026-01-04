import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {environment} from "../../environments/environment";
import { JwtDecodeService } from './jwt-decode.service';
import { AuthorizationService } from './authorization.service';

export interface LoginResponse {
    token: string;
    type: string;
    user?: {
        id: number;
        email: string;
        name: string;
    };
    message?: string;
}

export interface LoginRequest {
    email: string;
    senha: string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    public apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private router: Router,
        private jwtDecodeService: JwtDecodeService,
        private authorizationService: AuthorizationService
    ) {
        // Verificar se há token válido ao inicializar
        // Se não houver token válido, limpa o estado mas não faz logout (evita loop)
        const token = this.session;
        if (token && !this.jwtDecodeService.isTokenExpired(token)) {
            // Token válido - atualizar perfil
            this.authorizationService.updateUserProfile(token);
            const userProfile = this.jwtDecodeService.getUserProfile(token);
            const userName = this.jwtDecodeService.getUserName(token);
            const userEmail = this.jwtDecodeService.getUserEmail(token);

            const user = {
                id: userProfile?.id,
                name: userName,
                email: userEmail,
                profile: userProfile
            };

            this.currentUserSubject.next(user);
        } else {
            // Token inválido ou ausente - limpar estado sem fazer logout
            this.currentUserSubject.next(null);
            this.authorizationService.clearUserProfile();
        }
    }

    isAdmin(): boolean {
        const token = this.session;
        return this.jwtDecodeService.getUserProfile(token)?.name == "ADMINISTRATOR"
    }

    /**
     * Realiza login do usuário
     */
    login(email: string, senha: string): Observable<LoginResponse> {
        const loginData: LoginRequest = { email, senha };

        return this.http.post<LoginResponse>(`${this.apiUrl}/authentication/login`, loginData, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        }).pipe(
            tap(response => {
                if (response.token) {
                    this.saveSession(response.token);

                    // Decodificar token e atualizar perfil do usuário
                    const userProfile = this.jwtDecodeService.getUserProfile(response.token);
                    const userName = this.jwtDecodeService.getUserName(response.token);
                    const userEmail = this.jwtDecodeService.getUserEmail(response.token);

                    const user = {
                        id: userProfile?.id,
                        name: userName,
                        email: userEmail,
                        profile: userProfile
                    };

                    this.currentUserSubject.next(user);
                    this.authorizationService.updateUserProfile(response.token);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Erro desconhecido durante o login';

                if (error.status === 401) {
                    errorMessage = 'Email ou senha incorretos';
                } else if (error.status === 400) {
                    errorMessage = 'Dados de login inválidos';
                } else if (error.status === 500) {
                    errorMessage = 'Erro interno do servidor';
                } else if (error.status === 0) {
                    errorMessage = 'Servidor não está disponível';
                }

                console.error('Erro no login:', error);
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    /**
     * Verifica se o token é válido
     * IMPORTANTE: Não chama logout() aqui para evitar loops infinitos
     */
    checkTokenValidity(): boolean {
        const token = this.session;
        if (!token) {
            // Não chama logout() aqui - apenas retorna false
            // O logout deve ser chamado explicitamente quando necessário
            return false;
        }

        // Verificar se o token não expirou
        if (this.jwtDecodeService.isTokenExpired(token)) {
            console.warn('Token expirado');
            // Não chama logout() aqui - apenas retorna false
            return false;
        }

        // Atualizar perfil do usuário
        this.authorizationService.updateUserProfile(token);

        return true;
    }

    /**
     * Verifica se o usuário está autenticado
     * IMPORTANTE: Este método não chama logout() para evitar loops
     */
    isAuthenticated(): boolean {
        const token = this.session;
        if (!token) {
            return false;
        }

        // Verificar se o token não expirou sem chamar logout
        if (this.jwtDecodeService.isTokenExpired(token)) {
            return false;
        }

        return true;
    }

    /**
     * Logout do usuário
     */
    logout(): void {
        console.log('🔓 Fazendo logout do usuário...');
        this.removeSession();
        this.currentUserSubject.next(null);
        this.authorizationService.clearUserProfile();
        this.router.navigate(['/authentication']);
    }

    /**
     * Obtém o token da sessão
     */
    get session(): string {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('token') || '';
        }
        return '';
    }

    /**
     * Salva o token na sessão
     */
    saveSession(token: string): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('token', token);
        }
    }

    /**
     * Remove o token da sessão
     */
    removeSession(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('token');
        }
    }

    /**
     * Obtém o usuário atual
     */
    getCurrentUser(): any {
        return this.currentUserSubject.value;
    }

    /**
     * Obtém o perfil do usuário atual
     */
    getCurrentUserProfile(): any {
        const token = this.session;
        return token ? this.jwtDecodeService.getUserProfile(token) : null;
    }

    /**
     * Obtém o nome do usuário atual
     */
    getCurrentUserName(): string | null {
        const token = this.session;
        return token ? this.jwtDecodeService.getUserName(token) : null;
    }

    /**
     * Obtém o email do usuário atual
     */
    getCurrentUserEmail(): string | null {
        const token = this.session;
        return token ? this.jwtDecodeService.getUserEmail(token) : null;
    }
}
