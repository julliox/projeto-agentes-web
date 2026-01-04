import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AgentStatusNotification } from '../models/agent-status-notification.model';

/**
 * Interface para notificação armazenada com estado de leitura
 */
export interface StoredNotification extends AgentStatusNotification {
    id: string;
    read: boolean;
    readAt?: string;
}

/**
 * Serviço responsável por gerenciar notificações recebidas via WebSocket
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<StoredNotification[]>([]);
    public notifications$: Observable<StoredNotification[]> = this.notificationsSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

    private maxNotifications = 50; // Máximo de notificações armazenadas

    constructor() {
        // Carrega notificações do localStorage ao inicializar
        this.loadFromLocalStorage();
    }

    /**
     * Adiciona uma nova notificação
     */
    addNotification(notification: AgentStatusNotification): void {
        const storedNotification: StoredNotification = {
            ...notification,
            id: this.generateId(),
            read: false
        };

        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = [storedNotification, ...currentNotifications];

        // Limita o número de notificações
        if (updatedNotifications.length > this.maxNotifications) {
            updatedNotifications.splice(this.maxNotifications);
        }

        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount();
        this.saveToLocalStorage();
    }

    /**
     * Marca uma notificação como lida
     */
    markAsRead(notificationId: string): void {
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.map(notification => {
            if (notification.id === notificationId && !notification.read) {
                return {
                    ...notification,
                    read: true,
                    readAt: new Date().toISOString()
                };
            }
            return notification;
        });

        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount();
        this.saveToLocalStorage();
    }

    /**
     * Marca todas as notificações como lidas
     */
    markAllAsRead(): void {
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.map(notification => ({
            ...notification,
            read: true,
            readAt: notification.read ? notification.readAt : new Date().toISOString()
        }));

        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount();
        this.saveToLocalStorage();
    }

    /**
     * Remove uma notificação
     */
    removeNotification(notificationId: string): void {
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);

        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount();
        this.saveToLocalStorage();
    }

    /**
     * Remove todas as notificações
     */
    clearAll(): void {
        this.notificationsSubject.next([]);
        this.updateUnreadCount();
        this.saveToLocalStorage();
    }

    /**
     * Obtém todas as notificações
     */
    getNotifications(): StoredNotification[] {
        return this.notificationsSubject.value;
    }

    /**
     * Obtém notificações não lidas
     */
    getUnreadNotifications(): StoredNotification[] {
        return this.notificationsSubject.value.filter(n => !n.read);
    }

    /**
     * Obtém contador de não lidas
     */
    getUnreadCount(): number {
        return this.unreadCountSubject.value;
    }

    /**
     * Atualiza o contador de não lidas
     */
    private updateUnreadCount(): void {
        const unreadCount = this.getUnreadNotifications().length;
        this.unreadCountSubject.next(unreadCount);
    }

    /**
     * Gera um ID único para a notificação
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Salva notificações no localStorage
     */
    private saveToLocalStorage(): void {
        try {
            const notifications = this.notificationsSubject.value;
            localStorage.setItem('notifications', JSON.stringify(notifications));
        } catch (error) {
            console.error('Erro ao salvar notificações no localStorage:', error);
        }
    }

    /**
     * Carrega notificações do localStorage
     */
    private loadFromLocalStorage(): void {
        try {
            const stored = localStorage.getItem('notifications');
            if (stored) {
                const notifications: StoredNotification[] = JSON.parse(stored);
                this.notificationsSubject.next(notifications);
                this.updateUnreadCount();
            }
        } catch (error) {
            console.error('Erro ao carregar notificações do localStorage:', error);
        }
    }
}

