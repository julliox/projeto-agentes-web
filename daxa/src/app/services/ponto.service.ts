import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type PunchType = 'ENTRADA' | 'SAIDA';

export interface LocationDTO { lat?: number; lng?: number; }

export interface PunchRequest {
  action: PunchType;
  clientTimestamp?: string;
  clientTimezone?: string;
  agentId?: number; // ADMIN somente
  source?: string;
  deviceId?: string;
  location?: LocationDTO;
  notes?: string;
}

export interface SessionDTO {
  entryId: string;
  entryTimestamp: string; // ISO UTC
  durationSeconds: number;
}

export interface PunchResponse {
  id: string;
  agentId: number;
  type: PunchType;
  timestampServer: string; // ISO UTC
  timestampEffective: string; // ISO UTC
  status: 'RECORDED';
  isClockedIn: boolean;
  session?: SessionDTO;
  serverTime: string; // ISO UTC
}

export interface PunchItemDTO {
  id: string;
  type: PunchType;
  timestamp: string; // ISO UTC
  source?: string;
  notes?: string | null;
}

export interface StateResponse {
  agentId: number;
  // Alguns back-ends retornam "clockedIn" em vez de "isClockedIn"
  clockedIn?: boolean;
  isClockedIn?: boolean;
  lastPunch?: PunchItemDTO;
  activeSession?: SessionDTO;
  serverTime: string; // ISO UTC
}

export interface HistoryResponse {
  items: PunchItemDTO[];
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
}

export interface LastStatusResponse {
  agentId: number;
  lastType: PunchType | null;
  serverTime: string;
}

@Injectable({ providedIn: 'root' })
export class PontoService {
  private readonly baseUrl = `${environment.apiUrl}/ponto`;

  constructor(private http: HttpClient) {}

  punch(request: PunchRequest, idempotencyKey?: string): Observable<PunchResponse> {
    const headers: HttpHeaders = new HttpHeaders(
      idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    );
    return this.http.post<PunchResponse>(`${this.baseUrl}/punch`, request, { headers });
  }

  getState(agentId?: number): Observable<StateResponse> {
    let params = new HttpParams();
    if (typeof agentId === 'number') {
      params = params.set('agentId', String(agentId));
    }
    return this.http.get<StateResponse>(`${this.baseUrl}/state`, { params });
  }

  getHistory(options?: {
    agentId?: number;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
    sort?: string; // ex.: timestampServer,desc
  }): Observable<HistoryResponse> {
    let params = new HttpParams();
    if (options) {
      const { agentId, from, to, page, size, sort } = options;
      if (typeof agentId === 'number') params = params.set('agentId', String(agentId));
      if (from) params = params.set('from', from);
      if (to) params = params.set('to', to);
      params = params.set('page', String(page ?? 0));
      params = params.set('size', String(size ?? 20));
      params = params.set('sort', sort ?? 'timestampServer,desc');
    }
    return this.http.get<HistoryResponse>(`${this.baseUrl}/history`, { params });
  }

  getLastStatus(agentId?: number): Observable<LastStatusResponse> {
    let params = new HttpParams();
    if (typeof agentId === 'number') params = params.set('agentId', String(agentId));
    return this.http.get<LastStatusResponse>(`${this.baseUrl}/last-status`, { params });
  }

  generateIdempotencyKey(): string {
    try {
      if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
        return (crypto as any).randomUUID();
      }
    } catch {}
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }
}


