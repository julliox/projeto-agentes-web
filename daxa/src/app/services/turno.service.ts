// src/app/services/turno.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Turno {
    id?: number;
    tipoTurno: {
        id: string;
        descricao: string;
    };
    nomeAgente: string;
    dataTurno: string;
    agentId: number;
}

export interface TurnCreateDTO {
    id?: number;
    tipoTurnoId: string;
    nomeAgente: string;
    dataTurno: string[]; // ['YYYY-MM-DD', ...]
    agentId: number;
}

@Injectable({
    providedIn: 'root',
})
export class TurnoService {
    private baseUrl      = `${environment.apiUrl}/turno`;
    private tipoTurnoUrl = `${environment.apiUrl}/tiposTurno`;
    private pdfTesteUrl  = `${environment.apiUrl}/testeFolha/pdfDecisaoSemAssinatura`;

    constructor(private http: HttpClient) {}

    /** Baixa um PDF (blob) */
    gerarPdfTeste(payload: any): Observable<Blob> {
        return this.http.post(this.pdfTesteUrl, payload, {
            responseType: 'blob'
        });
    }

    /** Cria vários turnos de uma vez */
    criarTurnosEmLote(batch: TurnCreateDTO[]): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/inLote`, batch);
    }

    /** Cria um turno */
    createTurno(turno: TurnCreateDTO): Observable<any> {
        return this.http.post<any>(this.baseUrl, turno);
    }

    /** Lista todos os turnos */
    getAllTurnos(): Observable<Turno[]> {
        return this.http.get<Turno[]>(this.baseUrl);
    }

    /** Lista turnos de um agente */
    getTurnosByAgent(agentId: number): Observable<Turno[]> {
        return this.http.get<Turno[]>(`${this.baseUrl}/agente/${agentId}`);
    }

    /** Lista os tipos de turno */
    getTipoTurnos(): Observable<{ id: string; descricao: string }[]> {
        return this.http.get<{ id: string; descricao: string }[]>(this.tipoTurnoUrl);
    }
}
