import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TipoAdicaoService, TipoAdicao, TipoAdicaoCreateDTO } from '../../../../services/tipo-adicao.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomizerSettingsService } from '../../../../customizer-settings/customizer-settings.service';

export interface TipoAdicaoFormDialogData {
    tipoAdicao?: TipoAdicao; // Opcional: se presente, é edição; se ausente, é criação
}

@Component({
    selector: 'app-tipo-adicao-form-dialog',
    templateUrl: './tipo-adicao-form-dialog.component.html',
    styleUrls: ['./tipo-adicao-form-dialog.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        ConfirmDialogComponent,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ]
})
export class TipoAdicaoFormDialogComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean = false;
    tipoAdicaoId?: number;

    get dialogTitle(): string {
        return this.isEditMode ? 'Editar Tipo de Adição' : 'Criar Tipo de Adição';
    }

    get submitButtonText(): string {
        return this.isEditMode ? 'Atualizar' : 'Criar';
    }

    get confirmTitle(): string {
        return this.isEditMode ? 'Confirmar Atualização' : 'Confirmar Criação';
    }

    get confirmMessage(): string {
        return this.isEditMode 
            ? 'Você tem certeza que deseja atualizar este Tipo de Adição?'
            : 'Você tem certeza que deseja criar este Tipo de Adição?';
    }

    get successMessage(): string {
        return this.isEditMode 
            ? 'Tipo de adição atualizado com sucesso!'
            : 'Tipo de adição criado com sucesso!';
    }

    constructor(
        private fb: FormBuilder,
        private tipoAdicaoService: TipoAdicaoService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<TipoAdicaoFormDialogComponent>,
        private dialog: MatDialog,
        @Optional() @Inject(MAT_DIALOG_DATA) public data?: TipoAdicaoFormDialogData,
        public themeService?: CustomizerSettingsService
    ) {
        // Detectar modo: se data.tipoAdicao existir e tiver ID, é edição
        this.isEditMode = !!(data?.tipoAdicao?.id);
        this.tipoAdicaoId = data?.tipoAdicao?.id;

        this.form = this.fb.group({
            desTipoAdicao: ['', [Validators.required, Validators.maxLength(100)]]
        });
    }

    ngOnInit(): void {
        // Se for edição, preencher o formulário com os dados existentes
        if (this.isEditMode && this.data?.tipoAdicao) {
            this.form.patchValue({
                desTipoAdicao: this.data.tipoAdicao.desTipoAdicao
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.markFormGroupTouched(this.form);
            return;
        }

        const formData: TipoAdicaoCreateDTO = {
            desTipoAdicao: this.form.value.desTipoAdicao
        };

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
                if (this.isEditMode && this.tipoAdicaoId) {
                    // Modo edição
                    this.tipoAdicaoService.update(this.tipoAdicaoId, formData).subscribe({
                        next: (updatedTipoAdicao: TipoAdicao) => {
                            this.snackBar.open(this.successMessage, 'Fechar', { duration: 3000 });
                            this.dialogRef.close(updatedTipoAdicao);
                        },
                        error: (err: any) => {
                            const errorMsg = err.error?.message || err.message || 'Erro ao atualizar tipo de adição';
                            this.snackBar.open(`Erro: ${errorMsg}`, 'Fechar', { duration: 5000 });
                        }
                    });
                } else {
                    // Modo criação
                    this.tipoAdicaoService.create(formData).subscribe({
                        next: (createdTipoAdicao: TipoAdicao) => {
                            this.snackBar.open(this.successMessage, 'Fechar', { duration: 3000 });
                            this.dialogRef.close(createdTipoAdicao);
                        },
                        error: (err: any) => {
                            const errorMsg = err.error?.message || err.message || 'Erro ao criar tipo de adição';
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
