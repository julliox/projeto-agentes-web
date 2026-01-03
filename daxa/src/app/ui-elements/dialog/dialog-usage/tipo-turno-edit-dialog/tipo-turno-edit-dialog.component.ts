import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TipoTurnoService, TipoTurno } from '../../../../services/tipo-turno.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog} from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface TipoTurnoEditDialogData {
    tipoTurno: TipoTurno;
}

@Component({
    selector: 'app-tipo-turno-edit-dialog',
    templateUrl: './tipo-turno-edit-dialog.component.html',
    styleUrls: ['./tipo-turno-edit-dialog.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        ConfirmDialogComponent,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class TipoTurnoEditDialogComponent implements OnInit {
    editForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private tipoTurnoService: TipoTurnoService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<TipoTurnoEditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TipoTurnoEditDialogData,
        private dialog: MatDialog
    ) {
        this.editForm = this.fb.group({
            descricao: ['', [Validators.required, Validators.maxLength(100)]],
            cod: ['', [Validators.required, Validators.maxLength(3)]],
            valorJunior: [0, [Validators.required, Validators.min(0)]],
            valorSenior: [0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.editForm.patchValue({
            descricao: this.data.tipoTurno.descricao,
            cod: this.data.tipoTurno.cod,
            valorJunior: this.data.tipoTurno.valorJunior,
            valorSenior: this.data.tipoTurno.valorSenior
        });
    }

    onSubmit(): void {
        if (this.editForm.invalid) {
            return;
        }

        const updatedTipoTurno: Partial<TipoTurno> = {
            descricao: this.editForm.value.descricao,
            cod: this.editForm.value.cod,
            valorJunior: this.editForm.value.valorJunior,
            valorSenior: this.editForm.value.valorSenior
        };

        // Abrir diálogo de confirmação antes de atualizar
        const confirmData: ConfirmDialogData = {
            title: 'Confirmar Atualização',
            message: 'Você tem certeza que deseja atualizar este Tipo de Turno?'
        };

        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '350px',
            data: confirmData
        });

        confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Usuário confirmou a atualização
                this.tipoTurnoService.updateTipoTurno(this.data.tipoTurno.id, updatedTipoTurno).subscribe({
                    next: (updatedTT) => {
                        this.snackBar.open('Tipo de turno atualizado com sucesso!', 'Fechar', { duration: 3000 });
                        this.dialogRef.close(updatedTT); // Envia o objeto atualizado para o componente pai
                    },
                    error: (err) => {
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
