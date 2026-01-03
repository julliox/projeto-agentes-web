// src/app/pages/help-desk-page/edit-page-agent/edit-page-agent.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {AgentDetails, Agente, AgentService, User} from '../../../services/agent.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { MatMenuModule } from "@angular/material/menu";


@Component({
    selector: 'app-edit-page-agent',
    standalone: true,
    imports: [
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NgIf,
        MatProgressSpinnerModule
    ],
    templateUrl: './edit-page-agent.component.html',
    styleUrls: ['./edit-page-agent.component.scss']
})

export class EditPageAgentComponent implements OnInit {
// Form
    editAgentForm: FormGroup;

    // Mensagens de Feedback
    successMessage: string = '';
    errorMessage: string = '';

    // Indicador de Carregamento
    isLoading: boolean = true;
    isSubmitting: boolean = false;

    // isToggled
    isToggled = false;

    // Agent ID
    agentId!: string;

    constructor(
        private fb: FormBuilder,
        private agentService: AgentService,
        private router: Router,
        private route: ActivatedRoute,
        public themeService: CustomizerSettingsService
    ) {
        this.editAgentForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', Validators.required],
            admissionDate: ['', Validators.required],
            desInfo: ['', Validators.required],
        });

        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.agentId = params['id'];
            this.fetchAgentData();
        });
    }

    fetchAgentData(): void {
        this.agentService.getAgentById(this.agentId).subscribe(
            (agent: Agente) => {
                const agentDetails = agent as AgentDetails;
                this.editAgentForm.patchValue({
                    name: agentDetails.name,
                    email: agentDetails.email,
                    phoneNumber: agentDetails.phoneNumber,
                    admissionDate: new Date(agentDetails.admissionDate),
                    desInfo: agentDetails.desInfo,
                });
                this.isLoading = false;
            },
            error => {
                this.errorMessage = error || 'Erro ao buscar dados do agente.';
                this.isLoading = false;
                console.error('Erro ao buscar dados do agente:', error);
            }
        );
    }

    onSubmit(): void {
        if (this.editAgentForm.valid) {
        this.isSubmitting = true;
        const formValues = this.editAgentForm.value;
        const updatedAgent: User = {
            id: this.agentId,
            name: formValues.name,
            email: formValues.email,
            phoneNumber: formValues.phoneNumber,
            admissionDate: this.formatDate(formValues.admissionDate),
            desInfo: formValues.desInfo,
            status: 'ACTIVE',
        };

        this.agentService.updateAgent(updatedAgent as unknown as Agente).subscribe(
            response => {
                this.successMessage = 'Agente atualizado com sucesso!';
                this.errorMessage = '';
                this.isSubmitting = false;
                this.router.navigate(['/help-desk']);
            },
            error => {
                if (error.status === 401) {
                    this.errorMessage = 'Não autorizado. Por favor, faça login novamente.';
                    this.successMessage = '';
                } else {
                    this.errorMessage = 'Erro ao atualizar o agente. Por favor, tente novamente mais tarde.';
                    console.error('Erro:', error);
                }
                this.isSubmitting = false;
            }
        );
    } else {
        console.log('Formulário inválido. Verifique os campos.');
    }
    }

    cancel(): void {
        this.router.navigate(['/help-desk']);
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

