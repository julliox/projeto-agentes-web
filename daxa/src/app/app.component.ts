import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgClass, ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { CustomizerSettingsComponent } from './customizer-settings/customizer-settings.component';
import { CustomizerSettingsService } from './customizer-settings/customizer-settings.service';
import { ToggleService } from './common/sidebar/toggle.service';
import { GlobalAlertComponent } from './components/global-alert/global-alert.component';
import { WebSocketService } from './services/websocket.service';
import { AuthenticationService } from './services/auth.service';
import { AlertService } from './services/alert.service';
import { NotificationService } from './services/notification.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule, SidebarComponent, HeaderComponent, FooterComponent, CustomizerSettingsComponent, GlobalAlertComponent, NgClass],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
    // Title
    title = 'Daxa - Angular 18 Material Design Admin Dashboard Template';

    // isSidebarToggled
    isSidebarToggled = false;

    // isToggled
    isToggled = false;

    private subscriptions: Subscription[] = [];

    constructor(
        public router: Router,
        private toggleService: ToggleService,
        private viewportScroller: ViewportScroller,
        public themeService: CustomizerSettingsService,
        private webSocketService: WebSocketService,
        private authService: AuthenticationService,
        private alertService: AlertService,
        private notificationService: NotificationService
    ) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                // Scroll to the top after each navigation end
                this.viewportScroller.scrollToPosition([0, 0]);
            }
        });
        this.toggleService.isSidebarToggled$.subscribe(isSidebarToggled => {
            this.isSidebarToggled = isSidebarToggled;
        });
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        // Verifica se o usuário já está autenticado ao inicializar
        if (this.authService.isAuthenticated()) {
            this.connectWebSocket();
        }

        // Observa mudanças no estado de autenticação
        // IMPORTANTE: Não chamar isAuthenticated() aqui para evitar loop infinito
        this.subscriptions.push(
            this.authService.currentUser$.subscribe(user => {
                console.log('👤 Estado do usuário mudou:', user ? 'Logado' : 'Deslogado');

                if (user) {
                    // Usuário logado - conectar WebSocket
                    console.log('🔌 Tentando conectar WebSocket após login...');
                    this.connectWebSocket();
                } else {
                    // Usuário deslogado - desconectar WebSocket
                    console.log('🔌 Desconectando WebSocket após logout...');
                    this.disconnectWebSocket();
                }
            })
        );

        // Observa notificações de status de agente
        console.log('👂 Configurando listener de notificações...');
        this.subscriptions.push(
            this.webSocketService.notifications$.subscribe({
                next: (notification) => {
                    console.log('📬 Observable de notificações emitiu um valor!');
                    console.log(this.authService.isAdmin());
                    if(this.authService.isAdmin()){
                        this.handleAgentStatusNotification(notification);
                    }

                },
                error: (error) => {
                    console.error('❌ Erro no observable de notificações:', error);
                },
                complete: () => {
                    console.log('✅ Observable de notificações completado');
                }
            })
        );

        // Observa mudanças no estado da conexão WebSocket
        this.subscriptions.push(
            this.webSocketService.connectionState$.subscribe(state => {
                if (state === 'ERROR') {
                    console.error('Erro na conexão WebSocket');
                }
            })
        );
    }

    /**
     * Conecta ao WebSocket se ainda não estiver conectado
     */
    private connectWebSocket(): void {
        const isConnected = this.webSocketService.isConnected();
        const connectionState = this.webSocketService.getConnectionState();

        console.log('🔍 Estado da conexão WebSocket:', {
            isConnected,
            connectionState
        });

        if (!isConnected && connectionState !== 'CONNECTING') {
            console.log('🚀 Iniciando conexão WebSocket...');
            this.webSocketService.connect()
                .then(() => {
                    console.log('✅ WebSocket conectado com sucesso no app.component');
                })
                .catch(error => {
                    console.error('❌ Erro ao conectar WebSocket:', error);
                    // Tenta reconectar após 5 segundos
                    setTimeout(() => {
                        if (this.authService.isAuthenticated()) {
                            console.log('🔄 Tentando reconectar WebSocket...');
                            this.connectWebSocket();
                        }
                    }, 5000);
                });
        } else {
            console.log('⏭️ WebSocket já está conectado ou em processo de conexão');
        }
    }

    /**
     * Desconecta do WebSocket
     */
    private disconnectWebSocket(): void {
        // Só desconecta se realmente estiver conectado
        if (this.webSocketService.isConnected()) {
            console.log('🔌 Desconectando WebSocket do app.component...');
            this.webSocketService.disconnect();
        } else {
            console.log('⏭️ WebSocket já está desconectado');
        }
    }

    /**
     * Processa notificações de status de agente recebidas via WebSocket
     */
    private handleAgentStatusNotification(notification: any): void {
        console.log('🎯 ===== NOTIFICAÇÃO RECEBIDA NO APP COMPONENT =====');
        console.log('📋 Notificação completa:', notification);
        console.log('👤 Agente:', notification.agentName);
        console.log('📊 Status:', notification.status);
        console.log('🕐 Timestamp:', notification.timestamp);
        console.log('💬 Mensagem:', notification.message);
        console.log('==================================================');

        // Adiciona notificação ao serviço de notificações (para exibir no header)
        this.notificationService.addNotification(notification);

        // Mostra notificação toast usando o AlertService (opcional)
        const message = notification.message ||
            `Agente ${notification.agentName} está ${notification.status === 'ONLINE' ? 'ONLINE' : 'OFFLINE'}`;
        // this.alertService.showInfo(message, 5000);

        // Aqui você pode adicionar lógica adicional, como:
        // - Atualizar lista de agentes em tempo real
        // - Atualizar dashboard com status atualizado
        // - Mostrar notificação push no navegador
        // - etc.
    }

    ngOnDestroy(): void {
        // Limpa todas as subscrições
        this.subscriptions.forEach(sub => sub.unsubscribe());
        // Desconecta WebSocket ao destruir o componente
        this.disconnectWebSocket();
    }
}
