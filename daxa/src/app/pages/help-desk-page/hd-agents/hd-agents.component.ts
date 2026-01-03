// src/app/components/hd-agents/hd-agents.component.ts

import { Component, ViewChild, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { AgentService, Agente } from '../../../services/agent.service';

@Component({
    selector: 'app-hd-agents',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatTooltipModule
    ],
    templateUrl: './hd-agents.component.html',
    styleUrls: ['./hd-agents.component.scss']
})
export class HdAgentsComponent implements OnInit {

    displayedColumns: string[] = ['name', 'email', 'status', 'actions'];
    dataSource = new MatTableDataSource<Agente>([]);

    @ViewChild('paginator') paginator!: MatPaginator;

    // Estados de carregamento e erro
    isLoading: boolean = true;
    errorMessage: string = '';

    constructor(
        private agentService: AgentService,
        public themeService: CustomizerSettingsService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.fetchAgents();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    // Método para recarregar os dados
    reloadData(): void {
        this.fetchAgents();
    }

    fetchAgents(): void {
        this.isLoading = true;
        this.agentService.getAgents().subscribe(
            (agents: Agente[]) => {
                this.dataSource.data = agents;
                this.isLoading = false;
                // Garantir que o paginator seja configurado após os dados serem carregados
                setTimeout(() => {
                    if (this.paginator) {
                        this.dataSource.paginator = this.paginator;
                    }
                }, 0);
            },
            (error) => {
                this.errorMessage = error.message || 'Erro ao buscar agentes.';
                this.isLoading = false;
                console.error('Erro ao buscar agentes:', error);
            }
        );
    }

    viewTurnos(agentId: number): void {
        this.router.navigate(['/view-turnos', agentId.toString()]);
    }

    editAgent(agentId: number): void {
        this.router.navigate(['/help-desk-page/edit-agent', agentId.toString()]);
    }

    viewAgent(agentId: number): void {
        this.router.navigate(['/help-desk-page/agent-profile', agentId.toString()]);
    }

}
