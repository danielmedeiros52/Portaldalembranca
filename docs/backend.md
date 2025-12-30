# Backend e APIs

## Variáveis de ambiente
- `DATABASE_URL`: string de conexão PostgreSQL usada pelo Prisma.

## Migrações
Para aplicar o esquema localmente após configurar o `DATABASE_URL`:

```bash
npx prisma migrate dev --name init_portal_da_lembranca
```

## Endpoints
Todos os endpoints estão sob o prefixo `/api`.

### Memorials
- `GET /api/memorials?funeralHomeId&familyUserId`
  - Lista memoriais filtrando opcionalmente por funerária ou familiar.
- `POST /api/memorials`
  - Corpo: `{ fullName, birthDate?, deathDate?, birthplace?, parents?, biography?, visibility?, funeralHomeId, familyUserId? }`
  - Cria memorial com slug gerado automaticamente.
- `GET /api/memorials/:id`
  - Retorna memorial completo com descendentes, fotos e homenagens.
- `PUT /api/memorials/:id`
  - Atualiza dados básicos do memorial.
- `DELETE /api/memorials/:id`
  - Marca memorial como INACTIVE.
- `GET /api/memorials/by-slug/:slug`
  - Busca memorial público pelo slug.

### Dedications
- `GET /api/dedications?memorialId`
  - Lista homenagens de um memorial.
- `POST /api/dedications`
  - Corpo: `{ memorialId, authorName, message }`
  - Cria uma nova homenagem.

## Execução local
1. Instale dependências (`npm install`). Caso o registro bloqueie pacotes privados, configure o acesso ao `@prisma/client`.
2. Ajuste `DATABASE_URL` em um arquivo `.env` na raiz.
3. Rode as migrações (`npx prisma migrate dev --name init_portal_da_lembranca`).
4. Inicie o projeto (`npm run dev`).
