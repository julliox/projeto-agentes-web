// src/app/components/turno-page-create/turno-page-create.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';
import { RouterLink } from '@angular/router';
import { AgentService, Agente } from '../../services/agent.service';
import {Turno, TurnoService} from '../../services/turno.service';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TurnCreateDTO } from '../../services/turno.service';
import {MatIcon} from "@angular/material/icon";
import moment from "moment";
import 'moment/locale/pt-br';
import { FullCalendarModule } from '@fullcalendar/angular'; // import the FullCalendar module
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {CalendarOptions} from "@fullcalendar/core";
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { NotificationBarService } from '../../services/notification-bar.service';


// Defina os formatos de data personalizados
export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

// Interface removida pois o serviço retorna { id: string; descricao: string }[]

@Component({
    selector: 'app-turno-page-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatInputModule,
        MatButtonModule,
        MatNativeDateModule,
        RouterLink,
        MatIcon,
        MatMomentDateModule,
        FullCalendarModule,

    ],
    templateUrl: './turno-page-create.component.html',
    styleUrls: ['./turno-page-create.component.scss'],
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: []
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ],
})
export class TurnoPageCreateComponent implements OnInit {

    turnoForm: FormGroup;
    agentes$: Observable<Agente[]>;
    isLoading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    // dates: string[] = []; // Removido pois não estava sendo usado corretamente
    tiposTurnos: { id: string; descricao: string }[] = [];
    calendarEvents: any[] = [];
    selectedAgentId: number | null = null;

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: []
    };

    turnoTypes: string[] = ['DIURNO', 'NOTURNO'];

    constructor(
        private fb: FormBuilder,
        private agentService: AgentService,
        private turnoService: TurnoService,
        public themeService: CustomizerSettingsService,
        private notificationService: NotificationBarService
    ) {
        this.turnoForm = this.fb.group({
            typeTurn: ['', Validators.required],
            agentId: ['', Validators.required],
            dataTurno: this.fb.array([
                this.fb.group({
                    data: ['', Validators.required]
                })
            ])
        });

        this.agentes$ = this.agentService.getAgents();
    }

    ngOnInit(): void {
        this.getTiposTurno();
        this.turnoForm.get('agentId')?.valueChanges.subscribe(agentId => {
            this.selectedAgentId = agentId;
            if (agentId) {
                this.fetchAgentTurnos(agentId);
            } else {
                this.calendarEvents = [];
            }
        });
    }
    /**
     * Busca os turnos do agente selecionado e atualiza o calendário.
     * @param agentId ID do agente selecionado.
     */
    private fetchAgentTurnos(agentId: number): void {
        this.turnoService.getTurnosByAgent(agentId).subscribe({
            next: (turnos: Turno[]) => {
                const events = turnos.map(turno => ({
                    title: turno.tipoTurno.descricao,
                    date: turno.dataTurno
                }));
                this.calendarOptions = {
                    ...this.calendarOptions,
                    events: events
                };
            },
            error: (error) => {
                console.error('Erro ao buscar turnos do agente:', error);
            }
        });
    }


    /**
     * Retorna o FormArray de datas do turno.
     */
    get dataTurno(): FormArray {
        return this.turnoForm.get('dataTurno') as FormArray;
    }

    /**
     * Adiciona um novo campo de data no FormArray.
     */
    addDataTurno(): void {
        this.dataTurno.push(this.fb.group({
            data: ['', Validators.required]
        }));
    }

    /**
     * Remove um campo de data específico do FormArray.
     * @param index Índice do campo a ser removido.
     */
    removeDataTurno(index: number): void {
        if (this.dataTurno.length > 1) {
            this.dataTurno.removeAt(index);
        }
    }

    /**
     * Envia o formulário para criar novos turnos.
     */
    onSubmit(): void {
        if (this.turnoForm.invalid) {
            this.markAllControlsAsTouched(this.turnoForm);
            this.notificationService.showError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Coletar as datas selecionadas como objetos Date
        const selectedDates: Date[] = this.dataTurno.controls
            .map(control => control.get('data')?.value)
            .filter((date): date is Date => date != null);

        if (selectedDates.length === 0) {
            this.notificationService.showError('Por favor, selecione pelo menos uma data.');
            return;
        }

        const turnoDTO: TurnCreateDTO = {
            tipoTurnoId: this.turnoForm.value.typeTurn,
            nomeAgente: '', // Pode ser preenchido se necessário
            dataTurno: selectedDates.map(date => moment(date).format('YYYY-MM-DD')), // Formato esperado pelo backend
            agentId: this.turnoForm.value.agentId
        };

        this.turnoService.createTurno(turnoDTO).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.notificationService.showSuccess('Turnos criados com sucesso!');

                // Resetar o formulário
                this.turnoForm.reset();

                // Resetar o FormArray para ter apenas um campo de data
                const dataTurnoArray = this.turnoForm.get('dataTurno') as FormArray;
                while (dataTurnoArray.length > 1) {
                    dataTurnoArray.removeAt(0);
                }
                dataTurnoArray.at(0).reset();

                // Marcar o formulário como pristine e untouched
                this.markGroupPristine(this.turnoForm);
                this.turnoForm.get("agentId")?.setValue(turnoDTO.agentId);
                this.selectedAgentId = turnoDTO.agentId;
                // Atualizar o calendário com os novos turnos
                if (this.selectedAgentId) {
                    this.fetchAgentTurnos(this.selectedAgentId);
                }
            },
            error: (error: HttpErrorResponse) => {
                this.isLoading = false;
                if (error.status === 409) {
                    // Trata o erro específico de turno duplicado
                    this.notificationService.showError(error.error?.message || 'O agente já possui turno em uma das datas selecionadas!');
                } else if (error.status === 401 || error.status === 403) {
                    this.notificationService.showError('Não autorizado. Por favor, faça login novamente.');
                } else {
                    this.notificationService.showError(error.error?.message || 'Erro ao criar turnos.');
                }
                console.error('Erro ao criar turnos:', error);
            }
        });
    }

    /**
     * Função auxiliar para marcar todos os controles de um grupo como tocados.
     * Isso ajuda a exibir os erros de validação.
     * @param group FormGroup ou FormArray
     */
    private markAllControlsAsTouched(group: FormGroup | FormArray): void {
        Object.keys(group.controls).forEach(key => {
            const control = group.get(key);
            if (control instanceof FormGroup || control instanceof FormArray) {
                this.markAllControlsAsTouched(control);
            } else {
                control?.markAsTouched();
            }
        });
    }

    /**
     * Função auxiliar para marcar todos os controles de um grupo como pristine e untouched.
     * @param group FormGroup ou FormArray
     */
    private markGroupPristine(group: FormGroup | FormArray): void {
        group.markAsPristine();
        group.markAsUntouched();
        if (group instanceof FormGroup) {
            Object.keys(group.controls).forEach(key => {
                const control = group.get(key);
                if (control instanceof FormGroup || control instanceof FormArray) {
                    this.markGroupPristine(control);
                } else {
                    control?.markAsPristine();
                    control?.markAsUntouched();
                }
            });
        } else if (group instanceof FormArray) {
            group.controls.forEach(control => {
                if (control instanceof FormGroup || control instanceof FormArray) {
                    this.markGroupPristine(control);
                } else {
                    control.markAsPristine();
                    control.markAsUntouched();
                }
            });
        }
    }

    /**
     * Formata a data para o formato "DD/MM/YYYY" para exibição (opcional, se necessário).
     * @param date Data selecionada.
     * @returns String formatada.
     */
    private formatDate(date: Date): string {
        return moment(date).format('DD/MM/YYYY');
    }

    /**
     * Adiciona um zero à esquerda se o número for menor que 10.
     * @param num Número a ser formatado.
     * @returns String com zero à esquerda se necessário.
     */
    private padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

    private getTiposTurno(): void {
        this.turnoService.getTipoTurnos().subscribe({
            next: (response) => {
                this.tiposTurnos = response;
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = 'Erro ao buscar tipos de turno.';
                this.isLoading = false;
                console.error('Erro ao buscar tipos de turno:', err);
            }
        });
    }

}
