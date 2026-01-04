/**
 * Interface que representa o payload de notificação de status de agente
 * recebido do backend via WebSocket/STOMP no tópico /topic/status-agentes
 */
export interface AgentStatusNotification {
    /**
     * ID do agente que bateu o ponto
     */
    agentId: number;

    /**
     * Nome do agente (resolvido no backend via resolveAgentName)
     */
    agentName: string;

    /**
     * Novo estado do agente
     * - ONLINE: quando o agente bateu ENTRADA
     * - OFFLINE: quando o agente bateu SAIDA
     */
    status: 'ONLINE' | 'OFFLINE';

    /**
     * Momento exato da emissão (formato ISO 8601)
     * Exemplo: "2024-01-15T10:30:00.000Z"
     */
    timestamp: string;

    /**
     * Mensagem formatada para exibição
     * Exemplo: "Agente João Silva acabou de ficar ONLINE"
     */
    message: string;
}

