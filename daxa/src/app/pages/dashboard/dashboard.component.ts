import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { DashboardService, AgentStatusHistoryItem } from '../../services/dashboard.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressBarModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
    
    // Card de Agentes Online
    onlineAgentsCount: number = 0;
    totalAgents: number = 0;
    offlineCount: number = 0;
    isLoadingCount: boolean = false;
    
    // Tabela de histórico
    displayedColumns: string[] = ['agentName', 'status', 'statusDate'];
    dataSource = new MatTableDataSource<AgentStatusHistoryItem>([]);
    isLoadingHistory: boolean = false;
    errorMessage: string = '';
    
    // Paginação
    totalElements: number = 0;
    pageSize: number = 10;
    pageIndex: number = 0;
    pageSizeOptions: number[] = [5, 10, 20, 50];
    
    @ViewChild('paginator') paginator!: MatPaginator;

    constructor(
        public themeService: CustomizerSettingsService,
        private dashboardService: DashboardService
    ) {}

    ngOnInit(): void {
        this.loadOnlineCount();
        this.loadAgentHistory();
    }

    ngAfterViewInit(): void {
        if (this.paginator) {
            this.paginator.page.subscribe((event: PageEvent) => {
                this.pageIndex = event.pageIndex;
                this.pageSize = event.pageSize;
                this.loadAgentHistory();
            });
        }
    }

    /**
     * Carrega a contagem de agentes online
     */
    loadOnlineCount(): void {
        this.isLoadingCount = true;
        this.dashboardService.getOnlineAgentsCount()
            .pipe(
                catchError((error) => {
                    console.error('Erro ao carregar contagem de agentes online:', error);
                    this.errorMessage = 'Erro ao carregar dados. Tente novamente.';
                    return of(null);
                }),
                finalize(() => {
                    this.isLoadingCount = false;
                })
            )
            .subscribe((response) => {
                if (response) {
                    this.onlineAgentsCount = response.onlineCount;
                    this.totalAgents = response.totalAgents;
                    this.offlineCount = response.offlineCount;
                }
            });
    }

    /**
     * Carrega o histórico de status dos agentes
     */
    loadAgentHistory(): void {
        this.isLoadingHistory = true;
        this.errorMessage = '';
        
        this.dashboardService.getAgentStatusHistory({
            page: this.pageIndex,
            size: this.pageSize
        })
            .pipe(
                catchError((error) => {
                    console.error('Erro ao carregar histórico de status:', error);
                    
                    // Verifica se é erro de autorização
                    if (error.status === 401 || error.status === 403) {
                        this.errorMessage = 'Você não tem permissão para acessar esta funcionalidade.';
                    } else {
                        this.errorMessage = 'Erro ao carregar histórico. Tente novamente.';
                    }
                    
                    return of(null);
                }),
                finalize(() => {
                    this.isLoadingHistory = false;
                })
            )
            .subscribe((response) => {
                if (response) {
                    this.dataSource.data = response.content;
                    this.totalElements = response.totalElements;
                    
                    // Atualiza paginator se necessário
                    if (this.paginator) {
                        this.paginator.length = response.totalElements;
                        this.paginator.pageSize = response.size;
                        this.paginator.pageIndex = response.number;
                    }
                } else {
                    this.dataSource.data = [];
                }
            });
    }

    /**
     * Formata a data para exibição
     * Aceita tanto Date quanto string ISO 8601
     */
    formatDate(date: string | Date): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) {
            return 'Data inválida';
        }
        
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Agora';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `Há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        } else {
            return dateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    /**
     * Retorna a classe CSS para o status
     */
    getStatusClass(status: string): string {
        return status === 'ONLINE' ? 'status-online' : 'status-offline';
    }
}
