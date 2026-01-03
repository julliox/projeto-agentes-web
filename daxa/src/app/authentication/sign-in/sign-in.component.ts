// src/app/sign-in/sign-in.component.ts
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { AuthenticationService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { AuthorizationService } from '../../services/authorization.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [
        RouterLink,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        NgIf
    ],
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

    // isToggled
    isToggled = false;

    // Password Hide
    hide = true;

    // Form
    authForm: FormGroup;

    // Loading state
    isLoading = false;

    // Mensagem de Erro
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        public themeService: CustomizerSettingsService,
        private authService: AuthenticationService,
        private alertService: AlertService,
        private authorizationService: AuthorizationService
    ) {
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });

        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    onSubmit(): void {
        if (this.authForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';

            const { email, password } = this.authForm.value;

            this.authService.login(email, password)
                .pipe(
                    finalize(() => {
                        this.isLoading = false;
                    })
                )
                .subscribe({
                    next: (response) => {
                        console.log('Login realizado com sucesso:', response);

                        // Mostra alert de sucesso
                        this.alertService.showSuccess('Login realizado com sucesso!');

                        // Redireciona por perfil
                        const profile = this.authorizationService.getCurrentUserProfile();
                        const target = profile?.name === 'AGENT' ? '/ponto' : '/';
                        setTimeout(() => {
                            this.router.navigate([target]);
                        }, 600);
                    },
                    error: (error) => {
                        console.error('Erro no login:', error);

                        // Determina o tipo de erro e mostra a mensagem apropriada
                        let errorMessage = 'Erro ao realizar login';

                        if (error.status === 401) {
                            errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
                        } else if (error.status === 403) {
                            errorMessage = 'Acesso negado. Sua conta pode estar desativada.';
                        } else if (error.status === 404) {
                            errorMessage = 'Usuário não encontrado. Verifique seu email.';
                        } else if (error.status === 500) {
                            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
                        } else if (error.status === 0) {
                            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                        } else if (error.message) {
                            errorMessage = error.message;
                        }

                        this.errorMessage = errorMessage;
                        this.alertService.showError(errorMessage);
                    }
                });
        } else {
            this.markFormGroupTouched();
            const errorMessage = 'Por favor, preencha todos os campos corretamente.';
            this.errorMessage = errorMessage;
            this.alertService.showWarning(errorMessage);
        }
    }

    /**
     * Marca todos os campos do formulário como tocados
     * para exibir os erros de validação
     */
    private markFormGroupTouched(): void {
        Object.keys(this.authForm.controls).forEach(key => {
            const control = this.authForm.get(key);
            control?.markAsTouched();
        });
    }

    /**
     * Limpa a mensagem de erro quando o usuário começa a digitar
     */
    onInputChange(): void {
        if (this.errorMessage) {
            this.errorMessage = '';
        }
    }
}
