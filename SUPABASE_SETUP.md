# Configuração do Supabase

## Passos para Configurar o Supabase

### 1. Criar Conta e Projeto

1. Acesse https://supabase.com
2. Crie uma conta ou faça login
3. Crie um novo projeto com as credenciais fornecidas:
   - Project URL: https://kkyryjkjynjbhbcespzo.supabase.co
   - API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreXJ5amtqeW5qYmhiY2VzcHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTI4ODcsImV4cCI6MjA3NjgyODg4N30.jAqPEJmd5lvwn_3jFKBRY0OQ-MO4R_VtJ71-Uc2dynk
   - Access Tokens: sbp_d83e7f0734077cf861957776e0b3cd13ae93d874

### 2. Configurar o Banco de Dados

#### Conectar ao Banco de Dados

1. No dashboard do Supabase, vá para "Project Settings" → "Database"
2. Anote as seguintes informações:
   - Host: db.kkyryjkjynjbhbcespzo.supabase.co
   - Port: 5432
   - Database: postgres
   - User: postgres.d83e7f0734077cf861957776e0b3cd13ae93d874
   - Password: sbp_d83e7f0734077cf861957776e0b3cd13ae93d874

#### Criar Tabelas com Prisma

Para criar as tabelas automaticamente usando Prisma:

1. Configure as variáveis de ambiente no seu ambiente de desenvolvimento:
   ```
   DATABASE_URL=postgresql://postgres.d83e7f0734077cf861957776e0b3cd13ae93d874@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
   ```

2. Execute as migrações:
   ```bash
   npx prisma migrate deploy
   ```

#### Criar Tabelas Manualmente (Opcional)

Se preferir criar as tabelas manualmente, use o SQL abaixo:

```sql
-- Tabela Avisos
CREATE TABLE "Aviso" (
  "id" SERIAL PRIMARY KEY,
  "titulo" TEXT NOT NULL,
  "conteudo" TEXT,
  "descricao" TEXT,
  "inicio" TIMESTAMP WITH TIME ZONE,
  "fim" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Membros
CREATE TABLE "Membro" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "endereco" TEXT NOT NULL,
  "telefone" TEXT NOT NULL,
  "aniversario" TIMESTAMP WITH TIME ZONE,
  "foto" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Eventos
CREATE TABLE "Evento" (
  "id" SERIAL PRIMARY KEY,
  "titulo" TEXT NOT NULL,
  "data" TIMESTAMP WITH TIME ZONE NOT NULL,
  "horario" TEXT,
  "local" TEXT NOT NULL,
  "comparecido" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Diretoria
CREATE TABLE "Diretoria" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "cargo" TEXT NOT NULL,
  "foto" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Financas
CREATE TABLE "Financa" (
  "id" SERIAL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "valor" DOUBLE PRECISION NOT NULL,
  "data" TIMESTAMP WITH TIME ZONE NOT NULL,
  "pagante" TEXT NOT NULL,
  "uso" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Conteudo
CREATE TABLE "Conteudo" (
  "id" SERIAL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "data" TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Usuario
CREATE TABLE "Usuario" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "nome" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Cracha
CREATE TABLE "Cracha" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "front" TEXT NOT NULL,
  "back" TEXT,
  "origem" TEXT DEFAULT 'CRACHAS',
  "embaixadorId" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Embaixador
CREATE TABLE "Embaixador" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "idade" INTEGER,
  "telefone" TEXT,
  "foto" TEXT,
  "pai" TEXT,
  "mae" TEXT,
  "templateFrontId" INTEGER,
  "templateBackId" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela BadgeTemplate
CREATE TABLE "BadgeTemplate" (
  "id" SERIAL PRIMARY KEY,
  "page" TEXT NOT NULL,
  "lado" TEXT NOT NULL,
  "name" TEXT,
  "img" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar chaves estrangeiras
ALTER TABLE "Cracha" ADD CONSTRAINT "Cracha_embaixadorId_fkey" FOREIGN KEY ("embaixadorId") REFERENCES "Embaixador"("id");

ALTER TABLE "Embaixador" ADD CONSTRAINT "Embaixador_templateFrontId_fkey" FOREIGN KEY ("templateFrontId") REFERENCES "BadgeTemplate"("id");

ALTER TABLE "Embaixador" ADD CONSTRAINT "Embaixador_templateBackId_fkey" FOREIGN KEY ("templateBackId") REFERENCES "BadgeTemplate"("id");
```

### 3. Configurar Políticas de Segurança (RLS)

Para cada tabela, configure as políticas de acesso:

1. Acesse o dashboard do Supabase
2. Vá para "Table Editor" → Selecione a tabela
3. Clique em "Enable Realtime" e "Enable Row Level Security"
4. Configure as políticas de acesso conforme necessário

Exemplo de políticas para a tabela Usuario:

```sql
-- Habilitar RLS
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuários podem visualizar seus próprios dados" ON "Usuario"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios dados" ON "Usuario"
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON "Usuario"
  FOR UPDATE USING (auth.uid() = id);
```

### 4. Configurar Autenticação

1. No dashboard do Supabase, vá para "Authentication" → "Settings"
2. Configure as opções conforme necessário
3. Em "URLs", adicione a URL do seu frontend (ex: https://seu-projeto.vercel.app)

### 5. Testar Conexão

Para testar a conexão com o Supabase:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://kkyryjkjynjbhbcespzo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreXJ5amtqeW5qYmhiY2VzcHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTI4ODcsImV4cCI6MjA3NjgyODg4N30.jAqPEJmd5lvwn_3jFKBRY0OQ-MO4R_VtJ71-Uc2dynk'
)

// Testar conexão
async function testConnection() {
  try {
    const { data, error } = await supabase.from('Usuario').select('*').limit(1)
    if (error) throw error
    console.log('Conexão bem-sucedida:', data)
  } catch (error) {
    console.error('Erro na conexão:', error)
  }
}

testConnection()
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão**: Verifique se a URL e a chave estão corretas
2. **Permissões insuficientes**: Configure as políticas RLS corretamente
3. **Tabelas não encontradas**: Certifique-se de que as migrações foram executadas

### Suporte

Para mais informações, consulte a documentação oficial do Supabase:
- https://supabase.com/docs