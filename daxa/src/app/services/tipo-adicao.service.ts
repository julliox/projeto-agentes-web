import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";

export interface TipoAdicao {
    id: number;
    desTipoAdicao: string;
}

export interface TipoAdicaoCreateDTO {
    id?: number | null;
    desTipoAdicao: string;
}

@Injectable({
    providedIn: 'root',
})
export class TipoAdicaoService {
    private apiUrl = `${environment.apiUrl}/tipo-adicao`;

    constructor(private http: HttpClient) {}

    /** Lista todos os tipos de adição */
    getAll(): Observable<TipoAdicao[]> {
        return this.http.get<TipoAdicao[]>(this.apiUrl);
    }

    /** Busca um tipo de adição pelo ID */
    getById(id: number): Observable<TipoAdicao> {
        return this.http.get<TipoAdicao>(`${this.apiUrl}/${id}`);
    }

    /** Cria um novo tipo de adição */
    create(data: TipoAdicaoCreateDTO): Observable<TipoAdicao> {
        return this.http.post<TipoAdicao>(this.apiUrl, data);
    }

    /** Atualiza um tipo de adição existente */
    update(id: number, data: TipoAdicaoCreateDTO): Observable<TipoAdicao> {
        return this.http.put<TipoAdicao>(`${this.apiUrl}/${id}`, data);
    }

    /** Exclui um tipo de adição */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
