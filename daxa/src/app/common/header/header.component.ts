import {NgClass, NgForOf, NgIf} from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { ToggleService } from '../sidebar/toggle.service';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { AuthenticationService } from "../../services/auth.service";
import { AuthorizationService } from '../../services/authorization.service';
import { NotificationService, StoredNotification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [NgClass, NgIf, MatMenuModule, MatButtonModule, RouterLink, RouterLinkActive, NgForOf],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {

    // isSidebarToggled
    isSidebarToggled = false;

    // isToggled
    isToggled = false;

    // Informações do usuário
    currentUserName: string | null = null;
    currentUserEmail: string | null = null;
    currentUserProfile: any = null;

    // Notificações
    notifications: StoredNotification[] = [];
    unreadCount: number = 0;
    private subscriptions: Subscription[] = [];

    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        private authService: AuthenticationService,
        private authorizationService: AuthorizationService,
        private notificationService: NotificationService
    ) {
        this.toggleService.isSidebarToggled$.subscribe(isSidebarToggled => {
            this.isSidebarToggled = isSidebarToggled;
        });
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.loadUserInfo();
        this.loadNotifications();
    }

    /**
     * Carrega notificações do serviço
     */
    private loadNotifications(): void {
        // Subscreve às notificações
        this.subscriptions.push(
            this.notificationService.notifications$.subscribe(notifications => {
                this.notifications = notifications;
            })
        );

        // Subscreve ao contador de não lidas
        this.subscriptions.push(
            this.notificationService.unreadCount$.subscribe(count => {
                this.unreadCount = count;
            })
        );
    }

    /**
     * Formata a data para exibição relativa (ex: "2 hrs ago", "1 day ago")
     */
    getRelativeTime(timestamp: string): string {
        const now = new Date();
        const date = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'agora';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
        }
    }

    /**
     * Marca uma notificação como lida
     */
    markAsRead(notificationId: string): void {
        this.notificationService.markAsRead(notificationId);
    }

    /**
     * Marca todas as notificações como lidas
     */
    markAllAsRead(): void {
        this.notificationService.markAllAsRead();
    }

    /**
     * Limpa todas as notificações
     */
    clearAll(): void {
        this.notificationService.clearAll();
    }

    /**
     * Quando o menu de notificações é aberto, marca todas como lidas
     */
    onNotificationsMenuOpened(): void {
        if (this.unreadCount > 0) {
            this.markAllAsRead();
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    /**
     * Carrega informações do usuário atual
     */
    private loadUserInfo(): void {
        this.currentUserName = this.authorizationService.getCurrentUserName();
        this.currentUserEmail = this.authorizationService.getCurrentUserEmail();
        this.currentUserProfile = this.authorizationService.getCurrentUserProfile();
    }

    /**
     * Verifica se o usuário pode acessar uma rota específica
     */
    canAccessRoute(route: string): boolean {
        return this.authorizationService.canAccessRoute(route);
    }

    /**
     * Verifica se o usuário é administrador
     */
    isAdministrator(): boolean {
        return this.authorizationService.isAdministrator();
    }

    // Burger Menu Toggle
    toggle() {
        this.toggleService.toggle();
    }

    // Header Sticky
    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    // Dark Mode
    toggleTheme() {
        this.themeService.toggleTheme();
    }

    logout() {
        this.authService.logout();
    }
}
