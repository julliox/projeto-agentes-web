import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdicaoSalarioService, AdicaoSalario, AdicaoSalarioCreateDTO, AdicaoSalarioUpdateDTO } from '../../../../services/adicao-salario.service';
import { TipoAdicaoService, TipoAdicao } from '../../../../services/tipo-adicao.service';
import { AgentService, Agente } from '../../../../services/agent.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomizerSettingsService } from '../../../../customizer-settings/customizer-settings.service';

export interface AdicaoSalarioFormDialogData {
    adicaoSalario?: AdicaoSalario; // Opcional: se presente, é edição; se ausente, é criação
}

@Component({
    selector: 'app-adicao-salario-form-dialog',
    templateUrl: './adicao-salario-form-dialog.component.html',
    styleUrls: ['./adicao-salario-form-dialog.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        ConfirmDialogComponent,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule
    ]
})
export class AdicaoSalarioFormDialogComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean = false;
    adicaoSalarioId?: number;
    tiposAdicao: TipoAdicao[] = [];
    agentes: Agente[] = [];
    isLoadingTipos = false;
    isLoadingAgentes = false;

    get dialogTitle(): string {
        return this.isEditMode ? 'Editar Adição de Salário' : 'Criar Adição de Salário';
    }

    get submitButtonText(): string {
        return this.isEditMode ? 'Atualizar' : 'Criar';
    }

    get confirmTitle(): string {
        return this.isEditMode ? 'Confirmar Atualização' : 'Confirmar Criação';
    }

    get confirmMessage(): string {
        return this.isEditMode 
            ? 'Você tem certeza que deseja atualizar esta Adição de Salário?'
            : 'Você tem certeza que deseja criar esta Adição de Salário?';
    }

    get successMessage(): string {
        return this.isEditMode 
            ? 'Adição de salário atualizada com sucesso!'
            : 'Adição de salário criada com sucesso!';
    }

    constructor(
        private fb: FormBuilder,
        private adicaoSalarioService: AdicaoSalarioService,
        private tipoAdicaoService: TipoAdicaoService,
        private agentService: AgentService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<AdicaoSalarioFormDialogComponent>,
        private dialog: MatDialog,
        @Optional() @Inject(MAT_DIALOG_DATA) public data?: AdicaoSalarioFormDialogData,
        public themeService?: CustomizerSettingsService
    ) {
        // Detectar modo: se data.adicaoSalario existir e tiver ID, é edição
        this.isEditMode = !!(data?.adicaoSalario?.id);
        this.adicaoSalarioId = data?.adicaoSalario?.id;

        // Definir mês atual como padrão (formato YYYY-MM)
        const today = new Date();
        const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

        if (this.isEditMode) {
            // Modo edição: campos opcionais
            this.form = this.fb.group({
                tipoAdicaoId: [''],
                qtyAdicao: [0, [Validators.min(0.01)]],
                mesAdicao: ['', [Validators.pattern(/^\d{4}-\d{2}$/)]]
            });
        } else {
            // Modo criação: campos obrigatórios
            this.form = this.fb.group({
                tipoAdicaoId: ['', Validators.required],
                qtyAdicao: [0, [Validators.required, Validators.min(0.01)]],
                mesAdicao: [defaultMonth, [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)]],
                agentId: ['', Validators.required]
            });
        }
    }

    ngOnInit(): void {
        this.loadTiposAdicao();
        
        // Carregar agentes apenas no modo criação
        if (!this.isEditMode) {
            this.loadAgentes();
        }

        // Se for edição, preencher o formulário com os dados existentes
        if (this.isEditMode && this.data?.adicaoSalario) {
            this.form.patchValue({
                tipoAdicaoId: this.data.adicaoSalario.tipoAdicao.id,
                qtyAdicao: this.data.adicaoSalario.qtyAdicao,
                mesAdicao: this.data.adicaoSalario.mesAdicao
            });
        }
    }

    loadTiposAdicao(): void {
        this.isLoadingTipos = true;
        this.tipoAdicaoService.getAll().subscribe({
            next: (data) => {
                this.tiposAdicao = data;
                this.isLoadingTipos = false;
            },
            error: (err) => {
                this.isLoadingTipos = false;
                this.snackBar.open('Erro ao carregar tipos de adição', 'Fechar', { duration: 3000 });
            }
        });
    }

    loadAgentes(): void {
        this.isLoadingAgentes = true;
        this.agentService.getAgents().subscribe({
            next: (data) => {
                this.agentes = data;
                this.isLoadingAgentes = false;
            },
            error: (err) => {
                this.isLoadingAgentes = false;
                this.snackBar.open('Erro ao carregar agentes', 'Fechar', { duration: 3000 });
            }
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.markFormGroupTouched(this.form);
            return;
        }

        const confirmData: ConfirmDialogData = {
            title: this.confirmTitle,
            message: this.confirmMessage
        };

        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '350px',
            data: confirmData
        });

        confirmDialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                if (this.isEditMode && this.adicaoSalarioId) {
                    // Modo edição: apenas campos que foram alterados
                    const updatedData: AdicaoSalarioUpdateDTO = {};
                    
                    if (this.form.value.tipoAdicaoId) {
                        updatedData.tipoAdicaoId = Number(this.form.value.tipoAdicaoId);
                    }
                    if (this.form.value.qtyAdicao !== null && this.form.value.qtyAdicao !== undefined && this.form.value.qtyAdicao !== 0) {
                        updatedData.qtyAdicao = Number(this.form.value.qtyAdicao);
                    }
                    if (this.form.value.mesAdicao) {
                        updatedData.mesAdicao = this.form.value.mesAdicao;
                    }

                    this.adicaoSalarioService.update(this.adicaoSalarioId, updatedData).subscribe({
                        next: (updatedAdicaoSalario: AdicaoSalario) => {
                            this.snackBar.open(this.successMessage, 'Fechar', { duration: 3000 });
                            this.dialogRef.close(updatedAdicaoSalario);
                        },
                        error: (err: any) => {
                            const errorMsg = err.error?.message || err.message || 'Erro ao atualizar adição de salário';
                            this.snackBar.open(`Erro: ${errorMsg}`, 'Fechar', { duration: 5000 });
                        }
                    });
                } else {
                    // Modo criação
                    const newAdicaoSalario: AdicaoSalarioCreateDTO = {
                        tipoAdicaoId: Number(this.form.value.tipoAdicaoId),
                        qtyAdicao: Number(this.form.value.qtyAdicao),
                        mesAdicao: this.form.value.mesAdicao,
                        agentId: Number(this.form.value.agentId)
                    };

                    this.adicaoSalarioService.create(newAdicaoSalario).subscribe({
                        next: (createdAdicaoSalario: AdicaoSalario) => {
                            this.snackBar.open(this.successMessage, 'Fechar', { duration: 3000 });
                            this.dialogRef.close(createdAdicaoSalario);
                        },
                        error: (err: any) => {
                            const errorMsg = err.error?.message || err.message || 'Erro ao criar adição de salário';
                            this.snackBar.open(`Erro: ${errorMsg}`, 'Fechar', { duration: 5000 });
                        }
                    });
                }
            }
        });
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
