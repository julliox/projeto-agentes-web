# Sistema de Alert - Daxa Template

## 📋 Visão Geral

O novo sistema de alert foi criado baseado no sistema de alerts do template Daxa, substituindo o MatSnackBar anterior. Os alerts aparecem no **topo da tela à direita** e são totalmente responsivos.

## 🚀 Como Usar

### 1. Importar o Service

```typescript
import { AlertService } from './services/alert.service';

constructor(private alertService: AlertService) {}
```

### 2. Métodos Disponíveis

#### Método Principal
```typescript
showAlert(type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number, dismissible?: boolean)
```

#### Métodos de Conveniência
```typescript
// Sucesso (verde)
alertService.showSuccess('Operação realizada com sucesso!');

// Erro (vermelho)
alertService.showError('Ocorreu um erro na operação!');

// Aviso (amarelo)
alertService.showWarning('Atenção! Esta ação pode ter consequências.');

// Informação (azul)
alertService.showInfo('Informação importante para você.');
```

### 3. Parâmetros Opcionais

```typescript
// Duração personalizada (em milissegundos)
alertService.showSuccess('Mensagem', 10000); // 10 segundos

// Alert que não fecha automaticamente
alertService.showAlert('info', 'Mensagem persistente', 0);

// Alert que não pode ser fechado manualmente
alertService.showAlert('warning', 'Mensagem', 5000, false);
```

## 🎨 Tipos de Alert

| Tipo | Cor | Ícone | Uso |
|------|-----|-------|-----|
| `success` | Verde | ✓ | Operações bem-sucedidas |
| `error` | Vermelho | ⚠ | Erros e falhas |
| `warning` | Amarelo | ⚠ | Avisos e alertas |
| `info` | Azul | ℹ | Informações gerais |

## 📱 Responsividade

- **Desktop**: Alerts aparecem no topo direito
- **Mobile**: Alerts ocupam toda a largura da tela (com margens)

## 🌙 Suporte a Dark Mode

O sistema automaticamente se adapta ao tema escuro/claro do template Daxa.

## 🔧 Exemplos de Uso

### Exemplo 1: Login (Melhorado)
```typescript
// Sucesso
this.alertService.showSuccess('Login realizado com sucesso! Bem-vindo de volta!');

// Erros específicos
this.alertService.showError('Email ou senha incorretos. Verifique suas credenciais.');
this.alertService.showError('Acesso negado. Sua conta pode estar desativada.');
this.alertService.showError('Usuário não encontrado. Verifique seu email.');
this.alertService.showError('Erro interno do servidor. Tente novamente mais tarde.');
this.alertService.showError('Erro de conexão. Verifique sua internet e tente novamente.');

// Validação
this.alertService.showWarning('Por favor, preencha todos os campos corretamente.');
```

### Exemplo 2: CRUD Operations
```typescript
// Criar
this.notificationService.showSuccess('Registro criado com sucesso!');

// Atualizar
this.notificationService.showSuccess('Registro atualizado com sucesso!');

// Deletar
this.notificationService.showSuccess('Registro removido com sucesso!');

// Erro
this.notificationService.showError('Erro ao salvar dados!');
```

### Exemplo 3: Validações
```typescript
if (form.invalid) {
    this.notificationService.showError('Por favor, preencha todos os campos obrigatórios.');
    return;
}
```

### Exemplo 4: Alert Persistente
```typescript
// Alert que não fecha automaticamente
this.alertService.showAlert('info', 'Esta informação é importante!', 0);
```

## 🔐 Fluxo de Login Melhorado

O sistema de alert foi integrado ao fluxo de login com as seguintes melhorias:

### 1. Mensagens Específicas por Tipo de Erro
```typescript
// Diferentes tipos de erro HTTP
if (error.status === 401) {
    errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
} else if (error.status === 403) {
    errorMessage = 'Acesso negado. Sua conta pode estar desativada.';
} else if (error.status === 404) {
    errorMessage = 'Usuário não encontrado. Verifique seu email.';
} else if (error.status === 500) {
    errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
} else if (error.status === 0) {
    errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
}
```

