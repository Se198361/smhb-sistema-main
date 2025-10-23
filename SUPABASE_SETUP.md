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

#### Criar Tabelas

Para criar as tabelas automaticamente:

1. Acesse o dashboard do Supabase
2. Vá para "SQL Editor"
3. Cole o conteúdo do arquivo [SUPABASE_SCHEMA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_SCHEMA.sql)
4. Execute o script

#### Criar Funções

Para criar as funções personalizadas:

1. Acesse o dashboard do Supabase
2. Vá para "SQL Editor"
3. Cole o conteúdo do arquivo [SUPABASE_FUNCTIONS.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_FUNCTIONS.sql)
4. Execute o script

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
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

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
3. **Tabelas não encontradas**: Certifique-se de que os scripts foram executados
4. **Funções não encontradas**: Certifique-se de que os scripts de funções foram executados

### Suporte

Para mais informações, consulte a documentação oficial do Supabase:
- https://supabase.com/docs

Veja também o guia de migração completo:
- [SUPABASE_MIGRATION_GUIDE.md](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_MIGRATION_GUIDE.md)
