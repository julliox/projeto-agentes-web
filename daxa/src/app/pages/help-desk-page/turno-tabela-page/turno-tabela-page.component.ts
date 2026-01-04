// src/app/pages/help-desk-page/turno-tabela-page/turno-tabela-page.component.ts

import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AgentService, Agente } from '../../../services/agent.service';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {NgIf, NgFor, NgClass} from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import moment, { Moment } from 'moment';
import 'moment/locale/pt-br'; // Importa o idioma português
import { MatIconModule } from '@angular/material/icon';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {CdkDragDrop, DragDropModule, moveItemInArray} from "@angular/cdk/drag-drop";
import { ShortNamePipe } from "../../../pipes/short-name.pipe"
import {TurnoService} from "../../../services/turno.service";
import {ExportacaoUtil} from "../../../util/exportacao.util";
import Papa from 'papaparse'
import {TipoTurno, TipoTurnoService} from "../../../services/tipo-turno.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { ConfirmDialogComponent, ConfirmDialogData } from "../../../ui-elements/dialog/dialog-usage/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import * as XLSX from 'xlsx';
import { ActivatedRoute } from '@angular/router';

export interface Turno {
    id: string,
    tipoTurno: {
        id: string,
        descricao: string
    },
    nomeAgente: string;
    dataTurno: string;
    agentId: number; // Alterado para 'number'
}

