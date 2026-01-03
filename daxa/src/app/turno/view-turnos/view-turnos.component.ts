// src/app/components/view-turnos/view-turnos.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { TurnoService, Turno } from '../../services/turno.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import {Agente, AgentService} from "../../services/agent.service";

@Component({
    selector: 'app-view-turnos',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatProgressBarModule,
        FullCalendarModule
    ],
    templateUrl: './view-turnos.component.html',
    styleUrls: ['./view-turnos.component.scss']
})
export class ViewTurnosComponent implements OnInit {

    isLoading: boolean = true;
    errorMessage: string = '';
    agentId!: number;
    agent: Agente | undefined;

    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        dayMaxEvents: true,
        weekends: true,
        events: [],
        plugins: [dayGridPlugin],
        height: 800 // Defina a altura desejada em pixels
    };

    constructor(
        private route: ActivatedRoute,
        private turnoService: TurnoService,
        private agentService: AgentService,
        public themeService: CustomizerSettingsService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            this.agentId = +params['id'];
            const token = localStorage.getItem('token');
            if (token) {
                this.fetchTurnos();
                this.fetchAgentData();
            } else {
                // Aguarde até que o token esteja disponível ou redirecione para a tela de login
                console.error('Token não disponível no ngOnInit');
            }
        });
    }

    fetchTurnos(): void {
        this.isLoading = true;
        this.turnoService.getTurnosByAgent(this.agentId).subscribe({
            next: (data) => {
                const events = data.map(turno => ({
                    title: turno.tipoTurno.descricao,
                    date: turno.dataTurno
                }));
                this.calendarOptions = {
                    ...this.calendarOptions,
                    events: events
                };
                this.isLoading = false;
            },
            error: err => {
                this.errorMessage = err.message || 'Erro ao buscar turnos.';
                this.isLoading = false;
                console.error('Erro ao buscar turnos:', err);
            }
        });
    }
    fetchAgentData(): void {
        this.agentService.getAgentById((this.agentId).toString()).subscribe(
            (agent: Agente) => {
                this.agent = agent
            },
            (error: any) => {
                this.errorMessage = error.message || 'Erro ao buscar dados do agente.';
                this.isLoading = false;
                console.error('Erro ao buscar dados do agente:', error);
            }
        );
    }
}
