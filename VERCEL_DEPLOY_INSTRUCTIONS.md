# Instruções para Deploy na Vercel

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Projeto já commitado no GitHub

## Passos para Deploy

### 1. Importar o Projeto na Vercel

1. Acesse o dashboard da Vercel: https://vercel.com/dashboard
2. Clique em "New Project"
3. Selecione o repositório do projeto no GitHub
4. Configure as seguintes opções:
   - Framework Preset: Vite
   - Root Directory: Deixe em branco (raiz do projeto)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. Configurar Variáveis de Ambiente

Na seção "Environment Variables" da Vercel, adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://kkyryjkjynjbhbcespzo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreXJ5amtqeW5qYmhiY2VzcHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTI4ODcsImV4cCI6MjA3NjgyODg4N30.jAqPEJmd5lvwn_3jFKBRY0OQ-MO4R_VtJ71-Uc2dynk
VITE_API_BASE=https://SEU-BACKEND-URL
```

### 3. Configurar Redirecionamentos

Certifique-se de que o arquivo `vercel.json` está configurado corretamente:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

### 4. Deploy do Backend

O backend precisa ser implantado separadamente. Você pode usar serviços como:
- Railway (https://railway.app)
- Render (https://render.com)
- Heroku (https://heroku.com)
- Servidor próprio com Node.js

### 5. Configurar Variáveis de Ambiente do Backend

No serviço onde você implantar o backend, configure as seguintes variáveis de ambiente:

```
DATABASE_URL=postgresql://postgres.d83e7f0734077cf861957776e0b3cd13ae93d874@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
SUPABASE_URL=https://kkyryjkjynjbhbcespzo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreXJ5amtqeW5qYmhiY2VzcHpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI1Mjg4NywiZXhwIjoyMDc2ODI4ODg3fQ.9J9u7V5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5
PORT=3001
JWT_SECRET=seu_segredo_jwt
APP_BASE_URL=https://seu-projeto.vercel.app
```

### 6. Executar Migrações do Banco de Dados

Após configurar o backend, execute as migrações do Prisma:

```bash
npx prisma migrate deploy
```

## Configuração do Supabase

### 1. Criar Tabelas

As tabelas serão criadas automaticamente pelas migrações do Prisma, mas você também pode criá-las manualmente no dashboard do Supabase.

### 2. Configurar Políticas de Segurança

Configure as políticas de segurança (RLS - Row Level Security) no dashboard do Supabase para cada tabela:

1. Acesse o dashboard do Supabase
2. Vá para "Table Editor"
3. Para cada tabela, habilite "Enable Realtime" e "Enable Row Level Security"
4. Configure as políticas de acesso conforme necessário

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**: Certifique-se de que a variável `APP_BASE_URL` no backend está configurada com a URL correta da Vercel.

2. **Erro de Conexão com Banco de Dados**: Verifique se a `DATABASE_URL` está correta e se o Supabase está acessível.

3. **Erro 404 em Rotas da API**: Verifique se o arquivo `vercel.json` está configurado corretamente.

### Suporte

Se precisar de ajuda adicional, consulte a documentação:
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Prisma: https://www.prisma.io/docs