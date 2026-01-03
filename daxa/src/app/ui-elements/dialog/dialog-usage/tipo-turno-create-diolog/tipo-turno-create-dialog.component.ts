import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TipoTurnoService, TipoTurno } from '../../../../services/tipo-turno.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog} from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomizerSettingsService } from '../../../../customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-tipo-turno-create-dialog',
    templateUrl: './tipo-turno-create-dialog.component.html',
    styleUrls: ['./tipo-turno-create-dialog.component.scss'],
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
export class TipoTurnoCreateDialogComponent {
    createForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private tipoTurnoService: TipoTurnoService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<TipoTurnoCreateDialogComponent>,
        private dialog: MatDialog,
        public themeService: CustomizerSettingsService
    ) {
        this.createForm = this.fb.group({
            descricao: ['', [Validators.required, Validators.maxLength(100)]],
            cod: ['', [Validators.required, Validators.maxLength(3)]],
            valorJunior: [0, [Validators.required, Validators.min(0)]],
            valorSenior: [0, [Validators.required, Validators.min(0)]]
        });
    }

    onSubmit(): void {
        if (this.createForm.invalid) {
            return;
        }

        const newTipoTurno: Partial<TipoTurno> = {
            descricao: this.createForm.value.descricao,
            cod: this.createForm.value.cod,
            valorJunior: this.createForm.value.valorJunior,
            valorSenior: this.createForm.value.valorSenior
        };

        // Abrir diálogo de confirmação antes de criar
        const confirmData: ConfirmDialogData = {
            title: 'Confirmar Criação',
            message: 'Você tem certeza que deseja criar este Tipo de Turno?'
        };

        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '350px',
            data: confirmData
        });

        confirmDialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                // Usuário confirmou a criação
                this.tipoTurnoService.createTipoTurno(newTipoTurno).subscribe({
                    next: (createdTipoTurno: any) => {
                        this.snackBar.open('Tipo de turno criado com sucesso!', 'Fechar', { duration: 3000 });
                        this.dialogRef.close(createdTipoTurno); // Envia o objeto criado para o componente pai
                    },
                    error: (err: any) => {
                        this.snackBar.open(`Erro: ${err}`, 'Fechar', { duration: 5000 });
                    }
                });
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
