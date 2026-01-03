import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AlertService } from '../../services/alert.service';

@Component({
    selector: 'app-alert-test',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCardModule],
    templateUrl: './alert-test.component.html',
    styleUrls: ['./alert-test.component.scss']
})
export class AlertTestComponent {

    constructor(private alertService: AlertService) {}

    /**
     * Testa diferentes tipos de alert
     */
    testSuccessAlert(): void {
        this.alertService.showSuccess('Operação realizada com sucesso!');
    }

    testErrorAlert(): void {
        this.alertService.showError('Ocorreu um erro na operação!');
    }

    testWarningAlert(): void {
        this.alertService.showWarning('Atenção! Esta ação pode ter consequências.');
    }

    testInfoAlert(): void {
        this.alertService.showInfo('Informação importante para você.');
    }

    /**
     * Testa alert com duração personalizada
     */
    testLongAlert(): void {
        this.alertService.showSuccess('Este alert ficará visível por 10 segundos!', 10000);
    }

    /**
     * Testa alert que não fecha automaticamente
     */
    testPersistentAlert(): void {
        this.alertService.showAlert('info', 'Este alert não fecha automaticamente!', 0);
    }

    /**
     * Testa alert que não pode ser fechado manualmente
     */
    testNonDismissibleAlert(): void {
        this.alertService.showAlert('warning', 'Este alert não pode ser fechado manualmente!', 8000, false);
    }

    /**
     * Limpa todos os alerts
     */
    clearAllAlerts(): void {
        this.alertService.clearAllAlerts();
    }
} 