import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interface para resposta da contagem de agentes online
 */
export interface OnlineAgentsCountResponse {
    onlineCount: number;
    totalAgents: number;
    offlineCount: number;
    lastUpdated: string; // ISO 8601 format
}

/**
 * Interface para item do histórico de status
 */
export interface AgentStatusHistoryItem {
    id: string; // UUID
    agentId: number;
    agentName: string;
    status: 'ONLINE' | 'OFFLINE';
    statusDate: string; // ISO 8601
    timestamp: string; // ISO 8601
}

/**
 * Interface para informações de ordenação
 */
export interface SortInfo {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
}

/**
 * Interface para informações de paginação
 */
export interface PageableInfo {
    pageNumber: number;
    pageSize: number;
    sort: SortInfo;
}

/**
 * Interface para resposta paginada do histórico (padrão Spring Page)
 */
export interface AgentStatusHistoryPage {
    content: AgentStatusHistoryItem[];
    pageable: PageableInfo;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
    size: number;
    number: number;
    sort: SortInfo;
    empty: boolean;
}

/**
 * Parâmetros para buscar histórico de status
 */
export interface AgentStatusHistoryParams {
    page?: number;
    size?: number;
    status?: 'ONLINE' | 'OFFLINE';
    agentId?: number;
    startDate?: string; // ISO 8601 format
    endDate?: string; // ISO 8601 format
}

/**
 * Serviço para gerenciar dados do Dashboard
 */
@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private baseUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) {}

    /**
     * Busca a contagem de agentes online
     * GET /api/project_a/dashboard/agents/online/count
     */
    getOnlineAgentsCount(): Observable<OnlineAgentsCountResponse> {
        return this.http.get<OnlineAgentsCountResponse>(
            `${this.baseUrl}/agents/online/count`
        );
    }

    /**
     * Busca o histórico de status dos agentes com paginação e filtros
     * GET /api/project_a/dashboard/agents/status/history
     */
    getAgentStatusHistory(
        params: AgentStatusHistoryParams = {}
    ): Observable<AgentStatusHistoryPage> {
        let httpParams = new HttpParams()
            .set('page', (params.page ?? 0).toString())
            .set('size', (params.size ?? 10).toString());

        if (params.status) {
            httpParams = httpParams.set('status', params.status);
        }

        if (params.agentId !== undefined) {
            httpParams = httpParams.set('agentId', params.agentId.toString());
        }

        if (params.startDate) {
            httpParams = httpParams.set('startDate', params.startDate);
        }

        if (params.endDate) {
            httpParams = httpParams.set('endDate', params.endDate);
        }

        return this.http.get<AgentStatusHistoryPage>(
            `${this.baseUrl}/agents/status/history`,
            { params: httpParams }
        );
    }
}
