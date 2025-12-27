# Memorial QR - Documentação de Arquitetura

## Visão Geral do Sistema

O Memorial QR é uma aplicação web full-stack construída com tecnologias modernas para fornecer uma experiência perfeita para funerárias, famílias e visitantes. O sistema foi projetado com escalabilidade, manutenibilidade e facilidade de extensão em mente.

## Pilha Tecnológica

**Frontend**: React 19 com TypeScript fornece uma interface de usuário moderna e type-safe. Tailwind CSS 4 lida com estilo com uma abordagem utility-first. A aplicação usa Wouter para roteamento leve no lado do cliente sem a sobrecarga do Next.js.

**Backend**: Express 4 serve como servidor HTTP, com tRPC 11 fornecendo comunicação RPC type-safe entre frontend e backend. Isso elimina a necessidade de documentação tradicional de API REST e fornece segurança de tipo em tempo de compilação em toda a pilha.

**Banco de Dados**: Drizzle ORM fornece uma camada de abstração de banco de dados TypeScript-first, com MySQL como banco de dados principal. As migrações são versionadas e aplicadas programaticamente, garantindo consistência entre ambientes.

**Autenticação**: O sistema implementa autenticação customizada de e-mail/senha para funerárias e usuários de família. O gerenciamento de sessão usa tokens JWT armazenados em cookies HTTP-only seguros.

## Camadas Arquiteturais

### Camada de Apresentação (Frontend)

O frontend é organizado em páginas baseadas em funcionalidade e componentes reutilizáveis:

**Páginas** (`client/src/pages/`): Cada página corresponde a um fluxo de usuário principal ou funcionalidade. As páginas lidam com roteamento, gerenciamento de estado via hooks tRPC e composição de componentes menores.

**Componentes** (`client/src/components/`): Componentes UI reutilizáveis construídos com shadcn/ui e Tailwind CSS. Os componentes são sem estado sempre que possível e recebem dados através de props.

**Contextos** (`client/src/contexts/`): Contextos React gerenciam estado global como preferências de tema.

**Hooks** (`client/src/lib/`): Hooks customizados encapsulam lógica de cliente tRPC e outra lógica reutilizável.

### Camada de Lógica de Negócio (Backend)

O backend organiza a lógica de negócio em roteadores específicos de funcionalidade:

**Roteadores tRPC** (`server/routers.ts`): Cada roteador agrupa procedimentos relacionados. Os procedimentos são públicos (acessíveis sem autenticação) ou protegidos (requerem autenticação). A validação de entrada usa esquemas Zod.

**Funções Auxiliares de Banco de Dados** (`server/db.ts`): Funções de consulta abstraem operações de banco de dados e fornecem uma interface consistente para os roteadores. Esta separação permite testes fáceis e possíveis estratégias de cache.

**Utilitários** (`server/qrcode.ts`): Utilitários especializados para funcionalidades como geração de código QR.

### Camada de Acesso a Dados (Banco de Dados)

**Esquema Drizzle** (`drizzle/schema.ts`): Define todas as tabelas, colunas, tipos e relacionamentos. O esquema é a fonte única de verdade para a estrutura do banco de dados.

**Migrações** (`drizzle/migrations/`): Arquivos de migração versionados garantem esquema consistente entre ambientes.

## Modelo de Dados

### Entidades Principais

```
FuneralHome
├── id (chave primária)
├── name
├── email (único)
├── passwordHash
├── phone
├── address
└── timestamps

FamilyUser
├── id (chave primária)
├── name
├── email (único)
├── passwordHash
├── phone
├── invitationToken
├── invitationExpiry
├── isActive
└── timestamps

Memorial
├── id (chave primária)
├── slug (único, para URLs públicas)
├── fullName
├── birthDate
├── deathDate
├── birthplace
├── filiation
├── biography
├── visibility (público/privado)
├── status (ativo/pendente_dados/inativo)
├── funeralHomeId (chave estrangeira)
├── familyUserId (chave estrangeira)
└── timestamps

Descendant
├── id (chave primária)
├── memorialId (chave estrangeira)
├── name
├── relationship
└── createdAt

Photo
├── id (chave primária)
├── memorialId (chave estrangeira)
├── fileUrl
├── caption
├── order
└── createdAt

Dedication
├── id (chave primária)
├── memorialId (chave estrangeira)
├── authorName
├── message
└── createdAt
```

## Fluxo de Requisições

### Fluxo de Autenticação

1. Usuário envia e-mail e senha na página de login
2. Frontend chama `trpc.auth.funeralHomeLogin` ou `trpc.auth.familyUserLogin`
3. Backend valida credenciais contra senhas com hash
4. Em caso de sucesso, backend define um cookie de sessão JWT
5. Frontend redireciona para o painel apropriado
6. Requisições subsequentes incluem o cookie de sessão automaticamente

### Fluxo de Busca de Dados

1. Componente chama `trpc.feature.useQuery()` ou `trpc.feature.useMutation()`
2. Cliente tRPC envia requisição para endpoint `/api/trpc`
3. Roteador backend recebe requisição e valida entrada com Zod
4. Roteador chama funções auxiliares de banco de dados
5. Função auxiliar executa consultas via Drizzle ORM
6. Resultados são retornados ao frontend com segurança de tipo completa
7. Componente re-renderiza com novos dados

