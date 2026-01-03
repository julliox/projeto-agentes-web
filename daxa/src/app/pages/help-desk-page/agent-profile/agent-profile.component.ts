import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgentService } from '../../../services/agent.service';
import { AgentProfile } from '../../../models/agent-profile/agent-profile.module';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import {MatButton} from "@angular/material/button";
import {ExportacaoUtil} from "../../../util/exportacao.util";
import {TurnoService} from "../../../services/turno.service";

@Component({
    selector: 'app-agent-profile',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatButton
    ],
    providers: [CurrencyPipe, DatePipe], // Adicionamos o DatePipe para formatação de datas
    templateUrl: './agent-profile.component.html',
    styleUrls: ['./agent-profile.component.scss']
})
export class AgentProfileComponent implements OnInit {

    agentProfile: AgentProfile | null = null;
    isLoading: boolean = false;
    errorMessage: string = '';
    currentMonthName: string = '';
    formattedAdmissionDate: string = '';

    constructor(
        private route: ActivatedRoute,
        private agentService: AgentService,
        private currencyPipe: CurrencyPipe,
        private datePipe: DatePipe,
        private turnoService: TurnoService
    ) { }

    ngOnInit(): void {
        this.setCurrentMonthName();
        this.route.paramMap.subscribe(params => {
            const agentId = params.get('id');
            if (agentId) {
                this.fetchAgentProfile(agentId);
            } else {
                this.errorMessage = 'ID do agente não fornecido.';
            }
        });
    }

    /**
     * Define o nome do mês atual em português.
     */
    setCurrentMonthName(): void {
        const date = new Date();
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março',
            'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro',
            'Outubro', 'Novembro', 'Dezembro'
        ];
        this.currentMonthName = monthNames[date.getMonth()];
    }

    /**
     * Busca o perfil do agente pelo ID.
     * @param id ID do agente.
     */
    fetchAgentProfile(id: string): void {
        this.isLoading = true;
        this.agentService.getAgentProfile(id).subscribe({
            next: (data: AgentProfile) => {
                this.agentProfile = data;
                this.formattedAdmissionDate = this.formatDate(data.admissionDate);
                this.isLoading = false;
                this.errorMessage = '';
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = 'Erro ao buscar o perfil do agente. Verifique se o ID está correto.';
                console.error(error);
            }
        });
    }

    /**
     * Formata a data de admissão para o formato "DD/MM/AAAA".
     * @param dateStr Data em formato string "AAAA-MM-DD".
     * @returns Data formatada como "DD/MM/AAAA".
     */
    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return this.datePipe.transform(date, 'dd/MM/yyyy') || dateStr;
    }

    gerarFolhaPagamento(){
        let request = {
            idAgente: this.agentProfile?.id,
            nomeAgente: this.agentProfile?.name,
            mesPagamento: "2024-11"
        }

        console.log(request);

        this.turnoService
            .gerarPdfTeste(request)
            .subscribe((rs: any) => {
                ExportacaoUtil.download(
                    rs,
                    ExportacaoUtil.PDF_TYPE,
                    `Demonstrativo_pagamento_${this.agentProfile?.name}.pdf`
                );
            });
    }

}
