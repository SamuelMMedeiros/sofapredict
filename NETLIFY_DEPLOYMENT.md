# Deploy do SofaPredict no Netlify

## Configuração

1. Conecte o repositório ao Netlify.
2. Use `pnpm build` como comando de build.
3. Publique o diretório `dist`.
4. Configure as variáveis abaixo no painel do Netlify.

```env
DATABASE_URL=mysql://user:password@host/sofapredict
JWT_SECRET=gere-um-segredo-forte
ADMIN_EMAIL=admin@exemplo.com
RAPIDAPI_KEY=sua_chave_rapidapi
GEMINI_API_KEY=sua_chave_gemini
VITE_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
STRIPE_SECRET_KEY=sua_chave_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_stripe
ASAAS_API_KEY=sua_chave_asaas
ASAAS_WEBHOOK_SECRET=seu_webhook_asaas
PAYPAL_CLIENT_ID=seu_client_id_paypal
PAYPAL_CLIENT_SECRET=seu_client_secret_paypal
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=seu_website_id
```

As chaves privadas devem ficar somente nas variáveis do Netlify. A chave do Google Maps é pública por natureza, mas deve ter restrições por domínio no Google Cloud.

## Banco de dados

O projeto usa MySQL via Drizzle. Execute as migrações antes do primeiro acesso:

```bash
pnpm db:push
```

## Verificação local

```bash
pnpm check
pnpm test
pnpm build
```

O login é local: o usuário informa nome e e-mail em `/login`, e a aplicação cria uma sessão JWT própria. Não é necessário configurar portal OAuth ou runtime externo.
