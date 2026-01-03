import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { TeamService, Team, CreateTeamRequest, UpdateTeamRequest, TeamResponse, TeamListParams, TeamStatistics, Page } from '../../services/team.service';
import { AgentService, Agente } from '../../services/agent.service';
import { AlertService } from '../../services/alert.service';
import { AuthorizationService } from '../../services/authorization.service';
import { API_CONFIG } from '../../services/api.config';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-teams-page',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatMenuModule,
        MatChipsModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSnackBarModule,
        MatSlideToggleModule
    ],
    templateUrl: './teams-page.component.html',
    styleUrls: ['./teams-page.component.scss']
})
export class TeamsPageComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    // Estados
    isLoading = false;
    isFormVisible = false;
    isEditing = false;
    editingTeamId: number | null = null;
    isSearching = false; // Novo estado para busca

    // Dados
    teams: Team[] = [];
    agents: Agente[] = [];
    dataSource = new MatTableDataSource<Team>();
    
    // Paginação e filtros
    currentPage = 0;
    pageSize = API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
    totalElements = 0;
    searchTerm = '';
    statusFilter = '';

    // Estatísticas
    statistics: TeamStatistics | null = null;

    // Formulário
    teamForm: FormGroup;

    // Colunas da tabela
    displayedColumns: string[] = [
        'name',
        'workTime',
        'duration',
        'agentsCount',
        'status',
        'createdAt',
        'actions'
    ];

    // Controle de busca otimizada
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private teamService: TeamService,
        private agentService: AgentService,
        private alertService: AlertService,
        private authorizationService: AuthorizationService,
        public themeService: CustomizerSettingsService,
        private dialog: MatDialog
    ) {
        this.teamForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            workStartTime: ['08:00', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
            workEndTime: ['17:00', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
            agentIds: [[], [Validators.required, Validators.minLength(1)]]
        });

        // Validação customizada para horários
        this.teamForm.valueChanges.subscribe(() => {
            this.validateWorkTime();
        });

        // Configurar busca otimizada com debounce
        this.setupOptimizedSearch();
    }

    ngOnInit(): void {
        this.loadTeams();
        this.loadAgents();
        this.loadStatistics();
        this.setupTable();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        // Configurar paginação
        if (this.paginator) {
            this.paginator.page.subscribe(event => {
                this.currentPage = event.pageIndex;
                this.pageSize = event.pageSize;
                this.loadTeams();
            });
        }
    }

    /**
     * Configura busca otimizada com debounce
     */
    private setupOptimizedSearch(): void {
        this.searchSubject.pipe(
            debounceTime(300), // Aguarda 300ms após parar de digitar
            distinctUntilChanged(), // Só executa se o valor mudou
            takeUntil(this.destroy$)
        ).subscribe(searchTerm => {
            this.performSearch(searchTerm);
        });
    }

    /**
     * Executa a busca real
     */
    private performSearch(searchTerm: string): void {
        this.searchTerm = searchTerm;
        this.currentPage = 0; // Reset para primeira página
        this.loadTeams();
    }

    /**
     * Carrega todas as equipes com filtros e paginação
     */
    loadTeams(): void {
        this.isLoading = true;
        
        const params: TeamListParams = {
            page: this.currentPage,
            size: this.pageSize,
            search: this.searchTerm || undefined,
            status: this.statusFilter || undefined,
            sort: API_CONFIG.PAGINATION.DEFAULT_SORT,
            direction: API_CONFIG.PAGINATION.DEFAULT_DIRECTION as 'asc' | 'desc'
        };

        this.teamService.getTeams(params).subscribe({
            next: (response: Page<TeamResponse>) => {
                this.teams = this.teamService.convertToTeams(response.content);
                this.dataSource.data = this.teams;
                this.totalElements = response.totalElements;
                this.isLoading = false;
                this.isSearching = false;
            },
            error: (error) => {
                console.error('Erro ao carregar equipes:', error);
                this.alertService.showError('Erro ao carregar equipes');
                this.isLoading = false;
                this.isSearching = false;
            }
        });
    }

    /**
     * Carrega todos os agentes
     */
    loadAgents(): void {
        this.agentService.getAgents().subscribe({
            next: (agents) => {
                this.agents = agents;
            },
            error: (error) => {
                console.error('Erro ao carregar agentes:', error);
                this.alertService.showError('Erro ao carregar agentes');
            }
        });
    }

    /**
     * Carrega estatísticas das equipes
     */
    loadStatistics(): void {
        this.teamService.getTeamStatistics().subscribe({
            next: (stats) => {
                this.statistics = stats;
            },
            error: (error) => {
                console.error('Erro ao carregar estatísticas:', error);
                // Não mostrar erro para estatísticas, não é crítico
            }
        });
    }

    /**
     * Configura a tabela
     */
    setupTable(): void {
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'workTime':
                    return `${item.workStartTime}${item.workEndTime}`;
                case 'duration':
                    return this.teamService.calculateShiftDuration(item.workStartTime, item.workEndTime);
                case 'agentsCount':
                    return item.agents.length;
                case 'createdAt':
                    return item.createdAt ? new Date(item.createdAt).getTime() : 0;
                case 'name':
                    return item.name;
                case 'status':
                    return item.status;
                default:
                    // Garantir que sempre retorne string ou number
                    const value = item[property as keyof Team];
                    if (typeof value === 'string' || typeof value === 'number') {
                        return value;
                    }
                    if (value instanceof Date) {
                        return value.getTime();
                    }
                    if (Array.isArray(value)) {
                        return value.length;
                    }
                    return '';
            }
        };
    }

    /**
     * Aplica filtro na tabela (otimizado)
     */
    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value.trim();
        this.isSearching = true;
        
        // Emite o termo de busca para o debounce
        this.searchSubject.next(filterValue);
    }

    /**
     * Filtra por status (otimizado)
     */
    filterByStatus(status: string): void {
        this.statusFilter = status;
        this.currentPage = 0; // Reset para primeira página
        this.loadTeams();
    }

    /**
     * Mostra formulário para criar nova equipe
     */
    showCreateForm(): void {
        this.isFormVisible = true;
        this.isEditing = false;
        this.editingTeamId = null;
        this.teamForm.reset({
            name: '',
            workStartTime: '08:00',
            workEndTime: '17:00',
            agentIds: []
        });
    }

    /**
     * Mostra formulário para editar equipe
     */
    showEditForm(team: Team): void {
        this.isFormVisible = true;
        this.isEditing = true;
        this.editingTeamId = team.id!;

        this.teamForm.patchValue({
            name: team.name,
            workStartTime: team.workStartTime,
            workEndTime: team.workEndTime,
            agentIds: team.agents.map(agent => agent.id)
        });
    }

    /**
     * Esconde o formulário
     */
    hideForm(): void {
        this.isFormVisible = false;
        this.isEditing = false;
        this.editingTeamId = null;
        this.teamForm.reset();
    }

    /**
     * Valida horário de trabalho
     */
    validateWorkTime(): void {
        const startTime = this.teamForm.get('workStartTime')?.value;
        const endTime = this.teamForm.get('workEndTime')?.value;

        if (startTime && endTime) {
            const isValid = this.teamService.validateWorkTime(startTime, endTime);

            if (!isValid) {
                this.teamForm.get('workEndTime')?.setErrors({ invalidTime: true });
            } else {
                this.teamForm.get('workEndTime')?.setErrors(null);
            }
        }
    }

    /**
     * Submete o formulário
     */
    onSubmit(): void {
        if (this.teamForm.valid) {
            const formValue = this.teamForm.value;

            if (this.isEditing && this.editingTeamId) {
                this.updateTeam(formValue);
            } else {
                this.createTeam(formValue);
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    /**
     * Cria nova equipe
     */
    createTeam(formData: any): void {
        const request: CreateTeamRequest = {
            name: formData.name,
            workStartTime: formData.workStartTime,
            workEndTime: formData.workEndTime,
            agentIds: formData.agentIds
        };

        this.isLoading = true;
        this.teamService.createTeam(request).subscribe({
            next: (team) => {
                this.alertService.showSuccess('Equipe criada com sucesso!');
                this.hideForm();
                this.loadTeams();
                this.loadStatistics(); // Recarregar estatísticas
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Erro ao criar equipe:', error);
                this.alertService.showError('Erro ao criar equipe');
                this.isLoading = false;
            }
        });
    }

    /**
     * Atualiza equipe existente
     */
    updateTeam(formData: any): void {
        if (!this.editingTeamId) return;

        const request: UpdateTeamRequest = {
            id: this.editingTeamId,
            name: formData.name,
            workStartTime: formData.workStartTime,
            workEndTime: formData.workEndTime,
            agentIds: formData.agentIds,
            status: 'ACTIVE' // Por enquanto sempre ativo
        };

        this.isLoading = true;
        this.teamService.updateTeam(request).subscribe({
            next: (team) => {
                this.alertService.showSuccess('Equipe atualizada com sucesso!');
                this.hideForm();
                this.loadTeams();
                this.loadStatistics(); // Recarregar estatísticas
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Erro ao atualizar equipe:', error);
                this.alertService.showError('Erro ao atualizar equipe');
                this.isLoading = false;
            }
        });
    }

    /**
     * Remove equipe
     */
    deleteTeam(team: Team): void {
        if (confirm(`Tem certeza que deseja remover a equipe "${team.name}"?`)) {
            this.isLoading = true;
            this.teamService.deleteTeam(team.id!).subscribe({
                next: (success) => {
                    if (success) {
                        this.alertService.showSuccess('Equipe removida com sucesso!');
                        this.loadTeams();
                        this.loadStatistics(); // Recarregar estatísticas
                    } else {
                        this.alertService.showError('Erro ao remover equipe');
                    }
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Erro ao remover equipe:', error);
                    this.alertService.showError('Erro ao remover equipe');
                    this.isLoading = false;
                }
            });
        }
    }

    /**
     * Alterna status da equipe (otimizado - sem recarregar tabela)
     */
    toggleTeamStatus(team: Team): void {
        // Atualizar o status localmente primeiro para evitar piscada
        const newStatus = team.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const originalStatus = team.status;
        
        // Atualização otimista da UI
        team.status = newStatus;
        team.updatedAt = new Date();
        
        // Atualizar estatísticas localmente
        this.updateLocalStatistics(newStatus, originalStatus);

        this.teamService.toggleTeamStatus(team.id!).subscribe({
            next: (updatedTeam) => {
                const statusText = updatedTeam.status === 'ACTIVE' ? 'ativada' : 'desativada';
                this.alertService.showSuccess(`Equipe ${statusText} com sucesso!`);
                
                // Sincronizar com o backend
                team.status = updatedTeam.status;
                team.updatedAt = new Date(updatedTeam.updatedAt);
                
                // Recarregar estatísticas do backend para garantir consistência
                this.loadStatistics();
            },
            error: (error) => {
                console.error('Erro ao alterar status da equipe:', error);
                this.alertService.showError('Erro ao alterar status da equipe');
                
                // Reverter mudança local em caso de erro
                team.status = originalStatus;
                this.updateLocalStatistics(originalStatus, newStatus);
            }
        });
    }

    /**
     * Atualiza estatísticas localmente para evitar piscadas
     */
    private updateLocalStatistics(newStatus: string, oldStatus: string): void {
        if (this.statistics) {
            if (oldStatus === 'ACTIVE' && newStatus === 'INACTIVE') {
                this.statistics.activeTeams--;
                this.statistics.inactiveTeams++;
            } else if (oldStatus === 'INACTIVE' && newStatus === 'ACTIVE') {
                this.statistics.activeTeams++;
                this.statistics.inactiveTeams--;
            }
        }
    }

    /**
     * Obtém nome do agente por ID
     */
    getAgentName(agentId: number): string {
        const agent = this.agents.find(a => a.id === agentId);
        return agent ? agent.name : 'Agente não encontrado';
    }

    /**
     * Formata horário de trabalho
     */
    formatWorkTime(team: Team): string {
        return this.teamService.formatWorkTime(team.workStartTime, team.workEndTime);
    }

    /**
     * Calcula duração do turno
     */
    calculateDuration(team: Team): string {
        const duration = this.teamService.calculateShiftDuration(team.workStartTime, team.workEndTime);
        return `${duration}h`;
    }

    /**
     * Conta agentes na equipe
     */
    getAgentsCount(team: Team): number {
        return team.agents.length;
    }

    /**
     * Formata data
     */
    formatDate(date: Date | string | undefined): string {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR');
    }

    /**
     * Marca todos os campos do formulário como touched
     */
    private markFormGroupTouched(): void {
        Object.keys(this.teamForm.controls).forEach(key => {
            const control = this.teamForm.get(key);
            control?.markAsTouched();
        });
    }

    /**
     * Verifica se o usuário é administrador
     */
    isAdministrator(): boolean {
        return this.authorizationService.isAdministrator();
    }

    /**
     * Calcula o total de equipes ativas (usando estatísticas do backend)
     */
    getActiveTeamsCount(): number {
        return this.statistics?.activeTeams || 0;
    }

    /**
     * Calcula o total de equipes inativas (usando estatísticas do backend)
     */
    getInactiveTeamsCount(): number {
        return this.statistics?.inactiveTeams || 0;
    }

    /**
     * Calcula o total de agentes em todas as equipes (usando estatísticas do backend)
     */
    getTotalAgentsCount(): number {
        return this.statistics?.totalAgents || 0;
    }

    /**
     * Obtém o total de equipes (usando estatísticas do backend)
     */
    getTotalTeamsCount(): number {
        return this.statistics?.totalTeams || 0;
    }
}
