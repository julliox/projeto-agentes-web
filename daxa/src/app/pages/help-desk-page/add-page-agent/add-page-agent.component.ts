// src/app/pages/help-desk-page/add-page-agent/add-page-agent.component.ts
import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { AgentService, User } from '../../../services/agent.service'; // Importe o UserService e a interface User
import { Router } from '@angular/router';
import {MatMenuModule} from "@angular/material/menu";

@Component({
  selector: 'app-add-page-agent',
  standalone: true,
    imports: [
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        RouterLink,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule,
        FileUploadModule,
        MatRadioModule,
        MatCheckboxModule,
        NgIf,
        MatProgressSpinnerModule // Adicione aqui
    ],
  templateUrl: './add-page-agent.component.html',
  styleUrl: './add-page-agent.component.scss'
})
export class AddPageAgentComponent {
    // Form
    userForm: FormGroup;

    // Mensagens de Feedback
    successMessage: string = '';
    errorMessage: string = '';

    // Indicador de Carregamento
    isLoading: boolean = false;

    // File Uploader
    public multiple: boolean = false;

    // isToggled
    isToggled = false;

    constructor(
        private fb: FormBuilder,
        private userService: AgentService, // Injete o UserService
        private router: Router,
        public themeService: CustomizerSettingsService
    ) {
        this.userForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', Validators.required],
            desInfo: ['', Validators.required],
            admissionDate: ['', Validators.required],
            // status é definido programaticamente como "ACTIVE"
        });

        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    onSubmit(): void {
        if (this.userForm.valid) {
            this.isLoading = true; // Inicia o carregamento
            const formValues = this.userForm.value;
            const user: User = {
                name: formValues.name,
                email: formValues.email,
                phoneNumber: formValues.phoneNumber,
                admissionDate: this.formatDate(formValues.admissionDate), // Adicionado
                desInfo: formValues.desInfo,
                status: 'ACTIVE' // Definido programaticamente
            };

            this.userService.createAgent(user).subscribe(
                response => {
                    this.successMessage = 'Usuário criado com sucesso!';
                    this.errorMessage = '';
                    this.userForm.reset();
                    this.isLoading = false;
                    this.router.navigate(['/help-desk']);
                },
                error => {
                    if (error.status === 401) {
                        this.errorMessage = 'Não autorizado. Por favor, faça login novamente.';
                        this.successMessage = '';
                    } else {
                        this.errorMessage = 'Erro ao criar o usuário. Por favor, tente novamente mais tarde.';
                        console.error('Erro:', error);
                    }
                    this.isLoading = false; // Finaliza o carregamento
                }
            );
        } else {
            console.log('Formulário inválido. Verifique os campos.');
        }
    }


    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = this.padZero(date.getMonth() + 1);
        const day = this.padZero(date.getDate());
        return `${year}-${month}-${day}`;
    }

    private padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }
}
