import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TipoTurnoService, TipoTurno } from '../../../../services/tipo-turno.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TipoTurnoEditDialogComponent } from '../../../../ui-elements/dialog/dialog-usage/tipo-turno-edit-dialog/tipo-turno-edit-dialog.component';
import { TipoTurnoCreateDialogComponent  } from '../../../../ui-elements/dialog/dialog-usage/tipo-turno-create-diolog/tipo-turno-create-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../ui-elements/dialog/dialog-usage/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomizerSettingsService } from '../../../../customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-tipo-turno',
    templateUrl: './tipo-turno.component.html',
    styleUrls: ['./tipo-turno.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        TipoTurnoEditDialogComponent,
        ConfirmDialogComponent,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTableModule,
        MatIconModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressSpinnerModule
    ]
})
export class TipoTurnoComponent implements OnInit, AfterViewInit {

    tipoTurnoForm: FormGroup;
    dataSource: MatTableDataSource<TipoTurno> = new MatTableDataSource<TipoTurno>();
    isLoading: boolean = false;
    errorMessage: string = '';
    displayedColumns: string[] = ['id', 'cod', 'descricao', 'valorJunior', 'valorSenior', 'acoes'];

    @ViewChild('paginator') paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private fb: FormBuilder,
        private tipoTurnoService: TipoTurnoService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        public themeService: CustomizerSettingsService
    ) {
        // Inicializar o formulário para criação
        this.tipoTurnoForm = this.fb.group({
            descricao: ['', [Validators.required, Validators.maxLength(100)]],
            cod: ['', [Validators.required, Validators.maxLength(3)]],
            valorJunior: [0, [Validators.required, Validators.min(0)]],
            valorSenior: [0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.loadTipoTurnos();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    // Carregar todos os tipos de turno
    loadTipoTurnos(): void {
        this.isLoading = true;
        this.tipoTurnoService.getAllTipoTurnos().subscribe({
            next: (data) => {
                this.dataSource.data = data;
                this.isLoading = false;
                // Garantir que o paginator seja configurado após os dados serem carregados
                setTimeout(() => {
                    if (this.paginator) {
                        this.dataSource.paginator = this.paginator;
                    }
                    if (this.sort) {
                        this.dataSource.sort = this.sort;
                    }
                }, 0);
            },
            error: (err) => {
                this.errorMessage = err;
                this.isLoading = false;
                this.snackBar.open(`Erro: ${err}`, 'Fechar', { duration: 5000 });
            }
        });
        this.tipoTurnoForm.reset();
    }

    // Submeter o formulário para criar um novo tipo de turno
    onSubmit(): void {
        if (this.tipoTurnoForm.invalid) {
            return;
        }

        const newTipoTurno: Partial<TipoTurno> = {
            descricao: this.tipoTurnoForm.value.descricao,
            cod: this.tipoTurnoForm.value.cod,
            valorJunior: this.tipoTurnoForm.value.valorJunior,
            valorSenior: this.tipoTurnoForm.value.valorSenior
        };

        this.tipoTurnoService.createTipoTurno(newTipoTurno).subscribe({
            next: (createdTipoTurno) => {
                this.dataSource.data = [...this.dataSource.data, createdTipoTurno]; // Reatribuir o array
                this.tipoTurnoForm.reset();
                this.snackBar.open('Tipo de turno criado com sucesso!', 'Fechar', { duration: 3000 });
            },
            error: (err) => {
                this.snackBar.open(`Erro: ${err}`, 'Fechar', { duration: 5000 });
            }
        });
    }

    openCreateDialog(): void {
        const createDialogRef = this.dialog.open(TipoTurnoCreateDialogComponent, {
            width: '450px',
            maxWidth: '90vw',
            maxHeight: '90vh'
        });

        createDialogRef.afterClosed().subscribe((createdTipoTurno: TipoTurno | undefined) => {
            if (createdTipoTurno) {
                this.loadTipoTurnos(); // Recarregar todos os dados
                this.snackBar.open('Tipo de turno criado com sucesso!', 'Fechar', { duration: 3000 });
            }
        });
    }

    // Método para deletar um tipo de turno utilizando o ConfirmDialogComponent
    deleteTipoTurno(id: number): void {
        const confirmData: ConfirmDialogData = {
            title: 'Confirmar Deleção',
            message: 'Você tem certeza que deseja deletar este Tipo de Turno?'
        };

        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '350px',
            data: confirmData
        });

        confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Usuário confirmou a deleção
                this.tipoTurnoService.deleteTipoTurno(id).subscribe({
                    next: () => {
                        this.loadTipoTurnos(); // Recarregar todos os dados
                        this.snackBar.open('Tipo de turno deletado com sucesso!', 'Fechar', { duration: 3000 });
                    },
                    error: (err) => {
                        this.snackBar.open(`Erro: ${err}`, 'Fechar', { duration: 5000 });
                    }
                });
            }
        });
    }

    // Método para abrir o diálogo de edição
    editTipoTurno(tipoTurno: TipoTurno): void {
        const editDialogRef = this.dialog.open(TipoTurnoEditDialogComponent, {
            width: '400px',
            data: { tipoTurno }
        });

        editDialogRef.afterClosed().subscribe((updatedTipoTurno: TipoTurno | undefined) => {
            if (updatedTipoTurno) {
                this.loadTipoTurnos(); // Recarregar todos os dados
                this.snackBar.open('Tipo de turno atualizado com sucesso!', 'Fechar', { duration: 3000 });
            }
        });
    }

    // Método para cancelar a criação (resetar formulário)
    cancelCreate(): void {
        this.tipoTurnoForm.reset();
    }

}
