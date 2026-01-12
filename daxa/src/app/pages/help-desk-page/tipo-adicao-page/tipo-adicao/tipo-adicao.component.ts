import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TipoAdicaoService, TipoAdicao } from '../../../../services/tipo-adicao.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TipoAdicaoFormDialogComponent } from '../../../../ui-elements/dialog/dialog-usage/tipo-adicao-form-dialog/tipo-adicao-form-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../ui-elements/dialog/dialog-usage/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomizerSettingsService } from '../../../../customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-tipo-adicao',
    templateUrl: './tipo-adicao.component.html',
    styleUrls: ['./tipo-adicao.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        TipoAdicaoFormDialogComponent,
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
export class TipoAdicaoComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<TipoAdicao> = new MatTableDataSource<TipoAdicao>();
    isLoading: boolean = false;
    errorMessage: string = '';
    displayedColumns: string[] = ['id', 'desTipoAdicao', 'acoes'];

    @ViewChild('paginator') paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private fb: FormBuilder,
        private tipoAdicaoService: TipoAdicaoService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        public themeService: CustomizerSettingsService
    ) {}

    ngOnInit(): void {
        this.loadTipoAdicoes();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    // Carregar todos os tipos de adição
    loadTipoAdicoes(): void {
        this.isLoading = true;
        this.tipoAdicaoService.getAll().subscribe({
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
                const errorMsg = err.error?.message || err.message || 'Erro ao carregar tipos de adição';
                this.errorMessage = errorMsg;
                this.isLoading = false;
                this.snackBar.open(`Erro: ${errorMsg}`, 'Fechar', { duration: 5000 });
            }
        });
    }

    openCreateDialog(): void {
        const formDialogRef = this.dialog.open(TipoAdicaoFormDialogComponent, {
            width: '450px',
            maxWidth: '90vw',
            maxHeight: '90vh'
        });

        formDialogRef.afterClosed().subscribe((result: TipoAdicao | undefined) => {
            if (result) {
                this.loadTipoAdicoes();
            }
        });
    }

    // Método para deletar um tipo de adição
    deleteTipoAdicao(id: number): void {
        const confirmData: ConfirmDialogData = {
            title: 'Confirmar Deleção',
            message: 'Você tem certeza que deseja deletar este Tipo de Adição?'
        };

        const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '350px',
            data: confirmData
        });

        confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.tipoAdicaoService.delete(id).subscribe({
                    next: () => {
                        this.loadTipoAdicoes();
                        this.snackBar.open('Tipo de adição deletado com sucesso!', 'Fechar', { duration: 3000 });
                    },
                    error: (err) => {
                        const errorMsg = err.error?.message || err.message || 'Erro ao deletar tipo de adição';
                        this.snackBar.open(`Erro: ${errorMsg}`, 'Fechar', { duration: 5000 });
                    }
                });
            }
        });
    }

    // Método para abrir o diálogo de edição
    editTipoAdicao(tipoAdicao: TipoAdicao): void {
        const formDialogRef = this.dialog.open(TipoAdicaoFormDialogComponent, {
            width: '450px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            data: { tipoAdicao }
        });

        formDialogRef.afterClosed().subscribe((result: TipoAdicao | undefined) => {
            if (result) {
                this.loadTipoAdicoes();
            }
        });
    }
}
