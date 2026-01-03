import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AlertService } from '../../services/alert.service';

@Component({
    selector: 'app-login-test',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCardModule],
    templateUrl: './login-test.component.html',
    styleUrls: ['./login-test.component.scss']
})
export class LoginTestComponent {

    constructor(private alertService: AlertService) {}

    /**
     * Simula diferentes cenários de login
     */
    testSuccessfulLogin(): void {
        this.alertService.showSuccess('Login realizado com sucesso! Bem-vindo de volta!');
    }

    testInvalidCredentials(): void {
        this.alertService.showError('Email ou senha incorretos. Verifique suas credenciais.');
    }

    testAccountDisabled(): void {
        this.alertService.showError('Acesso negado. Sua conta pode estar desativada.');
    }

    testUserNotFound(): void {
        this.alertService.showError('Usuário não encontrado. Verifique seu email.');
    }

    testServerError(): void {
        this.alertService.showError('Erro interno do servidor. Tente novamente mais tarde.');
    }

    testConnectionError(): void {
        this.alertService.showError('Erro de conexão. Verifique sua internet e tente novamente.');
    }

    testValidationError(): void {
        this.alertService.showWarning('Por favor, preencha todos os campos corretamente.');
    }

    testSessionExpired(): void {
        this.alertService.showWarning('Sua sessão expirou. Por favor, faça login novamente.');
    }

    testMaintenanceMode(): void {
        this.alertService.showInfo('Sistema em manutenção. Tente novamente em alguns minutos.');
    }

    testPasswordReset(): void {
        this.alertService.showSuccess('Email de redefinição de senha enviado com sucesso!');
    }

    testAccountCreated(): void {
        this.alertService.showSuccess('Conta criada com sucesso! Você pode fazer login agora.');
    }

    /**
     * Simula um fluxo completo de login com diferentes cenários
     */
    simulateLoginFlow(): void {
        // Simula tentativa de login
        this.alertService.showInfo('Tentando fazer login...');
        
        setTimeout(() => {
            // Simula erro de credenciais
            this.alertService.showError('Email ou senha incorretos. Verifique suas credenciais.');
        }, 2000);
        
        setTimeout(() => {
            // Simula nova tentativa
            this.alertService.showInfo('Tentando novamente...');
        }, 4000);
        
        setTimeout(() => {
            // Simula sucesso
            this.alertService.showSuccess('Login realizado com sucesso! Bem-vindo de volta!');
        }, 6000);
    }
} 