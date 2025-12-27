# Memorial QR MVP

Stack principal:
- Node.js (>= 18)
- API estruturada com um core leve inspirado no Nest (decorators + Express)
- React + Vite para o front-end

## Scripts
- `npm run dev`: inicia a API em modo watch.
- `npm run build`: roda o lint e compila a API para `dist/`.
- `npm run build:client`: gera o build estático do front-end (Vite) em `dist/public`.
- `npm run build:vercel`: roda o lint e gera o build estático usado no deploy da Vercel.
- `npm run start`: executa a API já compilada.
- `npm run test`: executa os testes unitários com Vitest (smoke test incluído).
- `npm run test:cov`: gera cobertura de testes com Vitest.
- `npm run lint`: valida o código com ESLint.
- `npm run format`: formata com Prettier.
- `npm run audit`: roda `npm audit`.

## Deploy na Vercel
- Use o `vercel.json` da raiz para aproveitar a configuração de SPA e roteamento do Vite.
- Rode `npm run build:vercel` para gerar os arquivos estáticos em `dist/public` que a Vercel irá publicar.
- O `framework` está definido como Vite e o rewrite já garante que qualquer rota do app caia em `index.html`.

## Pagamentos
A integração com Stripe usa a variável `STRIPE_SECRET_KEY`. Em ambientes locais, defina uma chave de teste (`sk_test_...`). Se a chave não estiver definida, o serviço retorna um pagamento simulado para facilitar o desenvolvimento offline.

## Desenvolvimento
1. Instale dependências com `npm install`.
2. Rode `npm run dev` para acompanhar a API.
3. Para produção, execute `npm run build` seguido de `npm start`.
