export const environment = {
    production: false,
    local: false,
    // backend: 'http://localhost:8080',
    apiUrl: 'http://localhost:8080/api/project_a',
    // apiUrl: 'https://sga-api.linux.4qualitytecnologia.com.br/api/sga',
    // uriBase: '/',
    // apiUrlBKP: '/api/sga/',
    // WebSocket configuration
    // IMPORTANTE: Incluir o context-path /api/project_a na URL
    wsUrl: 'http://localhost:8080/api/project_a/ws-notificacoes',
    wsTopic: '/topic/status-agentes',
};
