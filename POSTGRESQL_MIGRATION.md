# Migração para PostgreSQL

Este documento descreve a migração do projeto Portal da Lembrança de MySQL para PostgreSQL com Drizzle ORM, otimizado para deploy na Vercel.

## 🎯 Motivação

A migração para PostgreSQL foi realizada para:

- ✅ **Melhor integração com Vercel**: Vercel Postgres é nativo e otimizado
- ✅ **Performance**: PostgreSQL oferece melhor performance para queries complexas
- ✅ **Recursos avançados**: Suporte a JSON, full-text search, e extensões
- ✅ **Escalabilidade**: Melhor suporte para aplicações em crescimento
- ✅ **Edge Functions**: Compatibilidade com @neondatabase/serverless para edge

## 📋 Mudanças Realizadas

### 1. Dependências Atualizadas

**Removido:**
```json
"mysql2": "^3.15.0"
```

**Adicionado:**
```json
"postgres": "^3.4.5",
"@neondatabase/serverless": "^0.10.4"
```

### 2. Schema Drizzle (`drizzle/schema.ts`)

**Mudanças principais:**

| MySQL | PostgreSQL |
|-------|------------|
| `mysqlTable()` | `pgTable()` |
| `int().autoincrement()` | `serial()` |
| `mysqlEnum()` | `pgEnum()` |
| `int()` | `integer()` |
| `varchar()` | `varchar()` (sem mudanças) |
| `text()` | `text()` (sem mudanças) |
| `timestamp().onUpdateNow()` | `timestamp()` (removido auto-update) |

**Exemplo de conversão:**

```typescript
// ANTES (MySQL)
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
});

// DEPOIS (PostgreSQL)
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  role: roleEnum("role").default("user").notNull(),
});
```

### 3. Conexão com Banco de Dados (`server/db.ts`)

**Mudanças principais:**

```typescript
// ANTES (MySQL)
import { drizzle } from "drizzle-orm/mysql2";

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  return _db;
}

// DEPOIS (PostgreSQL)
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _client = postgres(process.env.DATABASE_URL, { 
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false
    });
    _db = drizzle(_client);
  }
  return _db;
}
```

### 4. Upsert Syntax

**ANTES (MySQL):**
```typescript
await db.insert(users).values(values).onDuplicateKeyUpdate({
  set: updateSet,
});
```

**DEPOIS (PostgreSQL):**
```typescript
await db.insert(users)
  .values(values)
  .onConflictDoUpdate({
    target: users.openId,
    set: updateSet,
  });
```

### 5. Configuração Drizzle (`drizzle.config.ts`)

```typescript
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql", // Mudado de "mysql"
  dbCredentials: {
    url: connectionString,
  },
});
```

## 🚀 Como Usar

### Desenvolvimento Local

1. **Instalar PostgreSQL localmente** (ou usar Docker):
   ```bash
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
   ```

2. **Configurar variável de ambiente**:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portal_lembranca"
   ```

3. **Instalar dependências**:
   ```bash
   pnpm install
   ```

4. **Gerar e aplicar migrations**:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Iniciar desenvolvimento**:
   ```bash
   pnpm dev
   ```

### Deploy na Vercel

#### Opção 1: Vercel Postgres (Recomendado)

1. No dashboard da Vercel, vá em **Storage** → **Create Database** → **Postgres**
2. Conecte ao seu projeto
3. A variável `DATABASE_URL` será automaticamente configurada
4. Deploy normalmente: `vercel --prod`

#### Opção 2: Neon Database

1. Crie uma conta em [Neon](https://neon.tech)
2. Crie um novo projeto PostgreSQL
3. Copie a connection string
4. Adicione no Vercel:
   ```bash
   vercel env add DATABASE_URL
   # Cole a connection string do Neon
   ```
5. Deploy: `vercel --prod`

#### Opção 3: Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Vá em **Settings** → **Database** → **Connection String**
3. Use a connection string no formato:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## 📦 Scripts Disponíveis

```bash
# Gerar nova migration baseada no schema
pnpm db:generate

# Aplicar migrations no banco de dados
pnpm db:migrate

# Push schema direto (desenvolvimento)
pnpm db:push

# Abrir Drizzle Studio (GUI para o banco)
pnpm db:studio
```

## 🔄 Migração de Dados Existentes

Se você tem dados no MySQL e precisa migrar:

### 1. Exportar dados do MySQL

```bash
mysqldump -u user -p portal_lembranca > backup.sql
```

### 2. Converter para PostgreSQL

Use ferramentas como:
- [pgloader](https://pgloader.io/)
- [mysql2postgres](https://github.com/maxlapshin/mysql2postgres)

### 3. Importar no PostgreSQL

```bash
psql -U postgres -d portal_lembranca < converted_backup.sql
```

## ⚠️ Breaking Changes

1. **Auto-increment IDs**: Agora usa `SERIAL` do PostgreSQL
2. **Enums**: Devem ser declarados separadamente com `pgEnum()`
3. **Timestamps**: `onUpdateNow()` não existe no PostgreSQL (use triggers se necessário)
4. **Upsert**: Sintaxe diferente (`onConflictDoUpdate` vs `onDuplicateKeyUpdate`)

## 🧪 Testando a Migração

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar .env
cp .env.example .env
# Edite DATABASE_URL com suas credenciais PostgreSQL

# 3. Aplicar schema
pnpm db:push

# 4. Verificar no Drizzle Studio
pnpm db:studio
```

## 📚 Recursos Adicionais

- [Drizzle ORM - PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Database](https://neon.tech/docs/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🆘 Troubleshooting

### Erro: "relation does not exist"
```bash
# Aplicar migrations
pnpm db:push
```

### Erro: "SSL connection required"
```bash
# Adicionar ?sslmode=require na connection string
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### Erro: "too many clients"
```bash
# Reduzir max connections no postgres client
postgres(url, { max: 1 })
```

## ✅ Checklist de Migração

- [x] Atualizar dependências (postgres, @neondatabase/serverless)
- [x] Converter schema para PostgreSQL
- [x] Atualizar drizzle.config.ts
- [x] Atualizar server/db.ts com postgres driver
- [x] Converter upsert syntax
- [x] Gerar migrations
- [x] Atualizar .env.example
- [x] Documentar mudanças
- [ ] Testar localmente
- [ ] Configurar banco na Vercel
- [ ] Deploy e validação

---

**Data da Migração**: 31/12/2025  
**Versão**: 1.0.0  
**Status**: ✅ Completo
