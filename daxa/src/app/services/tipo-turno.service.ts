// src/app/services/tipo-turno.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

export interface TipoTurno {
    id: number;
    descricao: string;
    cod: string;
    valorJunior: number;
    valorSenior: number;
}

@Injectable({
    providedIn: 'root',
})
export class TipoTurnoService {
    private apiUrl = `${environment.apiUrl}/tiposTurno`;

    constructor(private http: HttpClient) {}

    /** Lista todos os tipos de turno */
    getAllTipoTurnos(): Observable<TipoTurno[]> {
        return this.http.get<TipoTurno[]>(this.apiUrl);
    }

    /** Busca um tipo de turno pelo ID */
    getTipoTurnoById(id: number): Observable<TipoTurno> {
        return this.http.get<TipoTurno>(`${this.apiUrl}/${id}`);
    }

    /** Cria um novo tipo de turno */
    createTipoTurno(data: Partial<TipoTurno>): Observable<TipoTurno> {
        return this.http.post<TipoTurno>(this.apiUrl, data);
    }

    /** Atualiza um tipo de turno existente */
    updateTipoTurno(id: number, data: Partial<TipoTurno>): Observable<TipoTurno> {
        return this.http.put<TipoTurno>(`${this.apiUrl}/${id}`, data);
    }

    /** Exclui um tipo de turno */
    deleteTipoTurno(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
