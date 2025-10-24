# Guia Completo de Configuração do Supabase

Este guia irá ajudá-lo a configurar todas as tabelas e funcionalidades necessárias para o projeto SMHB no Supabase.

## Passo 1: Acessar o Dashboard do Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Crie um novo projeto (caso ainda não tenha um) com as seguintes configurações:
   - Nome do projeto: `smhb-sistema`
   - Senha do banco de dados: Use uma senha segura
   - Região: Escolha a região mais próxima de você

## Passo 2: Configurar as Variáveis de Ambiente

No arquivo [.env](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/.env) do seu projeto, atualize com as informações do seu projeto Supabase:

```env
VITE_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA
SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_DE_SERVIÇO
DATABASE_URL=SUA_URL_DO_BANCO_DE_DADOS
```

Você pode encontrar essas informações no dashboard do Supabase:
- Vá para "Project Settings" → "API"
- Copie a "Project URL" para `VITE_SUPABASE_URL` e `SUPABASE_URL`
- Copie a "anon public" key para `VITE_SUPABASE_ANON_KEY`
- Copie a "service_role secret" para `SUPABASE_SERVICE_ROLE_KEY`

## Passo 3: Criar as Tabelas

1. No dashboard do Supabase, vá para "SQL Editor"
2. Copie e cole o conteúdo do arquivo [SUPABASE_SCHEMA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_SCHEMA.sql)
3. Clique em "Run" para executar o script

Este script irá criar todas as tabelas necessárias:
- Usuario
- Aviso
- Membro
- Evento
- Diretoria
- Financa
- Conteudo
- Cracha
- Embaixador
- BadgeTemplate

## Passo 4: Configurar as Políticas de Segurança (RLS)

1. Ainda no "SQL Editor" do Supabase, copie e cole o conteúdo do arquivo [CONFIGURE_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/CONFIGURE_RLS_POLICIES.sql)
2. Clique em "Run" para executar o script

Este script irá configurar as políticas de segurança para todas as tabelas, garantindo que apenas usuários autenticados possam acessar os dados conforme necessário.

## Passo 5: Verificar as Tabelas Criadas

1. No dashboard do Supabase, vá para "Table Editor"
2. Verifique se todas as tabelas foram criadas corretamente
3. Clique em cada tabela para verificar suas colunas e estrutura

## Passo 6: Testar a Conexão

1. No seu terminal, na raiz do projeto, execute:
   ```bash
   npm run dev
   ```
2. Acesse [http://localhost:5174](http://localhost:5174)
3. Tente fazer o cadastro de um novo usuário
4. Faça login com o usuário criado

## Passo 7: Inserir Dados de Teste (Opcional)

Se quiser inserir dados de teste:

1. No "SQL Editor" do Supabase, copie e cole o conteúdo do arquivo [INSERT_TEST_DATA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/INSERT_TEST_DATA.sql)
2. Clique em "Run" para executar o script

## Passo 8: Testar Operações CRUD (Opcional)

Para testar as operações CRUD:

1. No "SQL Editor" do Supabase, copie e cole o conteúdo do arquivo [TEST_CRUD_OPERATIONS.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/TEST_CRUD_OPERATIONS.sql)
2. Clique em "Run" para executar o script

## Solução de Problemas

Se você encontrar problemas, consulte o guia detalhado em [TROUBLESHOOTING_GUIDE.md](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/TROUBLESHOOTING_GUIDE.md).

### Erro: "Could not find the table 'public.Usuario' in the schema cache"

Se você encontrar este erro:

1. Verifique se as tabelas foram criadas corretamente no "Table Editor"
2. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Verifique se as variáveis de ambiente estão corretas no arquivo [.env](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/.env)

### Erro de Sintaxe SQL (ERROR: 42601: syntax error at or near "NOT")

Este erro ocorre quando se tenta usar `IF NOT EXISTS` com `CREATE POLICY`. Para resolver:

1. Use o script [CONFIGURE_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/CONFIGURE_RLS_POLICIES.sql) corrigido, que usa `DROP POLICY IF EXISTS` antes de criar as políticas
2. Execute o script no "SQL Editor" do Supabase

### Erro de Tipo (ERROR: 42883: operator does not exist: uuid = integer)

Este erro ocorre devido a incompatibilidade de tipos entre `auth.uid()` (UUID) e o campo `id` (inteiro) nas políticas RLS. Para resolver:

1. Use o script [CONFIGURE_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/CONFIGURE_RLS_POLICIES.sql) corrigido, que faz a conversão de tipos adequada usando `::text`
2. Execute o script no "SQL Editor" do Supabase

### Problemas de Visualização de Dados

Se não conseguir visualizar os dados:

1. Execute o script [FIX_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/FIX_RLS_POLICIES.sql) para criar políticas mais permissivas temporariamente
2. Verifique se há dados nas tabelas usando o script [DEBUG_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/DEBUG_RLS_POLICIES.sql)

### Scripts de Depuração

Para ajudar na solução de problemas, foram criados scripts de depuração:

1. [DEBUG_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/DEBUG_RLS_POLICIES.sql) - Verifica políticas RLS, permissões e estrutura das tabelas
2. [FIX_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/FIX_RLS_POLICIES.sql) - Cria políticas temporariamente permissivas para resolver problemas de visualização

Execute esses scripts no "SQL Editor" do Supabase para diagnosticar problemas.

### Problemas com Autenticação

Se tiver problemas com autenticação:

1. Verifique se as políticas RLS foram configuradas corretamente
2. No dashboard do Supabase, vá para "Authentication" → "Settings"
3. Certifique-se de que as configurações estão corretas

### Problemas com Conexão

Se tiver problemas de conexão:

1. Verifique se a URL do projeto e as chaves estão corretas
2. Verifique se o projeto Supabase está ativo
3. Verifique se não há restrições de rede/firewall

## Suporte Adicional

Se precisar de ajuda adicional:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do terminal onde está rodando o projeto
3. Consulte a documentação oficial do Supabase em [https://supabase.com/docs](https://supabase.com/docs)

## Próximos Passos

Após configurar o Supabase:

1. Faça o deploy do frontend na Vercel
2. Configure variáveis de ambiente na Vercel
3. Teste todas as funcionalidades em produção