# SofaPredict - Guia de Deploy no Netlify

## Visão Geral

Este guia explica como fazer deploy do SofaPredict no Netlify usando o conector Manus integrado.

## Pré-requisitos

- ✅ Repositório GitHub criado
- ✅ Código commitado e pusheado
- ✅ Variáveis de ambiente configuradas
- ✅ Banco de dados Supabase pronto

## Passo 1: Preparar o Repositório

### 1.1 Criar arquivo `.env.production`

```bash
# .env.production (não commitar este arquivo!)
DATABASE_URL=mysql://user:password@host/sofapredict
JWT_SECRET=seu_jwt_secret_aqui
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
RAPIDAPI_KEY=sua_chave_rapidapi
GEMINI_API_KEY=sua_chave_gemini
STRIPE_SECRET_KEY=sua_chave_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret
ASAAS_API_KEY=sua_chave_asaas
ASAAS_WEBHOOK_SECRET=seu_webhook_secret_asaas
PAYPAL_CLIENT_ID=seu_client_id_paypal
PAYPAL_CLIENT_SECRET=seu_client_secret_paypal
```

### 1.2 Verificar `netlify.toml`

O arquivo `netlify.toml` já está configurado com:
- Build command: `pnpm build`
- Publish directory: `dist`
- Redirects para SPA routing
- Security headers
- Cache policies

### 1.3 Commit e Push

```bash
git add .
git commit -m "chore: prepare for Netlify deployment"
git push origin main
```

## Passo 2: Conectar ao Netlify via Manus

### 2.1 Acessar o Conector Netlify

No Manus:
1. Vá para **Settings → Integrations → Netlify**
2. Clique em **Connect Netlify Account**
3. Autorize o Manus a acessar sua conta Netlify

### 2.2 Criar Novo Site

```bash
# Usando Manus CLI (se disponível)
manus netlify create-site \
  --name sofapredict \
  --repo your-github/sofapredict \
  --branch main
```

Ou via interface:
1. Clique em **New Site from Git**
2. Selecione seu repositório GitHub
3. Configure as variáveis de ambiente

## Passo 3: Configurar Variáveis de Ambiente

### 3.1 No Netlify Dashboard

1. Vá para **Site Settings → Build & Deploy → Environment**
2. Clique em **Edit variables**
3. Adicione todas as variáveis de `.env.production`

**Variáveis Críticas:**
- `DATABASE_URL` - Conexão com Supabase
- `JWT_SECRET` - Chave de sessão
- `RAPIDAPI_KEY` - API de esportes
- `GEMINI_API_KEY` - IA
- `STRIPE_SECRET_KEY` - Pagamentos

### 3.2 Variáveis Sensíveis

Para dados muito sensíveis (chaves de API):
1. Use **Netlify UI** para adicionar (não commitar)
2. Ou use **Netlify CLI**:

```bash
netlify env:set DATABASE_URL "mysql://..."
netlify env:set JWT_SECRET "seu_secret"
```

## Passo 4: Configurar Webhooks de Pagamento

### 4.1 Stripe Webhook

