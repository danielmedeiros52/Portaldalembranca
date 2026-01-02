# Módulo Administrativo - Portal da Lembrança

## Visão Geral

O módulo administrativo foi desenvolvido para permitir o gerenciamento completo do negócio de memoriais digitais. Ele oferece uma interface intuitiva para acompanhar memoriais ativos, gerenciar novas solicitações e controlar a fila de produção.

## Acesso

- **URL de Login:** `/admin/login`
- **Dashboard:** `/admin`

Para acessar o painel administrativo, utilize um e-mail válido e uma senha com no mínimo 6 caracteres.

## Funcionalidades

### 1. Dashboard Principal

O dashboard oferece uma visão geral completa do negócio:

| Métrica | Descrição |
|---------|-----------|
| Total de Memoriais | Quantidade total de memoriais no sistema |
| Pedidos na Fila | Quantidade de pedidos em processamento |
| Solicitações | Novas solicitações de contato (leads) |
| Funerárias Parceiras | Total de funerárias cadastradas |

Além disso, exibe:
- **Fila de Produção:** Resumo dos pedidos por status
- **Últimas Solicitações:** Leads mais recentes
- **Memoriais Recentes:** Últimos memoriais criados

### 2. Fila de Produção

Gerencie todos os pedidos em produção com controle de status:

| Status | Descrição |
|--------|-----------|
| Novo | Pedido recém-criado |
| Em Produção | Memorial sendo desenvolvido |
| Aguardando Dados | Aguardando informações da família |
| Pronto | Memorial finalizado |
| Entregue | Memorial entregue ao cliente |
| Cancelado | Pedido cancelado |

**Funcionalidades:**
- Filtrar pedidos por status
- Buscar por nome do memorial
- Alterar status do pedido
- Definir prioridade (Baixa, Normal, Alta, Urgente)
- Adicionar notas internas

### 3. Solicitações (Leads)

Gerencie as novas solicitações de contato:

| Status | Descrição |
|--------|-----------|
| Pendente | Aguardando primeiro contato |
| Contatado | Cliente já foi contatado |
| Convertido | Lead convertido em cliente |
| Rejeitado | Lead não convertido |

**Funcionalidades:**
- Visualizar informações de contato
- Atualizar status do lead
- Adicionar notas de acompanhamento
- Filtrar por status

### 4. Memoriais

Visualize e gerencie todos os memoriais do sistema:

- Lista completa com informações detalhadas
- Filtros por status (Ativo, Pendente, Inativo)
- Busca por nome
- Acesso rápido para visualizar ou editar memorial
- Informações de funerária, datas e visibilidade

### 5. Funerárias

Visualize as funerárias parceiras cadastradas:

- Nome e contato
- Endereço
- Quantidade de memoriais associados

### 6. Famílias

Visualize os usuários familiares:

- Nome e e-mail
- Status (Ativo/Pendente)
- Quantidade de memoriais associados

### 7. Configurações

Área para configurações do sistema (em desenvolvimento).

## Estrutura Técnica

### Arquivos Criados

```
client/src/
├── pages/
│   ├── AdminLoginPage.tsx    # Página de login
│   └── AdminDashboard.tsx    # Dashboard principal
├── components/
│   └── AdminRoute.tsx        # Proteção de rotas
└── services/
    └── adminService.ts       # Serviço de autenticação

server/
├── routers.ts               # Routers tRPC (admin router adicionado)
└── db.ts                    # Funções de banco de dados

drizzle/
└── schema.ts                # Schema com novas tabelas
```

### Novas Tabelas no Banco de Dados

#### leads
- `id`: Identificador único
- `name`: Nome do lead
- `email`: E-mail de contato
- `phone`: Telefone (opcional)
- `status`: Status do lead (pending, contacted, converted, rejected)
- `notes`: Notas de acompanhamento
- `acceptEmails`: Aceita receber e-mails
- `createdAt`: Data de criação

#### orders
- `id`: Identificador único
- `memorialId`: Referência ao memorial
- `funeralHomeId`: Referência à funerária
- `familyUserId`: Referência ao usuário familiar (opcional)
- `productionStatus`: Status de produção
- `priority`: Prioridade do pedido
- `notes`: Notas do cliente
- `internalNotes`: Notas internas
- `estimatedDelivery`: Data estimada de entrega
- `deliveredAt`: Data de entrega
- `assignedTo`: Responsável pelo pedido
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

#### order_history
- `id`: Identificador único
- `orderId`: Referência ao pedido
- `previousStatus`: Status anterior
- `newStatus`: Novo status
- `changedBy`: Quem alterou
- `notes`: Notas da alteração
- `createdAt`: Data da alteração

### Rotas da API (tRPC)

```typescript
admin.getStats()           // Estatísticas do dashboard
admin.getLeads()           // Listar leads
admin.createLead()         // Criar lead
admin.updateLead()         // Atualizar lead
admin.getOrders()          // Listar pedidos
admin.createOrder()        // Criar pedido
admin.updateOrder()        // Atualizar pedido
admin.getOrderHistory()    // Histórico do pedido
```

## Próximos Passos

1. **Autenticação Real:** Implementar autenticação com hash de senha no backend
2. **Notificações:** Sistema de notificações para novos pedidos e leads
3. **Relatórios:** Gerar relatórios de produção e vendas
4. **Exportação:** Exportar dados para Excel/CSV
5. **Integração:** Webhooks para integrações externas

## Suporte

Para dúvidas ou sugestões sobre o módulo administrativo, entre em contato com a equipe de desenvolvimento.
