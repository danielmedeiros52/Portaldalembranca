# Memorial QR - Guia de Configuração e Implantação

## Visão Geral do Projeto

**Memorial com QR Code** é uma aplicação web full-stack projetada para ajudar funerárias e famílias a criar e gerenciar memoriais digitais. Cada memorial é acessível através de uma URL única e um código QR que pode ser impresso em placas de túmulo. A aplicação utiliza uma pilha tecnológica moderna incluindo React, tRPC, Express, Tailwind CSS e Drizzle ORM com MySQL.

## Visão Geral da Arquitetura

O projeto segue uma arquitetura em camadas com separação clara de responsabilidades:

**Camada de Apresentação** (`client/src/`): Aplicação React 19 com Tailwind CSS 4 para estilo. As páginas são organizadas por funcionalidade (Login, Painéis, Gerenciamento de Memoriais, Páginas Públicas). Toda busca de dados usa hooks tRPC para comunicação type-safe com o backend.

**Camada de Negócios** (`server/`): Servidor Express 4 com tRPC 11 para procedimentos RPC. Toda lógica de negócio é encapsulada em roteadores tRPC organizados por funcionalidade (auth, memorial, descendente, foto, dedicação). Consultas ao banco de dados são abstraídas em `server/db.ts` para reutilização.

**Camada de Dados** (`drizzle/`): Drizzle ORM com MySQL gerencia o esquema. As tabelas incluem `users`, `funeralHomes`, `familyUsers`, `memorials`, `descendants`, `photos` e `dedications`. As migrações são versionadas e aplicadas via `pnpm db:push`.

**Funcionalidades Principais**:

- **Autenticação com papéis**: Fluxos de login separados para Funerárias e Usuários de Família
- **Gerenciamento de memoriais**: Criar, editar e visualizar memoriais com ciclo de vida completo
- **Geração de código QR**: Geração automática de código QR para cada memorial apontando para sua URL pública
- **Convites de família**: Funerárias podem convidar membros da família para completar informações do memorial
- **Memoriais públicos**: Páginas de memorial acessíveis publicamente com galerias de fotos, dedicações e informações familiares
- **Sistema de dedicações**: Visitantes podem deixar mensagens e homenagens em memoriais públicos

## Pré-requisitos

Antes de configurar o projeto, certifique-se de ter o seguinte instalado:

