import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { AuthorizationService } from '../../services/authorization.service';
import { TurnosCalendarService, AgentTurnoEvent } from '../../services/turnos-calendar.service';
import moment from 'moment';
import 'moment/locale/pt-br';

@Component({
    selector: 'app-turnos-calendar',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatProgressSpinnerModule,
        FullCalendarModule
    ],
    templateUrl: './turnos-calendar.component.html',
    styleUrls: ['./turnos-calendar.component.scss']
})
export class TurnosCalendarComponent implements OnInit {

    isLoading = false;
    currentMonth = moment();
    displayMonthText = moment().format('MMMM [de] YYYY');

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        dayMaxEvents: true,
        weekends: true,
        // headerToolbar: {
        //     left: 'prev,next today',
        //     center: 'title',
        //     right: 'dayGridMonth'
        // },
        events: [],
        eventDisplay: 'block',
        eventDidMount: (info) => {
            // Customização visual dos eventos
            this.customizeEvent(info);
        },
        datesSet: (dateInfo) => {
            // Quando o mês muda no calendário, carregar os dados
            const newMonth = moment(dateInfo.start);
            const newMonthKey = newMonth.format('YYYY-MM');
            const currentMonthKey = this.currentMonth.format('YYYY-MM');

            // Se o mês mudou, carregar os dados de forma assíncrona
            if (newMonthKey !== currentMonthKey) {
                // Usar setTimeout para evitar mudanças durante o ciclo de detecção
                // setTimeout(() => {
                //     this.loadTurnosForMonth(newMonth);
                // }, 0);
            }
        }
    };

    // Estatísticas do mês atual
    totalAgents: number = 0;
    totalTurnos: number = 0;
    agentsWithTurnos: number = 0;

    constructor(
        public themeService: CustomizerSettingsService,
        private authorizationService: AuthorizationService,
        private turnosCalendarService: TurnosCalendarService,
        private cdr: ChangeDetectorRef
    ) {
        moment.locale('pt-br');
    }

    ngOnInit(): void {
        // Verificar se é administrador
        if (!this.isAdministrator()) {
            return;
        }

        // Carregar turnos do mês atual
        // this.loadTurnosForMonth(this.currentMonth);
    }

    /**
     * Carrega os turnos para o mês especificado
     */
    // loadTurnosForMonth(month: moment.Moment): void {
    //     // Atualizar mês primeiro
    //     this.currentMonth = month.clone();
    //     this.displayMonthText = month.format('MMMM [de] YYYY');
    //
    //     // Atualizar isLoading de forma assíncrona para evitar erro
    //     setTimeout(() => {
    //         this.isLoading = true;
    //         this.cdr.markForCheck();
    //
    //         this.turnosCalendarService.getTurnosByMonth(month).subscribe({
    //             next: (events: AgentTurnoEvent[]) => {
    //                 // Converter para formato do FullCalendar
    //                 const calendarEvents: EventInput[] = events.map(event => ({
    //                     id: event.id,
    //                     title: `${event.agentName} - ${event.tipoTurno}`,
    //                     date: event.dataTurno,
    //                     backgroundColor: this.getEventColor(event.tipoTurno),
    //                     borderColor: this.getEventColor(event.tipoTurno),
    //                     textColor: '#ffffff',
    //                     extendedProps: {
    //                         agentId: event.agentId,
    //                         agentName: event.agentName,
    //                         tipoTurno: event.tipoTurno,
    //                         tipoTurnoId: event.tipoTurnoId
    //                     }
    //                 }));
    //
    //                 // Atualizar eventos do calendário (seguindo padrão do turno-page-create)
    //                 this.calendarOptions = {
    //                     ...this.calendarOptions,
    //                     events: calendarEvents
    //                 };
    //
    //                 // Atualizar estatísticas
    //                 this.updateStatistics(events);
    //                 this.isLoading = false;
    //                 this.cdr.markForCheck();
    //             },
    //             error: (error) => {
    //                 console.error('Erro ao carregar turnos:', error);
    //                 this.isLoading = false;
    //                 this.cdr.markForCheck();
    //             }
    //         });
    //     }, 0);
    // }

    /**
     * Atualiza as estatísticas do mês
     */
    private updateStatistics(events: AgentTurnoEvent[]): void {
        this.totalTurnos = events.length;

        // Contar agentes únicos
        const uniqueAgents = new Set(events.map(e => e.agentId));
        this.agentsWithTurnos = uniqueAgents.size;

        // Total de agentes (será atualizado quando integrar com backend)
        this.totalAgents = this.agentsWithTurnos;
    }

    /**
     * Retorna a cor do evento baseado no tipo de turno
     */
    private getEventColor(tipoTurno: string): string {
        const colors: { [key: string]: string } = {
            'DIURNO': '#2ed47e',      // Verde
            'NOTURNO': '#796df6',     // Roxo
            'MATUTINO': '#00cae3',    // Azul
            'VESPERTINO': '#ffb264',  // Laranja
            'MADRUGADA': '#0f79f3'    // Azul escuro
        };

        return colors[tipoTurno.toUpperCase()] || '#475569';
    }

    /**
     * Customiza a aparência dos eventos no calendário
     */
    private customizeEvent(info: any): void {
        const event = info.event;
        const extendedProps = event.extendedProps;

        // Adicionar tooltip personalizado
        info.el.setAttribute('title', `${extendedProps.agentName} - ${extendedProps.tipoTurno}`);

        // Adicionar classe CSS personalizada
        info.el.classList.add('agent-turno-event');
        info.el.classList.add(`turno-${extendedProps.tipoTurnoId}`);
    }

    /**
     * Verifica se o usuário é administrador
     */
    isAdministrator(): boolean {
        return this.authorizationService.isAdministrator();
    }

    /**
     * Formata o mês atual para exibição
     */
    getCurrentMonthFormatted(): string {
        return this.displayMonthText;
    }
}
