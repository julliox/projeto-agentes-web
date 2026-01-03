import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AgentService, Agente } from './agent.service';
import { environment } from '../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { API_CONFIG } from './api.config';

// Interfaces baseadas nos endpoints do backend
export interface Team {
    id?: number;
    name: string;
    workStartTime: string; // formato HH:mm
    workEndTime: string;   // formato HH:mm
    agents: Agente[];
    createdAt?: Date;
    updatedAt?: Date;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateTeamRequest {
    name: string;
    workStartTime: string;
    workEndTime: string;
    agentIds: number[];
}

export interface UpdateTeamRequest {
    id: number;
    name: string;
    workStartTime: string;
    workEndTime: string;
    agentIds: number[];
    status: 'ACTIVE' | 'INACTIVE';
}

export interface TeamResponse {
    id: number;
    name: string;
    workStartTime: string;
    workEndTime: string;
    status: 'ACTIVE' | 'INACTIVE';
    agents: Agente[];
    createdAt: string;
    updatedAt: string;
    workTimeFormatted: string;
    durationHours: number;
    agentsCount: number;
}

export interface TeamListParams {
    search?: string;
    status?: string;
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

export interface TeamStatistics {
    totalTeams: number;
    activeTeams: number;
    inactiveTeams: number;
    totalAgents: number;
    averageAgentsPerTeam: number;
}

export interface Page<T> {
    content: T[];
    pageable: {
        sort: {
            sorted: boolean;
            unsorted: boolean;
        };
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    sort: {
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    
    private baseUrl = `${environment.apiUrl}/teams`;

    constructor(
        private http: HttpClient,
        private agentService: AgentService
    ) {}

    /**
     * Lista todas as equipes com paginação e filtros
     */
    getTeams(params: TeamListParams = {}): Observable<Page<TeamResponse>> {
        let httpParams = new HttpParams();
        
        if (params.search) {
            httpParams = httpParams.set('search', params.search);
        }
        if (params.status) {
            httpParams = httpParams.set('status', params.status);
        }
        if (params.page !== undefined) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.size) {
            httpParams = httpParams.set('size', params.size.toString());
        }
        if (params.sort) {
            httpParams = httpParams.set('sort', params.sort);
        }
        if (params.direction) {
            httpParams = httpParams.set('direction', params.direction);
        }

        return this.http.get<Page<TeamResponse>>(this.baseUrl, { params: httpParams });
    }

    /**
     * Obtém uma equipe por ID
     */
    getTeamById(id: number): Observable<TeamResponse | null> {
        return this.http.get<TeamResponse>(`${this.baseUrl}/${id}`);
    }

    /**
     * Cria uma nova equipe
     */
    createTeam(request: CreateTeamRequest): Observable<TeamResponse> {
        return this.http.post<TeamResponse>(this.baseUrl, request);
    }

    /**
     * Atualiza uma equipe existente
     */
    updateTeam(request: UpdateTeamRequest): Observable<TeamResponse> {
        return this.http.put<TeamResponse>(`${this.baseUrl}/${request.id}`, request);
    }

    /**
     * Remove uma equipe
     */
    deleteTeam(id: number): Observable<boolean> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
            // Converter void para boolean para manter compatibilidade
            map(() => true)
        );
    }

    /**
     * Ativa/desativa uma equipe
     */
    toggleTeamStatus(id: number): Observable<TeamResponse> {
        // Primeiro buscar a equipe atual para obter o status oposto
        return this.getTeamById(id).pipe(
            switchMap(team => {
                if (!team) {
                    throw new Error('Equipe não encontrada');
                }
                const newStatus = team.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                return this.updateTeamStatus(id, newStatus);
            })
        );
    }

    /**
     * Atualiza apenas o status de uma equipe
     */
    updateTeamStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<TeamResponse> {
        return this.http.patch<TeamResponse>(`${this.baseUrl}/${id}/status`, { status });
    }

    /**
     * Obtém estatísticas das equipes
     */
    getTeamStatistics(): Observable<TeamStatistics> {
        return this.http.get<TeamStatistics>(`${this.baseUrl}/statistics`);
    }

    /**
     * Valida se o horário de trabalho é válido
     */
    validateWorkTime(startTime: string, endTime: string): boolean {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        
        if (!start || !end) return false;
        
        // Se o horário termina no dia seguinte (ex: 18:00 - 06:00)
        if (end < start) {
            return true; // Horário noturno é válido
        }
        
        // Horário normal (mesmo dia)
        return end > start;
    }

    /**
     * Converte string de tempo para minutos desde meia-noite
     */
    private parseTime(timeString: string): number | null {
        const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) return null;
        
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }
        
        return hours * 60 + minutes;
    }

    /**
     * Formata horário para exibição
     */
    formatWorkTime(startTime: string, endTime: string): string {
        return `${startTime} - ${endTime}`;
    }

    /**
     * Calcula duração do turno em horas
     */
    calculateShiftDuration(startTime: string, endTime: string): number {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        
        if (!start || !end) return 0;
        
        let duration = end - start;
        
        // Se o horário termina no dia seguinte
        if (duration < 0) {
            duration += 24 * 60; // Adiciona 24 horas
        }
        
        return Math.round(duration / 60 * 10) / 10; // Arredonda para 1 casa decimal
    }

    /**
     * Converte TeamResponse para Team (para compatibilidade)
     */
    convertToTeam(response: TeamResponse): Team {
        return {
            id: response.id,
            name: response.name,
            workStartTime: response.workStartTime,
            workEndTime: response.workEndTime,
            agents: response.agents,
            status: response.status,
            createdAt: new Date(response.createdAt),
            updatedAt: new Date(response.updatedAt)
        };
    }

    /**
     * Converte array de TeamResponse para Team[]
     */
    convertToTeams(responses: TeamResponse[]): Team[] {
        return responses.map(response => this.convertToTeam(response));
    }
}
