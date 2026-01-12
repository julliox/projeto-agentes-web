import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AdicaoSalarioService, AdicaoSalario } from '../../../../services/adicao-salario.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdicaoSalarioFormDialogComponent } from '../../../../ui-elements/dialog/dialog-usage/adicao-salario-form-dialog/adicao-salario-form-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../ui-elements/dialog/dialog-usage/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomizerSettingsService } from '../../../../customizer-settings/customizer-settings.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-adicao-salario',
    templateUrl: './adicao-salario.component.html',
    styleUrls: ['./adicao-salario.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        AdicaoSalarioFormDialogComponent,
        ConfirmDialogComponent,
        MatCardModule,
        MatButtonModule,
        MatTableModule,
        MatIconModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressSpinnerModule,
        RouterLink
    ]
})
export class AdicaoSalarioComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<AdicaoSalario> = new MatTableDataSource<AdicaoSalario>();
    isLoading: boolean = false;
    errorMessage: string = '';
    displayedColumns: string[] = ['id', 'tipoAdicao', 'qtyAdicao', 'mesAdicao', 'nomeAgente', 'acoes'];

    @ViewChild('paginator') paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private adicaoSalarioService: AdicaoSalarioService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        public themeService: CustomizerSettingsService
    ) {}

    ngOnInit(): void {
        this.loadAdicoesSalario();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    // Carregar todas as adições de salário
    loadAdicoesSalario(): void {
        this.isLoading = true;
        this.adicaoSalarioService.getAll().subscribe({
            next: (data) => {
                this.dataSource.data = data;
                this.isLoading = false;
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
                const errorMsg = err.error?.message || err.message || 'Erro ao carregar adições de salário';
                this.errorMessage = errorMsg;
                this.isLoading = false;
                this.snackBar.open(`Erro: ${errorMsg}`, 'Fechar', { duration: 5000 });
            }
        });
    }

    openCreateDialog(): void {
        const formDialogRef = this.dialog.open(AdicaoSalarioFormDialogComponent, {
            width: '550px',
            maxWidth: '90vw',
            maxHeight: '90vh'
        });

        formDialogRef.afterClosed().subscribe((result: AdicaoSalario | undefined) => {
            if (result) {
                this.loadAdicoesSalario();
            }
        });
    }

    // Método para deletar uma adição de salário
    deleteAdicaoSalario(id: number): void {
        const confirmData: ConfirmDialogData = {
            title: 'Confirmar Deleção',
            message: 'Você tem certeza que deseja deletar esta Adição de Salário?'
        };

        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '350px',
            data: confirmData
        });

        confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.adicaoSalarioService.delete(id).subscribe({
                    next: () => {
                        this.loadAdicoesSalario();
                        this.snackBar.open('Adição de salário deletada com sucesso!', 'Fechar', { duration: 3000 });
                    },
                    error: (err) => {
                        const errorMsg = err.error?.message || err.message || 'Erro ao deletar adição de salário';
                        this.snackBar.open(`Erro: ${errorMsg}`, 'Fechar', { duration: 5000 });
                    }
                });
            }
        });
    }

    // Método para abrir o diálogo de edição
    editAdicaoSalario(adicaoSalario: AdicaoSalario): void {
        const formDialogRef = this.dialog.open(AdicaoSalarioFormDialogComponent, {
            width: '550px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            data: { adicaoSalario }
        });

        formDialogRef.afterClosed().subscribe((result: AdicaoSalario | undefined) => {
            if (result) {
                this.loadAdicoesSalario();
            }
        });
    }
}