export const MY_FORMATS = {
    parse: {
        dateInput: 'MM/YYYY',
    },
    display: {
        dateInput: 'MM/YYYY',
        monthYearLabel: 'MMMM YYYY',
        dateA11yLabel: 'MM/YYYY',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-turno-tabela-page',
    templateUrl: './turno-tabela-page.component.html',
    styleUrls: ['./turno-tabela-page.component.scss'],
    standalone: true,
    imports: [
        ConfirmDialogComponent,
        MatCardModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        NgIf,
        NgFor,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        MatNativeDateModule,
        ReactiveFormsModule,
        NgClass,
        DragDropModule,
        ShortNamePipe,
    ],
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class TurnoTabelaPageComponent implements OnInit {
    mesSelecionadoControl = new FormControl<Moment>(moment(), { nonNullable: true });
    mesSelecionado: Date = new Date();
    diasDoMes: Date[] = [];

    agentes: Agente[] = [];
    turnos: Turno[] = [];

    turnosMapa: { [agenteId: number]: { [data: string]: string } } = {};

    isLoading: boolean = true;
    errorMessage: string = '';

    dadosSalarios: any;
    objFormatado: any;
    tiposTurnos: any;

    displayedColumns: string[] = [];

    constructor(
        private agentService: AgentService,
        public themeService: CustomizerSettingsService,
        private turnoService: TurnoService,
        private tipoTurnoService: TipoTurnoService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private route: ActivatedRoute
    ) {
        moment.locale('pt-br')
    }

    ngOnInit(): void {
        this.mesSelecionado = this.mesSelecionadoControl.value.toDate();
        this.carregarDiasDoMes();
        this.carregarAgentes();
        this.carregarTurnos();
        this.loadTipoTurnos();

        // Verificar se há um agentId na rota
        this.route.paramMap.subscribe(params => {
            const agentId = params.get('agentId');
            if (agentId) {
                console.log('Agent ID recebido:', agentId);
                // Aqui você pode implementar lógica específica para filtrar por agente
                // Por exemplo, filtrar apenas os turnos deste agente
            }
        });
    }

    loadTipoTurnos(): void {
        this.isLoading = true;
        this.tipoTurnoService.getAllTipoTurnos().subscribe({
            next: (data) => {
                this.tiposTurnos = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = err;
                this.isLoading = false;
                this.snackBar.open(`Erro: ${err}`, 'Fechar', { duration: 5000 });
            }
        });
    }

    carregarDiasDoMes(): void {
        const ano = this.mesSelecionado.getFullYear();
        const mes = this.mesSelecionado.getMonth();
        const numeroDias = new Date(ano, mes + 1, 0).getDate();

        this.diasDoMes = [];
        for (let dia = 1; dia <= numeroDias; dia++) {
            this.diasDoMes.push(new Date(ano, mes, dia));
        }

        // Atualiza as colunas exibidas na tabela
        this.displayedColumns = ['name', ...this.diasDoMes.map(date => this.formatarData(date))];
    }

    carregarAgentes(): void {
        this.isLoading = true;
        this.agentService.getAgents().subscribe(
            (agents: Agente[]) => {
                const ordemSalva = localStorage.getItem('ordemAgentes');
                if (ordemSalva) {
                    const ordemIds: number[] = JSON.parse(ordemSalva);
                    // Ordenar os agentes conforme a ordem salva
                    this.agentes = ordemIds
                        .map(id => agents.find(agente => agente.id === id))
                        .filter(agente => agente !== undefined) as Agente[];
                    // Adicionar os agentes que não estavam na ordem salva no final
                    const agentesFaltantes = agents.filter(agente => !ordemIds.includes(agente.id));
                    this.agentes = [...this.agentes, ...agentesFaltantes];
                    console.log("AGENTES>>", this.agentes);
                } else {
                    this.agentes = agents;
                }
                this.isLoading = false;
            },
            error => {
                this.errorMessage = 'Erro ao carregar agentes.';
                this.isLoading = false;
                console.error('Erro ao carregar agentes:', error);
            }
        );
    }

    prepararTurnosMapa(): void {
        this.turnosMapa = {};
        this.turnos.forEach(turno => {
            if (!this.turnosMapa[turno.agentId]) {
                this.turnosMapa[turno.agentId] = {};
            }
            const dataFormatada = moment(turno.dataTurno, 'YYYY-MM-DD').format('YYYY-MM-DD');
            this.turnosMapa[turno.agentId][dataFormatada] = turno.tipoTurno.descricao;
        });
    }

    carregarTurnos(): void {
        this.turnoService.getAllTurnos().subscribe({
            next: (data: any) => {
                    this.turnos = data;
                    this.prepararTurnosMapa();
                    this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = 'Erro ao carregar agentes.';
                this.isLoading = false;
                console.error('Erro ao carregar agentes:', err);
            }
        });
    }

    getDadosSalario(dataEscolhida: any): void {
        this.agentService.getDadosSalarios(dataEscolhida).subscribe(
            (objeto: any) => {
                this.dadosSalarios = objeto;
                console.log("RETORNO>>", objeto)
                this.isLoading = false;
            },
            error => {
                this.errorMessage = 'Erro ao carregar agentes.';
                this.isLoading = false;
                console.error('Erro ao carregar agentes:', error);
            }
        );
    }

    onMesChange(event: any): void {
        this.mesSelecionado = this.mesSelecionadoControl.value.toDate();
        this.carregarDiasDoMes();
        // Recarregar turnos para o novo mês, se necessário
    }

    chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>): void {
        const ctrlValue = this.mesSelecionadoControl.value;
        ctrlValue.month(normalizedMonth.month());
        ctrlValue.year(normalizedMonth.year());
        this.mesSelecionadoControl.setValue(ctrlValue);
        this.mesSelecionado = ctrlValue.toDate();
        datepicker.close();
        this.carregarDiasDoMes();
        this.getDadosSalario(this.obterAnoEMes(this.mesSelecionado))
    }

    obterAnoEMes(data: Date): { anoEscolhido: number; mesEscolhido: number } {
        const anoEscolhido = data.getFullYear();
        const mesEscolhido = data.getMonth() + 1; // getMonth() retorna de 0 (Janeiro) a 11 (Dezembro)

        return { anoEscolhido, mesEscolhido };
    }

    obterTurno(agente: Agente, data: Date): string {
        const dataTurno = moment(data);
        const turnoEncontrado = this.turnos.find(turno => {
            const sameId = turno.agentId === agente.id;
            const sameDate = moment(turno.dataTurno, 'YYYY-MM-DD').isSame(dataTurno, 'day');
            return sameId && sameDate;
        });
        return turnoEncontrado ? turnoEncontrado.tipoTurno.descricao : '';
    }

    obterClasseTurno(tipoTurno: string): string {
        switch (tipoTurno) {
            case 'DIURNO':
                return 'turno-diurno';
            case 'NOTURNO':
                return 'turno-noturno';
            default:
                return '';
        }
    }

    formatarData(data: Date): string {
        return moment(data).format('YYYY-MM-DD');
    }

    formatarDataSimples(data: Date): string {
        return moment(data).format('DD/MM');
    }

    obterDiaDaSemana(data: Date): string {
        return moment(data).format('ddd');
    }

    // Adicione o método drop para lidar com o evento de drop
    drop(event: CdkDragDrop<Agente[]>) {
        moveItemInArray(this.agentes, event.previousIndex, event.currentIndex);
        this.salvarOrdem(); // Função para salvar a nova ordem (a ser implementada)
    }

    salvarOrdem() {
        // Temporariamente, vamos salvar no Local Storage
        localStorage.setItem('ordemAgentes', JSON.stringify(this.agentes.map(agente => agente.id)));
        // Em seguida, você poderá implementar a lógica para salvar no backend
    }
    geraPDFTESTEteste(){
        let request = {
            testeFolha: "teste"
        }
        this.geraPDFTESTE(request);
    }
    geraPDFTESTE(request: any){
        this.turnoService
            .gerarPdfTeste(request)
            .subscribe((rs: any) => {
                ExportacaoUtil.download(
                    rs,
                    ExportacaoUtil.PDF_TYPE,
                    `Teste.pdf`
                );
            });

    }

    gerarCsvResultado() {
        const csv = this.converterListaJsonParaCsv(this.dadosSalarios);

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute(
                'download',
                `relatorio`
            );
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    converterListaJsonParaCsv(listaJson: any[]): string {
        if (listaJson.length === 0) {
            return '';
        }

        const newHeader = this.organizaHeader(listaJson);

        const header =
            Object.keys(newHeader[0])
                .map((key) => `${key}`)
                .join(';') + '\n';
        const linhas = newHeader
            .map((obj) =>
                Object.values(obj)
                    .map((value) => `${value}`)
                    .join(';')
            )
            .join('\n');

        return header + linhas;
    }

    organizaHeader(listaJson: any) {
        let listaOrganizada: any[] = [];

        listaJson.forEach((element: any) => {
            this.objFormatado = {}
            this.objFormatado.NOME = element.agenteNome;
            this.objFormatado.BONUS_EXTRA = element.salarioExtra;
            this.objFormatado.HEALTH_INSURANCE = " "
            this.objFormatado.LANGUAGE_BONUS = " "
            this.objFormatado.DEDUCTIONS = " "
            this.objFormatado.PONTUALITY_BONUS = "75"
            this.objFormatado.SUBTOTAL = element.salarioSubTotal;
            this.objFormatado.FIVE_PERCENT = element.salarioCincoPorcento;
            this.objFormatado.TOTAL = element.salarioLiquido;
            listaOrganizada.push(this.objFormatado);
        });

        return listaOrganizada;
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];

        if (file) {
            const reader: FileReader = new FileReader();
            reader.readAsText(file);

            reader.onload = () => {
                const csvContent = reader.result as string;
                this.processarCsv(csvContent);
            };
        }
    }

    processarCsv(csvContent: string): void {
        const parsedData = Papa.parse(csvContent, {
            header: false,
            skipEmptyLines: true
        }).data;

        this.analisarDados(parsedData);
    }

    analisarDados(data: any[]): void {
        if (data.length === 0) {
            console.error('O arquivo CSV está vazio.');
            return;
        }

        const header = data[0]; // Primeira linha (datas)
        const agentesData = data.slice(1); // Restante das linhas (agentes)

        const resultados: any[] = [];

        agentesData.forEach(row => {
            const agenteNomeCsv = row[0]?.trim().toUpperCase(); // Nome do agente em maiúsculas
            const turnosAgente = row.slice(1);

            // Encontrar o agente correspondente em this.agentes
            const agente = this.agentes.find(a => a.name.toUpperCase() === agenteNomeCsv);

            if (!agente) {
                console.warn(`Agente não encontrado: ${agenteNomeCsv}`);
                return;
            }

            // Objeto para mapear códigos de turno para datas
            const turnosPorCodigo: { [codigo: string]: string[] } = {};

            turnosAgente.forEach((turno: string, index: number) => {
                const turnoTrim = turno?.trim().toUpperCase();

                if (turnoTrim && (turnoTrim === 'D' || turnoTrim === 'N')) {
                    const dataTurno = header[index + 1]?.trim(); // +1 porque o primeiro elemento é o nome do agente

                    // Formatar data para AAAA-MM-DD
                    const dataFormatada = moment(dataTurno, 'DD/MM/YYYY').format('YYYY-MM-DD');

                    if (!turnosPorCodigo[turnoTrim]) {
                        turnosPorCodigo[turnoTrim] = [];
                    }
                    turnosPorCodigo[turnoTrim].push(dataFormatada);
                }
            });

            // Para cada código de turno (D, N), criar um objeto com tipoTurnoId, agentId e dataTurno
            Object.keys(turnosPorCodigo).forEach(codigoTurno => {
                // Encontrar o tipo de turno correspondente em this.tiposTurnos
                const tipoTurno = this.tiposTurnos.find((t: TipoTurno) => t.cod === codigoTurno);

                if (!tipoTurno) {
                    console.warn(`Tipo de turno não encontrado para o código: ${codigoTurno}`);
                    return;
                }

                const objetoResultado = {
                    tipoTurnoId: tipoTurno.id,
                    agentId: agente.id,
                    dataTurno: turnosPorCodigo[codigoTurno]
                };

                resultados.push(objetoResultado);
            });
        });

        console.log('Resultados:', resultados);

        // Calcular a quantidade total de turnos
        const quantidadeTurnos = resultados.reduce((total, item) => total + item.dataTurno.length, 0);

        // Exibir o modal de confirmação
        const confirmData: ConfirmDialogData = {
            title: "Confirmação",
            message: `Tem certeza que deseja adicionar ${quantidadeTurnos} Turno(s)?`
        };

        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '350px',
            data: confirmData
        });

        confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.criarTurnosEmLotes(resultados);
            }
        });
    }

    criarTurnosEmLotes(dados: any[]): void {
        this.isLoading = true; // Ativar o loading

        this.turnoService.criarTurnosEmLote(dados).subscribe(
            (response: any) => {
                this.isLoading = false; // Desativar o loading
                // Exibir mensagem de sucesso
                this.snackBar.open('Turnos criados com sucesso!', 'Fechar', { duration: 3000 });
                // Atualizar a tabela de turnos
                this.carregarTurnos();
            },
            (error: any) => {
                this.isLoading = false; // Desativar o loading
                // Exibir mensagem de erro
                this.snackBar.open(`Erro ao criar turnos em lote: ${error}`, 'Fechar', { duration: 5000 });
                console.error('Erro ao criar turnos em lote:', error);
            }
        );
    }

    downloadExcel(): void {
        if (!this.agentes.length || !this.diasDoMes.length) {
            this.snackBar.open('Não há dados para exportar', 'Fechar', { duration: 3000 });
            return;
        }

        try {
            // Criar workbook Excel
            const workbook = XLSX.utils.book_new();

            // Preparar dados para a planilha
            const worksheetData = this.prepararDadosParaExcel();

            // Criar worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            // Aplicar formatação e estilos
            this.aplicarFormatacaoExcel(worksheet, worksheetData);

            // Configurar largura das colunas
            const colWidths = this.calcularLarguraColunas(worksheetData);
            worksheet['!cols'] = colWidths;

            // Adicionar worksheet ao workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Tabela de Turnos');

            // Criar aba de estatísticas
            const statsWorksheet = this.criarAbaEstatisticas();
            XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estatísticas');

            // Criar aba de detalhes dos agentes
            const agentesWorksheet = this.criarAbaDetalhesAgentes();
            XLSX.utils.book_append_sheet(workbook, agentesWorksheet, 'Detalhes Agentes');

            // Gerar arquivo Excel
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            // Criar blob e download
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tabela_turnos_${this.mesSelecionado.getFullYear()}_${(this.mesSelecionado.getMonth() + 1).toString().padStart(2, '0')}.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);

            this.snackBar.open('Arquivo Excel baixado com sucesso!', 'Fechar', { duration: 3000 });
        } catch (error) {
            console.error('Erro ao gerar Excel:', error);
            this.snackBar.open('Erro ao gerar arquivo Excel', 'Fechar', { duration: 3000 });
        }
    }

    private prepararDadosParaExcel(): any[][] {
        const dados: any[][] = [];

        // Cabeçalho com datas
        const header = ['Agentes'];
        this.diasDoMes.forEach(date => {
            header.push(`${this.formatarDataSimples(date)} (${this.obterDiaDaSemana(date)})`);
        });
        dados.push(header);

        // Dados dos agentes
        this.agentes.forEach(agente => {
            const linha = [agente.name];

            this.diasDoMes.forEach(date => {
                const dataFormatada = this.formatarData(date);
                const turno = this.turnosMapa[agente.id]?.[dataFormatada] || '';
                linha.push(turno);
            });

            dados.push(linha);
        });

        return dados;
    }

    private calcularLarguraColunas(dados: any[][]): any[] {
        const colWidths = [];

        // Largura da primeira coluna (Agentes)
        colWidths.push({ width: 20 });

        // Largura das colunas de datas
        for (let i = 1; i < dados[0].length; i++) {
            colWidths.push({ width: 15 });
        }

        return colWidths;
    }

    private aplicarFormatacaoExcel(worksheet: XLSX.WorkSheet, dados: any[][]): void {
        // Definir range das células
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

        // Estilo para cabeçalho (primeira linha)
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) {
                worksheet[cellAddress] = { v: '' };
            }
            worksheet[cellAddress].s = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '4472C4' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                }
            };
        }

        // Estilo para primeira coluna (nomes dos agentes)
        for (let row = 1; row <= range.e.r; row++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
            if (worksheet[cellAddress]) {
                worksheet[cellAddress].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: 'E7E6E6' } },
                    border: {
                        top: { style: 'thin' },
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                };
            }
        }

        // Estilo para células de dados (turnos)
        for (let row = 1; row <= range.e.r; row++) {
            for (let col = 1; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (worksheet[cellAddress]) {
                    const turno = worksheet[cellAddress].v;
                    const corFundo = this.obterCorTurno(turno);

                    worksheet[cellAddress].s = {
                        alignment: { horizontal: 'center', vertical: 'center' },
                        fill: { fgColor: { rgb: corFundo } },
                        border: {
                            top: { style: 'thin' },
                            bottom: { style: 'thin' },
                            left: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    };
                }
            }
        }
    }

    private criarAbaEstatisticas(): XLSX.WorkSheet {
        const statsData: any[][] = [
            ['Estatísticas Gerais'],
            ['Total de Agentes:', this.agentes.length],
            ['Total de Turnos:', this.turnos.length],
            ['Total de Tipos de Turno:', this.tiposTurnos.length],
            ['Total de Dados Salariais:', this.dadosSalarios ? this.dadosSalarios.length : 0],
            ['Total de Dados de Folha:', this.dadosSalarios ? this.dadosSalarios.reduce((sum: number, item: any) => sum + (item.salarioLiquido || 0), 0) : 0],
            ['Total de Dados de Folha (Extra):', this.dadosSalarios ? this.dadosSalarios.reduce((sum: number, item: any) => sum + (item.salarioExtra || 0), 0) : 0],
            ['Total de Dados de Folha (Subtotal):', this.dadosSalarios ? this.dadosSalarios.reduce((sum: number, item: any) => sum + (item.salarioSubTotal || 0), 0) : 0],
            ['Total de Dados de Folha (Cinco Porcento):', this.dadosSalarios ? this.dadosSalarios.reduce((sum: number, item: any) => sum + (item.salarioCincoPorcento || 0), 0) : 0],
            ['Total de Dados de Folha (Liquido):', this.dadosSalarios ? this.dadosSalarios.reduce((sum: number, item: any) => sum + (item.salarioLiquido || 0), 0) : 0],
        ];

        return XLSX.utils.aoa_to_sheet(statsData);
    }

    private criarAbaDetalhesAgentes(): XLSX.WorkSheet {
        const agentesData: any[][] = [
            ['Detalhes dos Agentes'],
            ['Nome do Agente', 'Total de Turnos', 'Total de Folha (Extra)', 'Total de Folha (Subtotal)', 'Total de Folha (Cinco Porcento)', 'Total de Folha (Liquido)']
        ];

        this.agentes.forEach(agente => {
            const totalTurnos = this.turnos.filter(turno => turno.agentId === agente.id).length;
            const totalFolhaExtra = this.dadosSalarios ? this.dadosSalarios.reduce((sum: number, item: any) => sum + (item.salarioExtra || 0), 0) : 0;
            const totalFolhaSubTotal = this.dadosSalarios ? this.dadosSalarios.reduce((sum: number, item: any) => sum + (item.salarioSubTotal || 0), 0) : 0;
            const totalFolhaCincoPorcento = this.dadosSalarios ? this.dadosSalarios.reduce((sum: number, item: any) => sum + (item.salarioCincoPorcento || 0), 0) : 0;
            const totalFolhaLiquido = this.dadosSalarios ? this.dadosSalarios.reduce((sum: number, item: any) => sum + (item.salarioLiquido || 0), 0) : 0;

            agentesData.push([
                agente.name,
                totalTurnos,
                totalFolhaExtra,
                totalFolhaSubTotal,
                totalFolhaCincoPorcento,
                totalFolhaLiquido
            ]);
        });

        return XLSX.utils.aoa_to_sheet(agentesData);
    }

    private obterCorTurno(turno: string): string {
        if (!turno) return 'FFFFFF'; // Branco para células vazias

        const turnoLower = turno.toLowerCase();

        if (turnoLower.includes('manhã') || turnoLower.includes('manha')) {
            return 'FFE6CC'; // Laranja claro
        } else if (turnoLower.includes('tarde')) {
            return 'D5E8D4'; // Verde claro
        } else if (turnoLower.includes('noite')) {
            return 'E1D5E7'; // Roxo claro
        } else if (turnoLower.includes('folga')) {
            return 'F8CECC'; // Vermelho claro
        } else {
            return 'F2F2F2'; // Cinza claro para outros
        }
    }

}
