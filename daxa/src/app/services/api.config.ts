/**
 * Configurações da API
 */
export const API_CONFIG = {
    // Base URL da API
    BASE_URL: 'http://localhost:8080/api/project_a',
    
    // Endpoints de equipes
    TEAMS: {
        BASE: '/teams',
        CREATE: '/teams',
        GET_ALL: '/teams',
        GET_BY_ID: '/teams/{id}',
        UPDATE: '/teams/{id}',
        DELETE: '/teams/{id}',
        UPDATE_STATUS: '/teams/{id}/status',
        STATISTICS: '/teams/statistics'
    },
    
    // Endpoints de agentes
    AGENTS: {
        BASE: '/agents',
        GET_ALL: '/agents',
        GET_BY_ID: '/agents/{id}',
        CREATE: '/agents',
        UPDATE: '/agents/{id}',
        DELETE: '/agents/{id}'
    },
    
    // Headers padrão
    HEADERS: {
        CONTENT_TYPE: 'application/json',
        AUTHORIZATION: 'Bearer'
    },
    
    // Configurações de paginação
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
        DEFAULT_SORT: 'name',
        DEFAULT_DIRECTION: 'asc'
    },
    
    // Timeouts
    TIMEOUTS: {
        REQUEST: 30000, // 30 segundos
        UPLOAD: 60000   // 60 segundos
    }
};