### Fluxo de Geração de Código QR

1. Usuário solicita código QR para um memorial
2. Frontend chama `trpc.memorial.generateQRCode` com slug e URL base
3. Backend constrói URL completa do memorial
4. Biblioteca QRCode gera representação PNG ou SVG
5. Imagem codificada em Base64 é retornada ao frontend
6. Frontend exibe ou permite download

## Considerações de Segurança

### Autenticação

- Senhas são com hash usando bcryptjs com 10 rodadas de salt
- Tokens JWT são armazenados em cookies HTTP-only para prevenir ataques XSS
- Tokens de sessão incluem tempos de expiração
- Procedimentos protegidos verificam sessão válida antes da execução

### Validação de Entrada

- Todos os procedimentos tRPC validam entrada usando esquemas Zod
- Consultas ao banco de dados usam instruções parametrizadas via Drizzle ORM
- Validação frontend fornece feedback imediato ao usuário
- Validação backend é a fonte de verdade autoritária

### Autorização

- Funerárias podem apenas visualizar/editar memoriais que criaram
- Usuários de família podem apenas visualizar/editar memoriais atribuídos a eles
- Memoriais públicos respeitam a configuração de visibilidade
- Visitantes podem apenas deixar dedicações, não editar conteúdo existente

## Considerações de Escalabilidade

### Banco de Dados

- Índices devem ser adicionados em colunas frequentemente consultadas (slug, funeralHomeId, familyUserId)
- Considere particionar a tabela `dedications` se crescer muito
- Implemente cache para memoriais públicos frequentemente acessados

### Armazenamento de Arquivos

- Implementação atual usa armazenamento local; migre para S3 ou similar para produção
- Implemente CDN para entrega rápida de imagens
- Use bibliotecas de otimização de imagem para reduzir tamanhos de arquivo

### Performance da API

- Implemente rate limiting em endpoints públicos
- Cache de códigos QR gerados para evitar regeneração
- Use pool de conexão de banco de dados
- Monitore consultas lentas e otimize conforme necessário

### Performance do Frontend

- Code-split de páginas usando importações dinâmicas
- Lazy load de imagens em galerias de fotos
- Implemente paginação para listas grandes
- Use React.memo para componentes caros

## Pontos de Extensão

### Adicionar Novas Funcionalidades

1. **Novo Papel de Usuário**: Adicione papel a `familyUsers` ou crie nova tabela, adicione procedimentos ao roteador auth
2. **Novos Campos de Memorial**: Adicione colunas à tabela `memorials`, atualize esquema e migrações
3. **Novo Tipo de Conteúdo**: Crie nova tabela, adicione procedimentos CRUD, construa componentes UI
4. **Integrações**: Crie novos roteadores para serviços externos (e-mail, pagamento, etc.)

### Customização

- **Estilo**: Modifique configuração Tailwind em `tailwind.config.ts`
- **Marca**: Atualize constantes em `client/src/const.ts`
- **Templates de E-mail**: Crie serviço de e-mail em `server/email.ts`
- **Notificações**: Implemente handlers de webhook para eventos

## Fluxo de Desenvolvimento

1. **Alterações de Esquema**: Atualize `drizzle/schema.ts`, execute `pnpm db:push`
2. **Lógica Backend**: Adicione consultas em `server/db.ts`, procedimentos em `server/routers.ts`
3. **Frontend**: Crie páginas/componentes, conecte hooks tRPC
4. **Testes**: Testes manuais no navegador, testes automatizados para caminhos críticos
5. **Implantação**: Construa com `pnpm build`, implante em plataforma de hospedagem

## Monitoramento e Depuração

### Desenvolvimento

- Use DevTools do navegador para depuração frontend
- tRPC fornece mensagens de erro detalhadas
- Ative logging verboso em ambiente de desenvolvimento
- Use Drizzle Studio para inspeção de banco de dados

### Produção

- Implemente rastreamento de erros (Sentry, etc.)
- Monitore tempos de resposta da API
- Rastreie performance de consultas ao banco de dados
- Monitore uso de recursos do servidor

## Melhorias Futuras

1. **Notificações por E-mail**: Envie convites e notificações aos usuários
2. **Processamento de Pagamento**: Integre Stripe para gerenciamento de assinatura
3. **Painel de Admin**: Ferramentas para gerenciar usuários e memoriais
4. **Analytics**: Rastreie visualizações de memorial e engajamento
5. **Aplicativo Móvel**: Aplicações nativas para iOS e Android
6. **Suporte Multilíngue**: Internacionalização para múltiplos idiomas
7. **Busca Avançada**: Busca full-text em memoriais
8. **Funcionalidades Sociais**: Compartilhe memoriais em redes sociais
9. **API para Parceiros**: API RESTful para integrações de funerárias
10. **Acessibilidade**: Recursos de acessibilidade aprimorados para usuários diversos

## Conclusão

A arquitetura do Memorial QR MVP fornece uma base sólida para uma aplicação escalável e manutenível. O uso de tecnologias modernas e separação clara de responsabilidades torna fácil estender e customizar conforme os requisitos evoluem. A natureza type-safe da pilha (TypeScript, tRPC, Drizzle) fornece confiança nas mudanças de código e reduz a probabilidade de erros em tempo de execução.
