import { Injectable } from '@angular/core';

export interface UserProfile {
    id: number;
    name: string;
    status: string;
}

export interface DecodedToken {
    jti: string;
    sub: string;
    aud: string;
    iat: number;
    exp: number;
    profile: UserProfile;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class JwtDecodeService {

    constructor() {}

    /**
     * Decodifica um token JWT
     */
    decodeToken(token: string): DecodedToken | null {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    }

    /**
     * Verifica se o token está expirado
     */
    isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded) return true;
        
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    }

    /**
     * Obtém o perfil do usuário do token
     */
    getUserProfile(token: string): UserProfile | null {
        const decoded = this.decodeToken(token);
        return decoded?.profile || null;
    }

    /**
     * Obtém o nome do usuário do token
     */
    getUserName(token: string): string | null {
        const decoded = this.decodeToken(token);
        return decoded?.name || null;
    }

    /**
     * Obtém o email do usuário do token
     */
    getUserEmail(token: string): string | null {
        const decoded = this.decodeToken(token);
        return decoded?.sub || null;
    }
} 