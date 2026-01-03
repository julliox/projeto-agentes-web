# Componente de Gerenciamento de Equipes

## 📋 Visão Geral

O componente `TeamsPageComponent` fornece uma interface completa para gerenciar equipes de trabalho no sistema Daxa. Ele permite criar, editar, visualizar e remover equipes, além de gerenciar os agentes associados a cada equipe.

## 🚀 Funcionalidades

### ✅ CRUD Completo
- **Criar**: Nova equipe com nome, horários e agentes
- **Ler**: Lista todas as equipes com filtros e paginação
- **Atualizar**: Editar informações de equipes existentes
- **Deletar**: Remover equipes do sistema

### 🕐 Gerenciamento de Horários
- **Horário de Início**: Define quando a equipe começa a trabalhar
- **Horário de Fim**: Define quando a equipe termina o trabalho
- **Validação**: Verifica se os horários são válidos (incluindo turnos noturnos)
- **Cálculo Automático**: Duração do turno calculada automaticamente

### 👥 Gestão de Agentes
- **Seleção Múltipla**: Escolher vários agentes para uma equipe
- **Integração**: Usa o `AgentService` existente para buscar agentes
- **Validação**: Mínimo de 1 agente por equipe

### 🔐 Controle de Acesso
- **Apenas Administradores**: Acesso restrito ao perfil `ADMINISTRATOR`
- **Guards**: Proteção de rota com `RoleGuard`
- **Autorização**: Verificação de permissões em tempo real

## 🏗️ Arquitetura

### Componentes
```
teams-page/
├── teams-page.component.ts      # Lógica principal
├── teams-page.component.html    # Template HTML
├── teams-page.component.scss    # Estilos SCSS
└── index.ts                     # Exportações
```

### Serviços
- **`TeamService`**: Gerenciamento de dados das equipes
- **`AgentService`**: Busca de agentes disponíveis
- **`AlertService`**: Sistema de notificações
- **`AuthorizationService`**: Controle de permissões

### Interfaces
```typescript
interface Team {
    id?: number;
    name: string;
    workStartTime: string;
    workEndTime: string;
    agents: Agente[];
    createdAt?: Date;
    updatedAt?: Date;
    status: 'ACTIVE' | 'INACTIVE';
}
```

## 🎨 Interface do Usuário

### Header da Página
- Título com ícone
- Botão "Nova Equipe" (apenas para administradores)
- Descrição da funcionalidade

### Formulário de Equipe
- **Nome**: Campo de texto com validações
- **Horário de Início**: Input de tempo (HH:MM)
- **Horário de Fim**: Input de tempo (HH:MM)
- **Agentes**: Seleção múltipla com busca
- **Botões**: Cancelar e Salvar/Criar

### Tabela de Equipes
- **Colunas**: Nome, Horário, Duração, Agentes, Status, Criação, Ações
- **Funcionalidades**: Ordenação, filtro, paginação
- **Ações**: Editar, Deletar, Toggle de Status
- **Responsiva**: Scroll horizontal em dispositivos móveis

### Estatísticas
- Total de equipes
- Equipes ativas/inativas
- Total de agentes

## 🔧 Configuração

### Rotas
```typescript
{path: 'teams', component: TeamsPageComponent, canActivate: [RoleGuard]}
```

### Sidebar
- Menu "Teams" com ícone de grupos
- Submenu "Manage Teams"
- Visível apenas para administradores

### Permissões
```typescript
{ route: '/teams', allowedProfiles: ['ADMINISTRATOR'] }
```

## 📱 Responsividade

### Breakpoints
- **Desktop**: Layout completo com todas as colunas
- **Tablet**: Formulário empilhado, tabela com scroll
- **Mobile**: Botões em largura total, espaçamento otimizado

### Adaptações
- Formulário responsivo com grid flexível
- Tabela com scroll horizontal em telas pequenas
- Cards de estatísticas empilhados em mobile

## 🌙 Suporte a Temas

### Tema Claro
- Cores padrão do template Daxa
- Sombras e bordas sutis
- Contraste otimizado para leitura

### Tema Escuro
- Cores adaptadas automaticamente
- Backgrounds escuros para cards
- Texto em branco para melhor visibilidade

### RTL
- Suporte a idiomas da direita para esquerda
- Layout adaptado automaticamente
- Ícones e botões espelhados

## 🎯 Validações

### Formulário
- **Nome**: Obrigatório, 3-100 caracteres
- **Horários**: Formato HH:MM, início < fim
- **Agentes**: Mínimo 1 selecionado

### Horários de Trabalho
- **Turno Normal**: 08:00 - 17:00 (9 horas)
- **Turno Noturno**: 18:00 - 06:00 (12 horas)
- **Validação**: Verifica se o horário de fim é posterior ao início

## 🔄 Estados da Aplicação

### Loading
- Spinner durante operações
- Mensagens de carregamento
- Botões desabilitados durante processamento

### Erro
- Mensagens de erro específicas
- Validação de formulário
- Tratamento de erros de API

### Sucesso
- Confirmações de operações
- Redirecionamentos automáticos
- Atualização da lista de equipes

## 🧪 Dados Mockados

### Equipes de Exemplo
1. **Equipe Matutina**: 08:00 - 16:00
2. **Equipe Noturna**: 18:00 - 06:00
3. **Equipe Flexível**: 12:00 - 00:00

### Funcionalidades
- CRUD completo funcionando
- Validações ativas
- Integração com sistema de alertas
- Temas e responsividade funcionais

## 🚀 Próximos Passos

### Integração com Backend
- Substituir dados mockados por chamadas reais
- Implementar tratamento de erros de API
- Adicionar cache e otimizações

### Funcionalidades Adicionais
- Histórico de mudanças
- Logs de auditoria
- Relatórios de equipes
- Integração com sistema de turnos

### Melhorias de UX
- Drag & drop para agentes
- Filtros avançados
- Exportação de dados
- Notificações em tempo real

## 📝 Notas Técnicas

### Performance
- Lazy loading de dados
- Paginação eficiente
- Debounce no filtro de busca
- Otimizações de renderização

### Acessibilidade
- Atributos ARIA
- Navegação por teclado
- Contraste adequado
- Screen readers compatíveis

### Segurança
- Validação de entrada
- Sanitização de dados
- Controle de acesso baseado em perfil
- Proteção contra XSS

## 🔗 Dependências

### Angular Material
- Formulários reativos
- Componentes de tabela
- Inputs de tempo
- Seleção múltipla

### Serviços do Sistema
- Sistema de alertas
- Controle de autorização
- Gerenciamento de agentes
- Configurações de tema

Este componente está totalmente integrado ao sistema Daxa e segue todos os padrões estabelecidos no projeto.
