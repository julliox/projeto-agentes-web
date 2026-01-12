import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";
import { TipoAdicao } from './tipo-adicao.service';
import { Agente } from './agent.service';

export interface TipoAdicaoDTO {
    id: number;
    desTipoAdicao: string;
}

export interface AdicaoSalario {
    id: number;
    tipoAdicao: TipoAdicaoDTO;
    qtyAdicao: number;
    mesAdicao: string; // Formato: "YYYY-MM"
    agenteId: number;
    nomeAgente: string;
}

export interface AdicaoSalarioCreateDTO {
    tipoAdicaoId: number;
    qtyAdicao: number;
    mesAdicao: string; // Formato: "YYYY-MM"
    agentId: number;
}

export interface AdicaoSalarioUpdateDTO {
    tipoAdicaoId?: number;
    qtyAdicao?: number;
    mesAdicao?: string; // Formato: "YYYY-MM"
}

@Injectable({
    providedIn: 'root',
})
export class AdicaoSalarioService {
    private apiUrl = `${environment.apiUrl}/add-salario`;

    constructor(private http: HttpClient) {}

    /** Lista todas as adições de salário */
    getAll(): Observable<AdicaoSalario[]> {
        return this.http.get<AdicaoSalario[]>(this.apiUrl);
    }

    /** Busca uma adição de salário pelo ID */
    getById(id: number): Observable<AdicaoSalario> {
        return this.http.get<AdicaoSalario>(`${this.apiUrl}/${id}`);
    }

    /** Lista adições de salário por colaborador */
    getByEmployeeId(employeeId: number): Observable<AdicaoSalario[]> {
        return this.http.get<AdicaoSalario[]>(`${this.apiUrl}/employee/${employeeId}`);
    }

    /** Cria uma nova adição de salário */
    create(data: AdicaoSalarioCreateDTO): Observable<AdicaoSalario> {
        return this.http.post<AdicaoSalario>(this.apiUrl, data);
    }

    /** Atualiza uma adição de salário existente */
    update(id: number, data: AdicaoSalarioUpdateDTO): Observable<AdicaoSalario> {
        return this.http.put<AdicaoSalario>(`${this.apiUrl}/${id}`, data);
    }

    /** Exclui uma adição de salário */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
