import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PontoService, PunchType, PunchRequest } from '../../services/ponto.service';
import { AlertService } from '../../services/alert.service';

interface PunchRecord { id: string; type: PunchType; timestamp: string; }

@Component({
  selector: 'app-agent-ponto',
  standalone: true,
  imports: [CommonModule, MatButton, MatProgressSpinnerModule],
  templateUrl: './agent-ponto.component.html',
  styleUrls: ['./agent-ponto.component.scss']
})
export class AgentPontoComponent implements OnInit {
  isClockedIn = false;
  history: PunchRecord[] = [];
  isLoading = false;
  isLoadingHistory = false;
  historyPage = 0;
  historySize = 20;
  hasNext = false;

  constructor(
    private pontoService: PontoService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Estado real do back-end ao iniciar
    this.refreshStateFromApi();
    this.refreshHistory(true);
  }

  togglePunch(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    const action: PunchType = this.isClockedIn ? 'SAIDA' : 'ENTRADA';
    const payload: PunchRequest = {
      action,
      clientTimestamp: new Date().toISOString(),
      clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      source: 'WEB',
      deviceId: typeof navigator !== 'undefined' ? `browser-${navigator.userAgent}` : 'browser'
      // agentId: somente ADMIN, não enviar para AGENT
    };
    const key = this.pontoService.generateIdempotencyKey();

    // Simula delay de 2s exigido e, ao final, chama a API real
    setTimeout(() => {
      this.pontoService.punch(payload, key).subscribe({
        next: (res) => {
          // Ajuste do estado local pelo tipo retornado e/ou flag do servidor
          const computed = typeof (res as any).isClockedIn === 'boolean' ? (res as any).isClockedIn : (res.type === 'ENTRADA');
          this.isClockedIn = computed;
          // Recarrega histórico para refletir registro mais recente
          this.refreshHistory(true);
          // Reconsulta status no servidor com pequeno atraso para evitar inconsistência de leitura
          setTimeout(() => this.refreshStateFromApi(), 300);
          this.alertService.showSuccess(`${action === 'ENTRADA' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          if (err?.status === 409) {
            this.alertService.showWarning('Sequência inválida (verifique entrada/saída).');
          } else if (err?.status === 403) {
            this.alertService.showError('Ação não permitida.');
          } else if (err?.status === 400) {
            this.alertService.showError('Dados inválidos ao registrar ponto.');
          } else {
            this.alertService.showError('Erro ao registrar ponto. Tente novamente.');
          }
          // Re-sincroniza estado para evitar inconsistências
          this.refreshStateFromApi();
        }
      });
    }, 2000);
  }

  // Removidos métodos de mock/localStorage

  private generateRecordId(): string {
    try {
      // Evita ReferenceError em SSR
      if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
        return (crypto as any).randomUUID();
      }
    } catch {}
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  get actionLabel(): string {
    if (this.isLoading) return 'Registrando...';
    return this.isClockedIn ? 'Registrar Saída' : 'Registrar Entrada';
  }

  get processingLabel(): string {
    const type: PunchType = this.isClockedIn ? 'SAIDA' : 'ENTRADA';
    return type === 'ENTRADA' ? 'Registrando entrada...' : 'Registrando saída...';
  }

  private refreshStateFromApi(): void {
    // Preferir /state para estado atual; fallback para /last-status se necessário
    this.pontoService.getState().subscribe({
      next: (state) => {
        const clockedIn = typeof state.clockedIn === 'boolean' ? state.clockedIn : !!state.isClockedIn;
        this.isClockedIn = clockedIn;
      },
      error: () => {
        this.pontoService.getLastStatus().subscribe({
          next: (last) => {
            if (last && last.lastType) {
              this.isClockedIn = last.lastType === 'ENTRADA';
            } else {
              this.isClockedIn = false;
            }
          },
          error: () => {
            // Mantém estado atual se ambos falharem
          }
        });
      }
    });
  }

  refreshHistory(reset: boolean = false): void {
    if (this.isLoadingHistory) return;
    this.isLoadingHistory = true;
    if (reset) {
      this.history = [];
      this.historyPage = 0;
      this.hasNext = false;
    }
    this.pontoService.getHistory({
      page: this.historyPage,
      size: this.historySize,
      sort: 'timestampServer,desc'
    }).subscribe({
      next: (res) => {
        const mapped: PunchRecord[] = (res.items || []).map(i => ({ id: i.id, type: i.type, timestamp: i.timestamp }));
        this.history = [...this.history, ...mapped];
        this.hasNext = !!res.hasNext;
        if (mapped.length > 0) this.historyPage += 1;
        this.isLoadingHistory = false;
      },
      error: () => {
        this.isLoadingHistory = false;
        this.alertService.showError('Erro ao carregar histórico de ponto.');
      }
    });
  }
}


