// src/app/services/agent.service.ts

import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgentProfile } from '../models/agent-profile/agent-profile.module';
import {environment} from "../../environments/environment";

export interface User {
    id?: string;
    name: string;
    email: string;
    phoneNumber: string;
    admissionDate: string;
    desInfo: string;
    status: string;
}

export interface Agente {
    id: number;
    name: string;
    email: string;
    status: string;
}

export interface AgentDetails extends Agente {
    phoneNumber: string;
    admissionDate: string;
    desInfo: string;
}

@Injectable({
    providedIn: 'root',
})
export class AgentService {
    private apiUrl = `${environment.apiUrl}/agents`;

    constructor(private http: HttpClient) {}

    /**
     * Cria um novo agente.
     */
    createAgent(user: User): Observable<any> {
        return this.http.post<any>(this.apiUrl, user);
    }

    /**
     * Consulta salários por mês.
     */
    getDadosSalarios(payload: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/salarios/mes`, payload);
    }

    /**
     * Lista todos os agentes.
     */
    getAgents(): Observable<Agente[]> {
        return this.http.get<Agente[]>(this.apiUrl);
    }

    /**
     * Retorna um agente por ID.
     */
    getAgentById(agentId: string): Observable<Agente> {
        return this.http.get<Agente>(`${this.apiUrl}/${agentId}`);
    }

    /**
     * Atualiza um agente existente.
     */
    updateAgent(agent: Agente): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${agent.id}`, agent);
    }

    /**
     * Obtém o perfil completo de um agente.
     */
    getAgentProfile(id: string): Observable<AgentProfile> {
        return this.http.get<AgentProfile>(`${this.apiUrl}/${id}/profile`);
    }
}
