import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';
import { AgentStatusNotification } from '../models/agent-status-notification.model';

/**
 * Estados possíveis da conexão WebSocket
 */
export enum WebSocketConnectionState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTING = 'DISCONNECTING',
    ERROR = 'ERROR'
}

/**
 * Serviço responsável por gerenciar a conexão WebSocket/STOMP
 * para receber notificações em tempo real do backend Spring Boot
 */
@Injectable({
    providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
    private stompClient: Client | null = null;
    private connectionStateSubject = new BehaviorSubject<WebSocketConnectionState>(
        WebSocketConnectionState.DISCONNECTED
    );
    private notificationSubject = new Subject<AgentStatusNotification>();
    
    /**
     * Observable que emite o estado atual da conexão
     */
    public connectionState$: Observable<WebSocketConnectionState> = 
        this.connectionStateSubject.asObservable();

    /**
     * Observable que emite as notificações de status de agente
     */
    public notifications$: Observable<AgentStatusNotification> = 
        this.notificationSubject.asObservable();

    constructor() {}

    /**
     * Conecta ao servidor WebSocket e subscreve ao tópico de notificações
     * @returns Promise que resolve quando a conexão é estabelecida
     */
    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Se já estiver conectado, não faz nada
            if (this.stompClient?.active) {
                resolve();
                return;
            }

            // Se estiver em processo de conexão, aguarda
            if (this.connectionStateSubject.value === WebSocketConnectionState.CONNECTING) {
                // Aguarda até que a conexão seja estabelecida ou falhe
                const subscription = this.connectionState$.subscribe(state => {
                    if (state === WebSocketConnectionState.CONNECTED) {
                        subscription.unsubscribe();
                        resolve();
                    } else if (state === WebSocketConnectionState.ERROR) {
                        subscription.unsubscribe();
                        reject(new Error('Falha ao conectar ao WebSocket'));
                    }
                });
                return;
            }

            this.connectionStateSubject.next(WebSocketConnectionState.CONNECTING);

            // Cria o cliente STOMP com SockJS como transporte
            this.stompClient = new Client({
                brokerURL: environment.wsUrl,
                webSocketFactory: () => {
                    console.log('🔌 Criando conexão SockJS para:', environment.wsUrl);
                    return new SockJS(environment.wsUrl) as any;
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                debug: (str) => {
                    // Em produção, você pode remover ou usar um logger
                    if (!environment.production) {
                        console.log('STOMP:', str);
                    }
                },
                onConnect: (frame) => {
                    console.log('✅ WebSocket conectado com sucesso! Frame:', frame);
                    this.connectionStateSubject.next(WebSocketConnectionState.CONNECTED);
                    this.subscribeToNotifications();
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('❌ Erro STOMP:', frame);
                    this.connectionStateSubject.next(WebSocketConnectionState.ERROR);
                    reject(new Error(`Erro STOMP: ${frame.headers['message'] || 'Erro desconhecido'}`));
                },
                onWebSocketError: (event) => {
                    console.error('❌ Erro WebSocket:', event);
                    this.connectionStateSubject.next(WebSocketConnectionState.ERROR);
                    reject(new Error('Erro ao estabelecer conexão WebSocket'));
                },
                onDisconnect: () => {
                    console.log('🔌 WebSocket desconectado');
                    this.connectionStateSubject.next(WebSocketConnectionState.DISCONNECTED);
                },
                // Callback quando o cliente é marcado como inativo
                beforeConnect: () => {
                    console.log('🔄 Preparando para conectar...');
                }
            });

            // Ativa a conexão
            console.log('🚀 Ativando cliente STOMP...');
            this.stompClient.activate();
        });
    }

    /**
     * Subscreve ao tópico de notificações de status de agente
     */
    private subscribeToNotifications(): void {
        if (!this.stompClient?.active) {
            console.warn('Tentativa de subscrever sem conexão ativa');
            return;
        }

        console.log('🔔 Subscrevendo ao tópico:', environment.wsTopic);
        
        const subscription = this.stompClient.subscribe(environment.wsTopic, (message: IMessage) => {
            try {
                console.log('📨 Mensagem RAW recebida do WebSocket:', message.body);
                const notification: AgentStatusNotification = JSON.parse(message.body);
                console.log('✅ Notificação parseada com sucesso:', notification);
                console.log('📊 Detalhes da notificação:', {
                    agentId: notification.agentId,
                    agentName: notification.agentName,
                    status: notification.status,
                    timestamp: notification.timestamp,
                    message: notification.message
                });
                this.notificationSubject.next(notification);
            } catch (error) {
                console.error('❌ Erro ao processar notificação:', error);
                console.error('📄 Mensagem recebida (raw):', message.body);
            }
        });

        console.log('✅ Subscrição criada com sucesso. ID:', subscription.id);
    }

    /**
     * Desconecta do servidor WebSocket
     */
    public disconnect(): void {
        if (this.stompClient) {
            console.log('🔌 Desconectando WebSocket...');
            this.connectionStateSubject.next(WebSocketConnectionState.DISCONNECTING);
            if (this.stompClient.active) {
                this.stompClient.deactivate();
            }
            this.stompClient = null;
            this.connectionStateSubject.next(WebSocketConnectionState.DISCONNECTED);
            console.log('✅ WebSocket desconectado');
        }
    }

    /**
     * Verifica se está conectado
     */
    public isConnected(): boolean {
        return this.stompClient?.active === true;
    }

    /**
     * Obtém o estado atual da conexão
     */
    public getConnectionState(): WebSocketConnectionState {
        return this.connectionStateSubject.value;
    }

    /**
     * Limpa recursos ao destruir o serviço
     */
    ngOnDestroy(): void {
        this.disconnect();
        this.notificationSubject.complete();
        this.connectionStateSubject.complete();
    }
}