- **Node.js** (versão 18 ou superior) - Baixe em [nodejs.org](https://nodejs.org/)
- **pnpm** (versão 8 ou superior) - Instale globalmente com `npm install -g pnpm`
- **MySQL** (versão 8.0 ou superior) ou **TiDB** - Um servidor de banco de dados compatível com MySQL
- **Git** - Para controle de versão

## Configuração Passo a Passo

### 1. Clonar e Instalar Dependências

```bash
# Clone o repositório (ou extraia os arquivos do projeto)
cd memorial-qr-mvp

# Instale as dependências usando pnpm
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# String de conexão do banco de dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/memorial_qr"

# Segredo JWT para gerenciamento de sessão
JWT_SECRET="sua-chave-secreta-aqui-mude-em-producao"

# Configuração OAuth (se usar Manus OAuth)
VITE_APP_ID="seu-id-do-app"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Informações do proprietário
OWNER_OPEN_ID="seu-id-do-proprietario"
OWNER_NAME="Seu Nome"

# Marca da aplicação
VITE_APP_TITLE="Memorial com QR Code"
VITE_APP_LOGO="/logo.svg"

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT="https://analytics.exemplo.com"
VITE_ANALYTICS_WEBSITE_ID="seu-id-do-website"

# APIs integradas (se usar plataforma Manus)
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua-chave-de-api"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="sua-chave-do-frontend"
```

### 3. Configurar o Banco de Dados

Antes de executar as migrações, certifique-se de que seu banco de dados MySQL está em execução e acessível. Crie um banco de dados para o projeto:

```bash
# Usando MySQL CLI
mysql -u root -p
CREATE DATABASE memorial_qr;
EXIT;
```

Depois execute as migrações do banco de dados:

```bash
# Gere e aplique as migrações
pnpm db:push
```

Este comando criará todas as tabelas necessárias com base no esquema Drizzle definido em `drizzle/schema.ts`.

### 4. Iniciar o Servidor de Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento (executado em http://localhost:3000)
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`. O servidor de desenvolvimento inclui hot module reloading para código frontend e backend.

## Estrutura do Projeto

```
memorial-qr-mvp/
├── client/                    # Aplicação frontend React
│   ├── public/               # Ativos estáticos
│   ├── src/
│   │   ├── pages/           # Componentes de página (Home, Login, Painéis, etc.)
│   │   ├── components/      # Componentes UI reutilizáveis
│   │   ├── lib/             # Utilitários (cliente tRPC, hooks)
│   │   ├── contexts/        # Contextos React (Tema, etc.)
│   │   ├── App.tsx          # Roteador principal da aplicação
│   │   ├── main.tsx         # Ponto de entrada
│   │   └── index.css        # Estilos globais
│   └── index.html           # Template HTML
├── server/                    # Backend Express
│   ├── routers.ts           # Definições de procedimentos tRPC
│   ├── db.ts                # Funções auxiliares de consulta ao banco de dados
│   ├── qrcode.ts            # Utilitários de geração de código QR
│   └── _core/               # Internals do framework (auth, context, etc.)
├── drizzle/                  # Esquema do banco de dados e migrações
│   ├── schema.ts            # Definições de tabelas
│   └── migrations/          # Arquivos de migração gerados
├── shared/                   # Constantes e tipos compartilhados
├── storage/                  # Auxiliares de armazenamento S3
├── drizzle.config.ts        # Configuração do Drizzle
├── vite.config.ts           # Configuração do Vite
├── package.json             # Dependências e scripts
└── GUIA_CONFIGURACAO.md     # Este arquivo
```

## Arquivos-Chave e Seus Propósitos

| Arquivo | Propósito |
|---------|-----------|
| `drizzle/schema.ts` | Define todas as tabelas do banco de dados e seus relacionamentos |
| `server/db.ts` | Funções auxiliares de consulta para todas as operações de banco de dados |
| `server/routers.ts` | Definições de procedimentos tRPC para todos os endpoints da API |
| `server/qrcode.ts` | Utilitários de geração de código QR |
| `client/src/App.tsx` | Configuração principal de roteador e layout |
| `client/src/pages/` | Páginas de funcionalidade (Login, Painéis, Páginas de Memorial) |
| `client/src/lib/trpc.ts` | Configuração do cliente tRPC |

## Esquema do Banco de Dados

A aplicação usa as seguintes tabelas principais:

**funeralHomes**: Armazena informações de parceiros de funerárias incluindo nome, e-mail e detalhes de contato.

**familyUsers**: Armazena contas de membros da família com tokens de convite para integração.

**memorials**: A tabela central armazenando informações do falecido, incluindo biografia, datas e configurações de visibilidade.

**descendants**: Armazena informações sobre filhos, netos e outros descendentes do falecido.

**photos**: Armazena referências a fotos de memorial com legendas e ordenação.

**dedications**: Armazena mensagens de visitantes e homenagens deixadas em memoriais públicos.

## Endpoints da API (Procedimentos tRPC)

Toda comunicação com o backend usa tRPC, que fornece chamadas RPC type-safe. Os principais grupos de procedimentos são:

**Autenticação** (`trpc.auth.*`):
- `funeralHomeLogin`: Login para usuários de funerária
- `funeralHomeRegister`: Registrar nova conta de funerária
- `familyUserLogin`: Login para usuários de família
- `acceptInvitation`: Aceitar convite de família e definir senha

**Memoriais** (`trpc.memorial.*`):
- `getByFuneralHome`: Recuperar memoriais criados por uma funerária
- `getByFamilyUser`: Recuperar memoriais atribuídos a um usuário de família
- `getBySlug`: Obter memorial público por seu slug (acesso público)
- `getById`: Obter detalhes do memorial por ID (protegido)
- `create`: Criar novo memorial (apenas funerária)
- `update`: Atualizar informações do memorial (protegido)
- `generateQRCode`: Gerar código QR para um memorial (público)

**Descendentes** (`trpc.descendant.*`):
- `getByMemorial`: Listar todos os descendentes de um memorial
- `create`: Adicionar novo descendente (protegido)
- `delete`: Remover um descendente (protegido)

**Fotos** (`trpc.photo.*`):
- `getByMemorial`: Listar todas as fotos de um memorial
- `create`: Enviar nova foto (protegido)
- `delete`: Remover uma foto (protegido)

**Dedicações** (`trpc.dedication.*`):
- `getByMemorial`: Listar todas as dedicações de um memorial (público)
- `create`: Adicionar nova dedicação (público)

## Fluxos de Usuário

### Fluxo de Funerária

1. Equipe da funerária registra uma conta em `/login` (aba Registrar)
2. Após login, acessam `/dashboard/funeral-home`
3. Criam novo memorial fornecendo informações básicas do falecido e e-mail da família
4. Sistema cria automaticamente um usuário de família e envia link de convite
5. Funerária pode visualizar código QR do memorial e baixá-lo para impressão

### Fluxo de Usuário de Família

1. Família recebe link de convite por e-mail (ou através da interface da funerária)
2. Clica no link para `/accept-invitation/:token`
3. Define uma senha para completar sua conta
4. Após login, acessa `/dashboard/family`
5. Pode editar informações do memorial, adicionar fotos, descendentes e biografia
6. Pode visualizar a página pública do memorial em `/m/:slug`

### Fluxo de Visitante Público

1. Visitante escaneia código QR ou acessa URL do memorial diretamente
2. Visualiza a página pública do memorial em `/m/:slug`
3. Pode ler biografia, visualizar fotos e ver descendentes
4. Pode deixar dedicações (mensagens) no memorial

## Tarefas Comuns de Desenvolvimento

### Adicionar Nova Funcionalidade

1. **Atualizar o esquema do banco de dados** em `drizzle/schema.ts`
2. **Executar migrações** com `pnpm db:push`
3. **Adicionar funções auxiliares de consulta** em `server/db.ts`
4. **Criar procedimentos tRPC** em `server/routers.ts`
5. **Construir páginas frontend** em `client/src/pages/`
6. **Conectar hooks tRPC** em componentes usando `trpc.feature.useQuery()` ou `trpc.feature.useMutation()`

### Executar Migrações de Banco de Dados

```bash
# Após modificar schema.ts, envie as alterações para o banco de dados
pnpm db:push

# Visualizar histórico de migrações
pnpm db:studio  # Abre Drizzle Studio para inspeção do banco de dados
```

### Construir para Produção

```bash
# Construir a aplicação
pnpm build

# A saída da construção estará no diretório dist/
# Iniciar servidor de produção
pnpm start
```

### Depuração

A aplicação inclui source maps e mensagens de erro detalhadas. Use DevTools do navegador (F12) para inspecionar requisições de rede e estado de componentes. tRPC fornece tratamento de erros type-safe com mensagens de erro significativas.

## Considerações de Implantação

### Segurança

- Altere `JWT_SECRET` para uma string aleatória forte em produção
- Use HTTPS para todas as conexões
- Implemente rate limiting em endpoints públicos
- Valide todas as entradas de usuário tanto no frontend quanto no backend
- Use variáveis de ambiente para dados sensíveis

### Banco de Dados

- Use um serviço de banco de dados gerenciado (AWS RDS, Google Cloud SQL, etc.) em produção
- Ative SSL/TLS para conexões de banco de dados
- Backups regulares são essenciais
- Monitore performance do banco de dados e otimize consultas conforme necessário

### Armazenamento de Arquivos

A implementação atual usa armazenamento local de arquivos. Para produção, considere:
- AWS S3 para armazenamento escalável de arquivos
- CloudFlare R2 para armazenamento econômico
- Implemente controles de acesso apropriados e cache de CDN

### Performance

- Ative headers de cache para ativos estáticos
- Use CDN para servir conteúdo estático
- Implemente otimização de consultas ao banco de dados
- Monitore performance da aplicação com analytics

## Resolução de Problemas

**Erro de Conexão ao Banco de Dados**: Verifique se sua `DATABASE_URL` está correta e o servidor MySQL está em execução.

**Porta Já em Uso**: Se a porta 3000 já está em uso, você pode alterá-la em `vite.config.ts`.

**Erros de TypeScript**: Execute `pnpm tsc --noEmit` para verificar erros de tipo.

**Falhas de Construção**: Limpe o cache de construção com `pnpm clean` e tente novamente.

## Suporte e Recursos

- **Documentação Drizzle ORM**: [orm.drizzle.team](https://orm.drizzle.team/)
- **Documentação tRPC**: [trpc.io](https://trpc.io/)
- **Documentação React**: [react.dev](https://react.dev/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)

## Próximos Passos

1. **Personalizar marca**: Atualize `APP_LOGO` e `APP_TITLE` em `client/src/const.ts`
2. **Implementar notificações por e-mail**: Adicione envio de e-mail para convites e notificações de dedicações
3. **Adicionar processamento de pagamento**: Integre Stripe para gerenciamento de assinatura
4. **Aprimorar UI/UX**: Adicione mais polimento e animações
5. **Implementar analytics**: Rastreie comportamento do usuário e visualizações de memorial
6. **Adicionar painel de admin**: Crie ferramentas para gerenciar usuários e memoriais

## Licença

Este projeto é fornecido como está para fins de validação de MVP.
