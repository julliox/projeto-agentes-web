import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AlertMessage {
    id: string;
    type: 'success' | 'danger' | 'warning' | 'info';
    message: string;
    duration?: number; // em milissegundos, se não definido não fecha automaticamente
    dismissible?: boolean; // se pode ser fechado manualmente
}

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private alertsSubject = new BehaviorSubject<AlertMessage[]>([]);
    public alerts$ = this.alertsSubject.asObservable();

    constructor() {}

    /**
     * Mostra um alert
     * @param type - Tipo do alert ('success', 'error', 'warning', 'info')
     * @param message - Mensagem a ser exibida
     * @param duration - Duração em milissegundos (opcional, padrão: 5000ms)
     * @param dismissible - Se pode ser fechado manualmente (opcional, padrão: true)
     */
    showAlert(type: 'success' | 'danger' | 'warning' | 'info', message: string, duration?: number, dismissible: boolean = true): void {
        const alert: AlertMessage = {
            id: this.generateId(),
            type,
            message,
            duration: duration || 5000,
            dismissible
        };

        const currentAlerts = this.alertsSubject.value;
        this.alertsSubject.next([...currentAlerts, alert]);

        // Auto-remove após a duração especificada
        if (alert.duration && alert.duration > 0) {
            setTimeout(() => {
                this.removeAlert(alert.id);
            }, alert.duration);
        }
    }

    /**
     * Métodos de conveniência para cada tipo de alert
     */
    showSuccess(message: string, duration?: number, dismissible: boolean = true): void {
        this.showAlert('success', message, duration, dismissible);
    }

    showError(message: string, duration?: number, dismissible: boolean = true): void {
        this.showAlert('danger', message, duration, dismissible);
    }

    showWarning(message: string, duration?: number, dismissible: boolean = true): void {
        this.showAlert('warning', message, duration, dismissible);
    }

    showInfo(message: string, duration?: number, dismissible: boolean = true): void {
        this.showAlert('info', message, duration, dismissible);
    }

    /**
     * Remove um alert específico
     */
    removeAlert(alertId: string): void {
        const currentAlerts = this.alertsSubject.value;
        const filteredAlerts = currentAlerts.filter(alert => alert.id !== alertId);
        this.alertsSubject.next(filteredAlerts);
    }

    /**
     * Remove todos os alerts
     */
    clearAllAlerts(): void {
        this.alertsSubject.next([]);
    }

    /**
     * Gera um ID único para o alert
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Obtém os alerts atuais
     */
    getCurrentAlerts(): AlertMessage[] {
        return this.alertsSubject.value;
    }
}
