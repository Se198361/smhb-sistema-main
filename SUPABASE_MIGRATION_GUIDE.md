# Guia de Migração para Supabase

Este documento descreve como migrar o sistema SMHB para utilizar o Supabase como backend completo.

## Visão Geral da Migração

A migração envolveu:
1. Criação das tabelas no Supabase Database
2. Configuração do Supabase Auth para autenticação
3. Criação de funções SQL personalizadas
4. Atualização do frontend para usar o cliente Supabase
5. Remoção do servidor Express

## Etapas de Migração

### 1. Configuração do Banco de Dados

Execute o script [SUPABASE_SCHEMA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_SCHEMA.sql) no Supabase SQL Editor:

1. Acesse o dashboard do Supabase
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo [SUPABASE_SCHEMA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_SCHEMA.sql)
4. Execute o script

### 2. Configuração das Funções

Execute o script [SUPABASE_FUNCTIONS.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_FUNCTIONS.sql) no Supabase SQL Editor:

1. Acesse o dashboard do Supabase
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo [SUPABASE_FUNCTIONS.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_FUNCTIONS.sql)
4. Execute o script

### 3. Configuração das Políticas de Segurança

Configure as políticas RLS (Row Level Security) para cada tabela conforme necessário:

1. Acesse o dashboard do Supabase
2. Vá para Table Editor
3. Para cada tabela, habilite "Enable Realtime" e "Enable Row Level Security"
4. Configure as políticas de acesso conforme as necessidades de segurança

Exemplo de política para a tabela Usuario:
```sql
-- Habilitar RLS
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;

-- Política para usuários poderem visualizar seus próprios dados
CREATE POLICY "Usuários podem visualizar seus próprios dados" ON "Usuario"
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários poderem inserir seus próprios dados
CREATE POLICY "Usuários podem inserir seus próprios dados" ON "Usuario"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para usuários poderem atualizar seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON "Usuario"
  FOR UPDATE USING (auth.uid() = id);
```

### 4. Configuração do Supabase Auth

1. Acesse o dashboard do Supabase
2. Vá para Authentication → Settings
3. Configure as opções conforme necessário:
   - Site URL: URL do seu frontend (ex: https://seu-projeto.vercel.app)
   - URLs de redirecionamento: Adicione as URLs de callback necessárias

### 5. Atualização das Variáveis de Ambiente

Atualize o arquivo [.env](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/.env) com as credenciais do Supabase:

```env
VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA
SUPABASE_URL=SUA_URL_DO_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_DE_SERVIÇO
```

### 6. Teste da Migração

1. Inicie o frontend:
   ```bash
   npm run dev
   ```

2. Verifique se todas as funcionalidades estão funcionando corretamente
3. Teste o registro e login de usuários
4. Teste as operações CRUD em todas as entidades

## Arquivos Criados/Modificados

### Novos Arquivos
- [SUPABASE_SCHEMA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_SCHEMA.sql) - Schema do banco de dados
- [SUPABASE_FUNCTIONS.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_FUNCTIONS.sql) - Funções SQL personalizadas
- [src/lib/supabaseFunctions.js](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/src/lib/supabaseFunctions.js) - Funções JavaScript para interagir com o Supabase

### Arquivos Modificados
- [src/context/AuthContext.jsx](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/src/context/AuthContext.jsx) - Atualizado para usar Supabase Auth
- [src/lib/api.js](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/src/lib/api.js) - Atualizado para usar funções do Supabase
- [src/lib/supabase.js](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/src/lib/supabase.js) - Mantido com configurações atualizadas
- [package.json](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/package.json) - Atualizado para remover scripts do servidor
- [README.md](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/README.md) - Atualizado com informações da migração

### Arquivos Removidos
- [server/index.js](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/server/index.js) - Servidor Express removido

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com o Supabase**: Verifique se as variáveis de ambiente estão corretas
2. **Permissões insuficientes**: Verifique as políticas RLS configuradas
3. **Funções não encontradas**: Certifique-se de que os scripts SQL foram executados
4. **Erros de autenticação**: Verifique as configurações do Supabase Auth

### Suporte

Para mais informações, consulte a documentação oficial:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)