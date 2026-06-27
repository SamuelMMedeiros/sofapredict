# SofaPredict - Guia de Deployment

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração de Ambiente](#configuração-de-ambiente)
3. [Deploy no Netlify](#deploy-no-netlify)
4. [Deploy no Servidor Node.js](#deploy-no-servidor-nodejs)
5. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
6. [Monitoramento e Manutenção](#monitoramento-e-manutenção)

---

## Pré-requisitos

### Ferramentas Necessárias
- Node.js 22.13.0+
- pnpm 10.15.1+
- Git
- Conta Netlify (para frontend)
- Supabase (PostgreSQL)
- RapidAPI (para APIs de esportes)
- Google Gemini API

### Contas Externas
1. **Supabase** - Banco de dados PostgreSQL
   - Criar projeto em https://supabase.com
   - Copiar `DATABASE_URL`

2. **RapidAPI** - APIs de esportes
   - Registrar em https://rapidapi.com
   - Obter chave de API

3. **Google Gemini** - IA para análises
   - Criar projeto em https://ai.google.dev
   - Gerar chave de API

4. **Netlify** - Hospedagem frontend
   - Conectar repositório GitHub
   - Configurar variáveis de ambiente

---

## Configuração de Ambiente

### 1. Variáveis Obrigatórias

Criar arquivo `.env.local` na raiz do projeto:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=seu-jwt-secret-muito-seguro-aqui
VITE_APP_ID=seu-app-id-manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# APIs Externas
RAPIDAPI_KEY=4012fbe2c8mshb6181176c3e7f21p1909ddjsnc91b540bb8f1
GEMINI_API_KEY=sua-gemini-api-key-aqui

# Cache TTL (em segundos)
CACHE_TTL_ODDS=60
CACHE_TTL_LIVE_MATCHES=120
CACHE_TTL_UPCOMING=300
CACHE_TTL_TEAM_STATS=3600
CACHE_TTL_STANDINGS=3600
CACHE_TTL_PREDICTIONS=7200
CACHE_TTL_TEAM_INFO=86400

# Owner Info
OWNER_NAME=seu-nome
OWNER_OPEN_ID=seu-open-id-manus

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=sua-chave-forge-aqui

# Frontend URLs
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=sua-chave-frontend-aqui

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu-website-id
```

### 2. Validar Configuração

```bash
# Verificar tipos TypeScript
pnpm check

# Executar testes
pnpm test

# Build local
pnpm build
```

---

## Deploy no Netlify

### 1. Preparar Repositório GitHub

```bash
# Inicializar git (se não existir)
git init
git add .
git commit -m "Initial SofaPredict commit"

# Criar repositório no GitHub
gh repo create sofapredict --private
git push -u origin main
```

### 2. Conectar ao Netlify

1. Ir para https://netlify.com
2. Clicar em "New site from Git"
3. Selecionar repositório `sofapredict`
4. Configurar build:
   - **Build command:** `pnpm build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`

### 3. Configurar Variáveis de Ambiente no Netlify

1. Ir para **Site settings** → **Build & deploy** → **Environment**
2. Adicionar todas as variáveis do `.env.local`
3. Importante: Não expor `RAPIDAPI_KEY` ou `GEMINI_API_KEY` no frontend

### 4. Deploy

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## Deploy no Servidor Node.js

### 1. Preparar Servidor

```bash
# SSH no servidor
ssh user@seu-servidor.com

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Clonar repositório
git clone https://github.com/seu-usuario/sofapredict.git
cd sofapredict
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano .env
# Adicionar todas as variáveis necessárias
```

### 4. Build e Start

```bash
# Build
pnpm build

# Iniciar em produção
NODE_ENV=production pnpm start
```

### 5. Usar PM2 para Manter Serviço Ativo

```bash
# Instalar PM2
npm install -g pm2

# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'sofapredict',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

### 6. Configurar Nginx como Reverse Proxy

```bash
# Instalar Nginx
sudo apt-get install -y nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/sofapredict
```

Adicionar:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/sofapredict /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Auto-renovação
sudo systemctl enable certbot.timer
```

---

## Configuração do Banco de Dados

### 1. Criar Banco de Dados Supabase

1. Ir para https://supabase.com
2. Criar novo projeto
3. Copiar `DATABASE_URL`
4. Adicionar ao `.env`

### 2. Executar Migrações

```bash
# Gerar e executar migrações
pnpm db:push
```

### 3. Verificar Tabelas

```bash
# Conectar ao banco
psql $DATABASE_URL

# Listar tabelas
\dt

# Verificar schema
\d users
```

---

## Monitoramento e Manutenção

### 1. Logs

**Netlify:**
```bash
# Ver logs em tempo real
netlify logs --tail
```

**Servidor Node.js:**
```bash
# Ver logs do PM2
pm2 logs sofapredict

# Ver logs do Nginx
tail -f /var/log/nginx/error.log
```

### 2. Monitorar Performance

```bash
# Verificar uso de memória
pm2 monit

# Verificar conexões de banco
SELECT count(*) FROM pg_stat_activity;
```

### 3. Backup do Banco de Dados

```bash
# Backup automático (Supabase faz automaticamente)
# Ou fazer backup manual:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### 4. Atualizar Código

```bash
# Pull das mudanças
git pull origin main

# Reinstalar dependências se necessário
pnpm install

# Rebuild
pnpm build

# Restart (Netlify faz automaticamente)
# Para servidor Node.js:
pm2 restart sofapredict
```

---

## Troubleshooting

### Erro: "RAPIDAPI_KEY not found"
- Verificar se a variável está configurada no `.env`
- Verificar se a chave é válida em https://rapidapi.com

### Erro: "Database connection failed"
- Verificar `DATABASE_URL`
- Verificar se Supabase está acessível
- Verificar firewall/VPN

### Erro: "Gemini API error"
- Verificar se `GEMINI_API_KEY` está correto
- Verificar quota de requisições
- Verificar se a chave está ativa

### Cache não está funcionando
- Verificar se `CACHE_TTL_*` estão configuradas
- Verificar logs do servidor
- Limpar cache manualmente se necessário

---

## Performance e Otimizações

### 1. Cache Strategy
- Odds ao vivo: 60s (mercado volátil)
- Partidas ao vivo: 120s
- Próximas partidas: 300s
- Estatísticas: 3600s (1 hora)

### 2. Database Optimization
- Adicionar índices em `user_id`, `created_at`
- Usar connection pooling
- Monitorar queries lentas

### 3. Frontend Optimization
- Lazy loading de componentes
- Code splitting
- Compressão de assets

---

## Suporte e Contato

Para questões sobre LGPD: privacy@sofapredict.com
Para suporte técnico: support@sofapredict.com

---

**Última atualização:** Junho 2026
