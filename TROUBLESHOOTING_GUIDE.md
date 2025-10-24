# Guia de Solução de Problemas do Supabase

Este guia ajudará você a identificar e resolver problemas comuns ao configurar e usar o Supabase com o projeto SMHB.

## Problemas de Visualização de Dados

### Sintomas:
- Não consigo visualizar dados nas tabelas
- Tabelas aparecem vazias mesmo após inserir dados
- Erros ao acessar determinadas tabelas

### Diagnóstico:

1. **Verifique se as tabelas foram criadas corretamente:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
     'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
   );
   ```

2. **Verifique se há dados nas tabelas:**
   ```sql
   SELECT 'Usuario' as tabela, COUNT(*) as total FROM "Usuario"
   UNION ALL
   SELECT 'Aviso' as tabela, COUNT(*) as total FROM "Aviso"
   UNION ALL
   SELECT 'Membro' as tabela, COUNT(*) as total FROM "Membro"
   UNION ALL
   SELECT 'Evento' as tabela, COUNT(*) as total FROM "Evento"
   UNION ALL
   SELECT 'Diretoria' as tabela, COUNT(*) as total FROM "Diretoria"
   UNION ALL
   SELECT 'Financa' as tabela, COUNT(*) as total FROM "Financa"
   UNION ALL
   SELECT 'Conteudo' as tabela, COUNT(*) as total FROM "Conteudo"
   UNION ALL
   SELECT 'Cracha' as tabela, COUNT(*) as total FROM "Cracha"
   UNION ALL
   SELECT 'Embaixador' as tabela, COUNT(*) as total FROM "Embaixador"
   UNION ALL
   SELECT 'BadgeTemplate' as tabela, COUNT(*) as total FROM "BadgeTemplate";
   ```

3. **Verifique as políticas RLS:**
   ```sql
   SELECT tablename, policyname, permissive, roles, cmd
   FROM pg_policies 
   WHERE schemaname = 'public'
   AND tablename IN (
     'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
     'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
   )
   ORDER BY tablename, policyname;
   ```

### Soluções:

1. **Se as tabelas não existirem:**
   - Execute o script [SUPABASE_SCHEMA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_SCHEMA.sql) novamente

2. **Se as tabelas existirem mas estão vazias:**
   - Execute o script [INSERT_TEST_DATA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/INSERT_TEST_DATA.sql)

3. **Se as políticas RLS estiverem causando problemas:**
   - Execute o script [FIX_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/FIX_RLS_POLICIES.sql) para criar políticas mais permissivas temporariamente
   - Após confirmar que a visualização funciona, você pode reforçar as políticas de segurança

## Problemas de Autenticação

### Sintomas:
- Não consigo fazer login
- Erros ao registrar novo usuário
- Acesso negado a funcionalidades

### Diagnóstico:

1. **Verifique as configurações de autenticação no dashboard do Supabase:**
   - Vá para "Authentication" → "Settings"
   - Certifique-se de que "Enable email signup" está habilitado

2. **Verifique as variáveis de ambiente:**
   ```env
   VITE_SUPABASE_URL=SUA_URL_CORRETA
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_CORRETA
   ```

### Soluções:

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Limpe o cache do navegador:**
   - Ctrl+Shift+R (recarregar sem cache)
   - Ou abra em uma janela anônima

3. **Verifique os logs do console do navegador:**
   - F12 → Console
   - Procure por erros relacionados ao Supabase

## Problemas de Conexão

### Sintomas:
- Erros de conexão ao acessar o Supabase
- Tempo limite esgotado
- Erros de CORS

### Diagnóstico:

1. **Verifique a conectividade com o Supabase:**
   ```javascript
   // No console do navegador
   supabase
     .from('Usuario')
     .select('*')
     .limit(1)
     .then(console.log)
     .catch(console.error);
   ```

2. **Verifique as URLs configuradas no Supabase:**
   - Vá para "Authentication" → "Settings" → "URLs"
   - Certifique-se de que a URL do seu site está listada

### Soluções:

1. **Verifique as variáveis de ambiente:**
   - Certifique-se de que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas

2. **Verifique o firewall e proxy:**
   - Certifique-se de que não há bloqueios de rede

## Problemas com Operações CRUD

### Sintomas:
- Não consigo inserir dados
- Não consigo atualizar dados
- Não consigo deletar dados

### Diagnóstico:

1. **Teste operações básicas:**
   ```sql
   -- Teste de inserção
   INSERT INTO "Aviso" ("titulo", "conteudo") 
   VALUES ('Teste de diagnóstico', 'Conteúdo de teste');
   
   -- Teste de seleção
   SELECT * FROM "Aviso" WHERE "titulo" = 'Teste de diagnóstico';
   
   -- Teste de atualização
   UPDATE "Aviso" 
   SET "conteudo" = 'Conteúdo atualizado' 
   WHERE "titulo" = 'Teste de diagnóstico';
   
   -- Teste de deleção
   DELETE FROM "Aviso" 
   WHERE "titulo" = 'Teste de diagnóstico';
   ```

### Soluções:

1. **Verifique as políticas RLS:**
   - Execute [FIX_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/FIX_RLS_POLICIES.sql) para políticas mais permissivas

2. **Verifique permissões de usuário:**
   - Certifique-se de estar logado como usuário autenticado

## Depuração Avançada

### Usar o script de depuração:
1. Execute [DEBUG_RLS_POLICIES.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/DEBUG_RLS_POLICIES.sql) no SQL Editor do Supabase
2. Analise os resultados para identificar problemas específicos

### Verificar logs:
1. No dashboard do Supabase, vá para "Logs" → "Database"
2. Procure por erros recentes

### Testar com um usuário de serviço:
Se estiver usando a chave de serviço (service_role), certifique-se de que está usando-a apenas no backend, nunca no frontend.

## Próximos Passos

Se após seguir todos esses passos você ainda tiver problemas:

1. Tire printscreens dos erros
2. Verifique os logs completos
3. Consulte a documentação oficial do Supabase
4. Considere criar um novo projeto Supabase do zero e reimportar os dados