### 2. Delay para Visualização
```typescript
// Pequeno delay para o usuário ver a mensagem antes do redirecionamento
setTimeout(() => {
    this.router.navigate(['/']);
}, 1000);
```

### 3. Remoção de Mensagens Locais
- Removida a mensagem de erro local do template
- Todos os feedbacks agora usam o sistema de alert global

## 🛠️ Configuração

### 1. Componente Global
O componente `GlobalAlertComponent` já está configurado no `app.component.html`:

```html
<!-- Global Alerts -->
<app-global-alert />
```

### 2. Service Atualizado
O `NotificationService` foi atualizado para usar o novo `AlertService`:

```typescript
// Antes (MatSnackBar)
this.snackBar.open(message, 'Fechar', config);

// Agora (AlertService)
this.alertService.showSuccess(message);
```

## 📁 Estrutura de Arquivos

```
src/app/
├── services/
│   ├── alert.service.ts          # Service principal
│   └── notification.service.ts   # Service atualizado
├── components/
│   ├── global-alert/
│   │   ├── global-alert.component.ts
│   │   ├── global-alert.component.html
│   │   └── global-alert.component.scss
│   ├── alert-test/              # Componente de teste geral
│   │   ├── alert-test.component.ts
│   │   ├── alert-test.component.html
│   │   └── alert-test.component.scss
│   └── login-test/              # Componente de teste de login
│       ├── login-test.component.ts
│       ├── login-test.component.html
│       └── login-test.component.scss
├── authentication/
│   └── sign-in/
│       ├── sign-in.component.ts  # Atualizado com AlertService
│       ├── sign-in.component.html # Removida mensagem local
│       └── sign-in.component.scss
```

## 🎯 Benefícios

1. **Consistência Visual**: Usa o design system do template Daxa
2. **Responsividade**: Funciona perfeitamente em mobile
3. **Dark Mode**: Suporte nativo ao tema escuro
4. **Flexibilidade**: Múltiplas opções de configuração
5. **Performance**: Mais leve que o MatSnackBar
6. **Customização**: Fácil de personalizar estilos
7. **UX Melhorada**: Mensagens específicas e delay para visualização
8. **Manutenibilidade**: Código mais limpo e organizado

## 🔄 Migração

### Antes (MatSnackBar)
```typescript
constructor(private snackBar: MatSnackBar) {}

showSuccess(message: string) {
    this.snackBar.open(message, 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
    });
}
```

### Depois (AlertService)
```typescript
constructor(private alertService: AlertService) {}

showSuccess(message: string) {
    this.alertService.showSuccess(message);
}
```

## 🧪 Teste

Para testar o sistema, você pode usar os componentes de teste:

```typescript
// Importar os componentes de teste
import { AlertTestComponent } from './components/alert-test/alert-test.component';
import { LoginTestComponent } from './components/login-test/login-test.component';

// Adicionar às rotas
{ path: '/alert-test', component: AlertTestComponent },
{ path: '/login-test', component: LoginTestComponent }
```

## 📝 Notas Importantes

1. **Auto-remoção**: Alerts são removidos automaticamente após a duração especificada
2. **Múltiplos Alerts**: Vários alerts podem ser exibidos simultaneamente
3. **Z-index**: Alerts têm z-index alto (9999) para aparecer sobre outros elementos
4. **Animações**: Inclui animações suaves de entrada e saída
5. **Acessibilidade**: Inclui atributos ARIA para acessibilidade
6. **Login Flow**: Integração completa com melhor UX

## 🎨 Personalização

Para personalizar os estilos, edite o arquivo:
```
src/app/components/global-alert/global-alert.component.scss
```

As classes CSS do template Daxa já estão disponíveis:
- `.alert-success`
- `.alert-error`
- `.alert-warning`
- `.alert-info` 