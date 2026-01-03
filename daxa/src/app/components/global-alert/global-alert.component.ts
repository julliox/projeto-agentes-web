import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, AlertMessage } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-global-alert',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './global-alert.component.html',
    styleUrls: ['./global-alert.component.scss']
})
export class GlobalAlertComponent implements OnInit, OnDestroy {
    alerts: AlertMessage[] = [];
    private subscription: Subscription = new Subscription();

    constructor(private alertService: AlertService) {}

    ngOnInit(): void {
        this.subscription = this.alertService.alerts$.subscribe(alerts => {
            this.alerts = alerts;
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    /**
     * Remove um alert específico
     */
    removeAlert(alertId: string): void {
        this.alertService.removeAlert(alertId);
    }

    /**
     * Obtém a classe CSS baseada no tipo do alert
     */
    getAlertClass(alert: AlertMessage): string {
        const baseClass = 'alert';
        const typeClass = `alert-bg-${alert.type}`;
        const dismissibleClass = alert.dismissible ? 'd-flex justify-content-between align-items-center' : '';

        return [baseClass, typeClass, dismissibleClass].filter(Boolean).join(' ');
    }

    /**
     * Obtém o ícone baseado no tipo do alert
     */
    getAlertIcon(alert: AlertMessage): string {
        const icons = {
            success: 'ri-check-line',
            danger: 'ri-error-warning-line',
            warning: 'ri-alert-line',
            info: 'ri-information-line'
        };
        return icons[alert.type] || 'ri-information-line';
    }
}
