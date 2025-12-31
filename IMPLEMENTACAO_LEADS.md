# Implementação do Sistema de Captura de Leads

## Resumo

Foi implementada a funcionalidade completa de captura de leads através do CTA "Solicite um Convite" na página inicial do Portal da Lembrança. Os leads são agora salvos no banco de dados PostgreSQL e podem ser gerenciados posteriormente.

## Alterações Realizadas

### 1. Schema do Banco de Dados (`drizzle/schema.ts`)

**Adicionada nova tabela `leads`** com os seguintes campos:
- `id`: Identificador único (serial/auto-increment)
- `name`: Nome completo do lead (obrigatório)
- `email`: E-mail do lead (obrigatório)
- `phone`: Telefone (opcional)
- `acceptEmails`: Autorização para receber e-mails (boolean)
- `status`: Status do lead (pending, contacted, converted)
- `notes`: Notas adicionais sobre o lead (opcional)
- `createdAt`: Data e hora de criação

### 2. Migração do Banco de Dados

**Criado arquivo de migração**: `drizzle/migrations/20251231131603_create_leads_table.sql`

Este arquivo contém:
- Criação da tabela `leads`
- Índice no campo `email` para buscas rápidas
- Índice no campo `status` para filtragem

**Para aplicar a migração**, execute:
```bash
pnpm db:push
```

Ou se estiver usando migrações manuais:
```bash
psql $DATABASE_URL -f drizzle/migrations/20251231131603_create_leads_table.sql
```

### 3. Camada de Dados (`server/db.ts`)

**Adicionadas três novas funções**:

- `createLead(lead: InsertLead)`: Cria um novo lead no banco de dados
- `getLeadByEmail(email: string)`: Busca um lead pelo e-mail
- `getAllLeads()`: Retorna todos os leads ordenados por data de criação

### 4. API Backend (`server/routers.ts`)

**Criado novo router `leadRouter`** com dois endpoints:

#### `lead.create` (público)
- **Tipo**: Mutation
- **Acesso**: Público (não requer autenticação)
- **Validação**: 
  - Nome obrigatório
  - E-mail válido e obrigatório
  - Telefone opcional
  - Checkbox de autorização obrigatório
- **Funcionalidades**:
  - Verifica se o e-mail já está cadastrado
  - Salva o lead no banco de dados
  - Retorna sucesso com o ID do lead criado

#### `lead.getAll` (protegido)
- **Tipo**: Query
- **Acesso**: Protegido (requer autenticação)
- **Funcionalidade**: Retorna todos os leads para administração

### 5. Frontend (`client/src/pages/Home.tsx`)

**Modificações no componente Home**:

- Importado o hook `trpc` para comunicação com a API
- Criado `createLeadMutation` usando `trpc.lead.create.useMutation()`
- Atualizado `handleInviteSubmit` para enviar dados reais para o backend
- Implementado tratamento de erros com mensagens amigáveis
- Mantida a experiência do usuário com feedback visual

**Fluxo de funcionamento**:
1. Usuário preenche o formulário
2. Validações são feitas no frontend
3. Dados são enviados para `trpc.lead.create`
4. Backend valida e salva no banco
5. Usuário recebe feedback de sucesso ou erro
6. Modal mostra tela de confirmação

## Como Testar

### 1. Preparar o Ambiente

```bash
# Instalar dependências (se ainda não instalou)
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env e configure DATABASE_URL
```

### 2. Aplicar a Migração

```bash
# Aplicar schema ao banco de dados
pnpm db:push
```

### 3. Iniciar o Servidor

```bash
# Modo desenvolvimento
pnpm dev
```

### 4. Testar o Formulário

1. Acesse `http://localhost:3000` (ou a porta configurada)
2. Clique no botão "Solicite um Convite" na seção de CTA
3. Preencha o formulário com:
   - Nome completo
   - E-mail válido
   - Telefone (opcional)
   - Marque o checkbox de autorização
4. Clique em "Solicitar Convite"
5. Verifique a mensagem de sucesso

### 5. Verificar no Banco de Dados

```bash
# Conectar ao banco de dados
psql $DATABASE_URL

# Consultar leads cadastrados
SELECT * FROM leads ORDER BY "createdAt" DESC;
```

### 6. Testar Validações

**Teste de e-mail duplicado**:
- Tente cadastrar o mesmo e-mail duas vezes
- Deve exibir: "Este e-mail já foi cadastrado. Entraremos em contato em breve!"

**Teste de campos obrigatórios**:
- Tente enviar sem nome → "Por favor, informe seu nome."
- Tente enviar sem e-mail → "Por favor, informe um e-mail válido."
- Tente enviar sem marcar o checkbox → "Você precisa autorizar o recebimento de e-mails para continuar."

## Próximos Passos (Sugestões)

### 1. Dashboard de Administração de Leads

Criar uma página protegida para visualizar e gerenciar leads:

```typescript
// Exemplo de uso no dashboard
const { data: leads, isLoading } = trpc.lead.getAll.useQuery();
```

### 2. Notificações por E-mail

Implementar envio de e-mail quando um novo lead é cadastrado:
- E-mail de boas-vindas para o lead
- Notificação para a equipe de vendas

### 3. Integração com CRM

Conectar com ferramentas como:
- HubSpot
- Salesforce
- Pipedrive
- RD Station

### 4. Analytics

Adicionar tracking de conversão:
- Quantos visitantes clicam no CTA
- Taxa de conversão do formulário
- Origem do tráfego dos leads

### 5. Exportação de Dados

Adicionar endpoint para exportar leads em CSV/Excel:

```typescript
export: protectedProcedure
  .query(async () => {
    const leads = await db.getAllLeads();
    // Converter para CSV
    return csvData;
  })
```

## Estrutura de Arquivos Modificados

```
Portaldalembranca/
├── drizzle/
│   ├── schema.ts                                    [MODIFICADO]
│   └── migrations/
│       └── 20251231131603_create_leads_table.sql   [NOVO]
├── server/
│   ├── db.ts                                        [MODIFICADO]
│   └── routers.ts                                   [MODIFICADO]
└── client/
    └── src/
        └── pages/
            └── Home.tsx                             [MODIFICADO]
```

## Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] Aplicar migração no banco de dados de produção
- [ ] Testar formulário em ambiente de staging
- [ ] Verificar que as variáveis de ambiente estão configuradas
- [ ] Testar validações e mensagens de erro
- [ ] Configurar monitoramento de erros (Sentry, etc.)
- [ ] Documentar processo de gerenciamento de leads
- [ ] Treinar equipe para acessar e gerenciar leads
- [ ] Configurar backup automático da tabela de leads

## Segurança

✅ **Implementado**:
- Validação de entrada com Zod no backend
- Proteção contra SQL injection via Drizzle ORM
- Validação de e-mail no frontend e backend
- Endpoint público apenas para criação (leitura é protegida)

⚠️ **Recomendações adicionais**:
- Implementar rate limiting para prevenir spam
- Adicionar CAPTCHA (reCAPTCHA) se houver muito spam
- Implementar GDPR compliance (direito ao esquecimento)
- Adicionar logs de auditoria para alterações nos leads

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Confirme que a migração foi aplicada
3. Teste a conexão com o banco de dados
4. Verifique as variáveis de ambiente

## Conclusão

A implementação está completa e funcional. O sistema agora captura leads através do formulário "Solicite um Convite" e os armazena no banco de dados PostgreSQL, pronto para futuras integrações e gerenciamento.