1. Vá para [Stripe Dashboard](https://dashboard.stripe.com)
2. **Developers → Webhooks**
3. Clique em **Add endpoint**
4. URL: `https://seu-site.netlify.app/.netlify/functions/stripe-webhook`
5. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
6. Copie o **Webhook Secret**
7. Adicione em Netlify: `STRIPE_WEBHOOK_SECRET`

### 4.2 Asaas Webhook

1. Vá para [Asaas Dashboard](https://www.asaas.com)
2. **Configurações → Webhooks**
3. Clique em **Novo Webhook**
4. URL: `https://seu-site.netlify.app/.netlify/functions/asaas-webhook`
5. Eventos: `payment_confirmed`, `payment_failed`
6. Copie o **Webhook Secret**
7. Adicione em Netlify: `ASAAS_WEBHOOK_SECRET`

### 4.3 PayPal Webhook

1. Vá para [PayPal Developer](https://developer.paypal.com)
2. **Apps & Credentials → Webhooks**
3. Clique em **Create Webhook**
4. URL: `https://seu-site.netlify.app/.netlify/functions/paypal-webhook`
5. Eventos: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`
6. Copie o **Webhook ID**
7. Adicione em Netlify: `PAYPAL_WEBHOOK_ID`

## Passo 5: Deploy

### 5.1 Trigger Manual

```bash
# Via Netlify CLI
netlify deploy --prod

# Ou via Git
git push origin main  # Netlify fará deploy automaticamente
```

### 5.2 Verificar Deploy

1. Vá para **Netlify Dashboard → Deploys**
2. Aguarde o build completar
3. Clique em **Preview** para testar

## Passo 6: Testes Pós-Deploy

### 6.1 Verificar Funcionalidades

- [ ] Home pública carrega sem erros
- [ ] Dashboard funciona sem login
- [ ] Login redireciona corretamente
- [ ] Histórico de apostas mostra dados
- [ ] Planos de pagamento aparecem
- [ ] Calculadora de arbitragem funciona
- [ ] IA gera recomendações

### 6.2 Verificar Pagamentos

- [ ] Pix: Teste pagamento e webhook
- [ ] Cartão: Teste com Stripe
- [ ] PayPal: Teste integração

### 6.3 Verificar Performance

```bash
# Lighthouse
netlify build --context production
```

## Passo 7: Configuração de Domínio

### 7.1 Domínio Netlify Padrão

Seu site estará disponível em: `https://sofapredict.netlify.app`

### 7.2 Domínio Customizado

1. Vá para **Site Settings → Domain Management**
2. Clique em **Add custom domain**
3. Digite seu domínio (ex: `sofapredict.com`)
4. Siga as instruções de DNS
5. Netlify gerará SSL automaticamente

### 7.3 Certificado SSL

- ✅ Automático via Let's Encrypt
- ✅ Renovação automática
- ✅ HTTPS forçado por padrão

## Troubleshooting

### Build falha

```bash
# Verificar logs
netlify logs --tail

# Limpar cache
netlify cache:clear

# Rebuild
netlify deploy --prod --clear-cache
```

### Variáveis de ambiente não aparecem

```bash
# Verificar variáveis
netlify env:list

# Redeployar após adicionar variáveis
netlify deploy --prod
```

### Webhooks não funcionam

1. Verifique URL do webhook (sem typo)
2. Verifique webhook secret está correto
3. Verifique logs: **Netlify Dashboard → Functions**
4. Teste webhook manualmente:

```bash
curl -X POST https://seu-site.netlify.app/.netlify/functions/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment_intent.succeeded"}'
```

### Banco de dados não conecta

1. Verifique `DATABASE_URL` está correto
2. Verifique IP do Netlify está na whitelist Supabase
3. Verifique SSL está habilitado em Supabase

## Monitoramento

### 7.1 Logs em Tempo Real

```bash
netlify logs --tail --functions
```

### 7.2 Analytics

Netlify fornece:
- Estatísticas de deploy
- Performance metrics
- Error tracking
- Bandwidth usage

### 7.3 Alertas

Configure alertas para:
- Build failures
- Deploy errors
- High bandwidth usage
- SSL certificate expiry

## CI/CD Pipeline

### 8.1 Automatic Deploys

Configurado em `netlify.toml`:
- Branch: `main`
- Trigger: Push automático
- Build: `pnpm build`

### 8.2 Preview Deploys

Cada PR gera:
- Deploy preview automático
- URL única para testes
- Comentário no PR com link

### 8.3 Rollback

Para reverter para deploy anterior:
1. **Netlify Dashboard → Deploys**
2. Clique no deploy anterior
3. Clique em **Publish deploy**

## Performance Optimization

### 9.1 Build Optimization

```bash
# Verificar tamanho do bundle
pnpm build --analyze
```

### 9.2 Caching

Configurado em `netlify.toml`:
- Assets: 1 ano
- HTML: 0 (sempre fresh)
- API: Conforme configurado

### 9.3 CDN

Netlify fornece:
- ✅ CDN global automático
- ✅ Compressão Brotli/Gzip
- ✅ Image optimization
- ✅ Minificação automática

## Segurança

### 10.1 Headers de Segurança

Configurado em `netlify.toml`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### 10.2 Rate Limiting

Configure no Netlify:
- Limite de requisições por IP
- Proteção DDoS
- WAF (Web Application Firewall)

### 10.3 Secrets Management

Nunca commitar:
- API keys
- Database credentials
- Webhook secrets
- JWT secrets

Use Netlify UI ou CLI para adicionar.

## Suporte

- 📧 Email: support@sofapredict.com
- 💬 Discord: [Link do servidor]
- 📚 Docs: https://docs.sofapredict.com
- 🐛 Issues: GitHub Issues

---

**Última atualização:** Junho 2026
**Versão:** 1.0.0
