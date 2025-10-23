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
```

### 3. Deploy

Clique em "Deploy" e aguarde a conclusão do processo.

## Configuração do Supabase

### 1. Criar Tabelas

As tabelas devem ser criadas no Supabase executando os scripts SQL:

1. Acesse o dashboard do Supabase
2. Vá para "SQL Editor"
3. Execute o script [SUPABASE_SCHEMA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_SCHEMA.sql)
4. Execute o script [SUPABASE_FUNCTIONS.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_FUNCTIONS.sql)

### 2. Configurar Políticas de Segurança

Configure as políticas de segurança (RLS - Row Level Security) no dashboard do Supabase para cada tabela:

1. Acesse o dashboard do Supabase
2. Vá para "Table Editor"
3. Para cada tabela, habilite "Enable Realtime" e "Enable Row Level Security"
4. Configure as políticas de acesso conforme necessário

### 3. Configurar Autenticação

1. No dashboard do Supabase, vá para "Authentication" → "Settings"
2. Configure as opções conforme necessário
3. Em "URLs", adicione a URL do seu frontend (ex: https://seu-projeto.vercel.app)

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**: Certifique-se de que a URL do frontend está configurada corretamente no Supabase Auth.

2. **Erro de Conexão com Banco de Dados**: Verifique se as variáveis de ambiente estão corretas.

3. **Funções não encontradas**: Certifique-se de que os scripts SQL foram executados no Supabase.

### Suporte

Se precisar de ajuda adicional, consulte a documentação:
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs