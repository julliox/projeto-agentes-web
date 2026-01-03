import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import moment, { Moment } from 'moment';
import { AgentService, Agente } from './agent.service';

export interface AgentTurnoEvent {
    id: string;
    agentId: number;
    agentName: string;
    dataTurno: string; // formato YYYY-MM-DD
    tipoTurno: string;
    tipoTurnoId: string;
}

@Injectable({
    providedIn: 'root'
})
export class TurnosCalendarService {
    
    // Dados mockados para desenvolvimento
    private mockTurnos: AgentTurnoEvent[] = [];

    constructor(private agentService: AgentService) {
        this.initializeMockData();
    }

    /**
     * Inicializa dados mockados para o mês atual e próximo
     */
    private initializeMockData(): void {
        const today = moment();
        const currentMonth = today.month();
        const currentYear = today.year();
        
        // Agentes mockados
        const agents = [
            { id: 1, name: 'João Silva', email: 'joao@email.com' },
            { id: 2, name: 'Maria Santos', email: 'maria@email.com' },
            { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com' },
            { id: 4, name: 'Ana Costa', email: 'ana@email.com' },
            { id: 5, name: 'Carlos Souza', email: 'carlos@email.com' }
        ];

        // Tipos de turno
        const tiposTurno = [
            { id: '1', descricao: 'DIURNO' },
            { id: '2', descricao: 'NOTURNO' },
            { id: '3', descricao: 'MATUTINO' },
            { id: '4', descricao: 'VESPERTINO' }
        ];

        // Gerar turnos para os próximos 60 dias
        for (let day = 0; day < 60; day++) {
            const date = moment().add(day, 'days');
            
            // Cada dia, alguns agentes têm turno
            agents.forEach((agent, agentIndex) => {
                // Simular que nem todos os agentes trabalham todos os dias
                if (Math.random() > 0.3) { // 70% de chance de ter turno
                    const tipoIndex = Math.floor(Math.random() * tiposTurno.length);
                    const tipo = tiposTurno[tipoIndex];
                    
                    this.mockTurnos.push({
                        id: `turno-${agent.id}-${date.format('YYYY-MM-DD')}`,
                        agentId: agent.id,
                        agentName: agent.name,
                        dataTurno: date.format('YYYY-MM-DD'),
                        tipoTurno: tipo.descricao,
                        tipoTurnoId: tipo.id
                    });
                }
            });
        }
    }

    /**
     * Obtém todos os turnos de um mês específico
     */
    getTurnosByMonth(month: Moment): Observable<AgentTurnoEvent[]> {
        const startOfMonth = month.clone().startOf('month');
        const endOfMonth = month.clone().endOf('month');
        
        const turnosDoMes = this.mockTurnos.filter(turno => {
            const turnoDate = moment(turno.dataTurno);
            return turnoDate.isSameOrAfter(startOfMonth) && turnoDate.isSameOrBefore(endOfMonth);
        });

        // Simular delay de rede
        return of(turnosDoMes).pipe(delay(300));
    }

    /**
     * Obtém turnos de um agente específico em um mês
     */
    getTurnosByAgentAndMonth(agentId: number, month: Moment): Observable<AgentTurnoEvent[]> {
        const startOfMonth = month.clone().startOf('month');
        const endOfMonth = month.clone().endOf('month');
        
        const turnos = this.mockTurnos.filter(turno => {
            const turnoDate = moment(turno.dataTurno);
            return turno.agentId === agentId &&
                   turnoDate.isSameOrAfter(startOfMonth) &&
                   turnoDate.isSameOrBefore(endOfMonth);
        });

        return of(turnos).pipe(delay(200));
    }

    /**
     * Obtém todos os turnos de uma data específica
     */
    getTurnosByDate(date: string): Observable<AgentTurnoEvent[]> {
        const turnos = this.mockTurnos.filter(turno => turno.dataTurno === date);
        return of(turnos).pipe(delay(100));
    }

    /**
     * Obtém estatísticas do mês
     */
    getMonthStatistics(month: Moment): Observable<{
        totalTurnos: number;
        totalAgents: number;
        agentsWithTurnos: number;
        turnosByType: { [key: string]: number };
    }> {
        const startOfMonth = month.clone().startOf('month');
        const endOfMonth = month.clone().endOf('month');
        
        const turnosDoMes = this.mockTurnos.filter(turno => {
            const turnoDate = moment(turno.dataTurno);
            return turnoDate.isSameOrAfter(startOfMonth) && turnoDate.isSameOrBefore(endOfMonth);
        });

        const uniqueAgents = new Set(turnosDoMes.map(t => t.agentId));
        const turnosByType: { [key: string]: number } = {};

        turnosDoMes.forEach(turno => {
            turnosByType[turno.tipoTurno] = (turnosByType[turno.tipoTurno] || 0) + 1;
        });

        return of({
            totalTurnos: turnosDoMes.length,
            totalAgents: uniqueAgents.size,
            agentsWithTurnos: uniqueAgents.size,
            turnosByType
        }).pipe(delay(200));
    }
}

