import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private alertService: AlertService) {}

    /**
     * Exibe uma notificação de sucesso
     */
    showSuccess(message: string, duration: number = 3000): void {
        this.alertService.showSuccess(message, duration);
    }

    /**
     * Exibe uma notificação de erro
     */
    showError(message: string, duration: number = 5000): void {
        this.alertService.showError(message, duration);
    }

    /**
     * Exibe uma notificação de aviso
     */
    showWarning(message: string, duration: number = 4000): void {
        this.alertService.showWarning(message, duration);
    }

    /**
     * Exibe uma notificação de informação
     */
    showInfo(message: string, duration: number = 3000): void {
        this.alertService.showInfo(message, duration);
    }
} 