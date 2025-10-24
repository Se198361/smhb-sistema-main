-- Script de depuração para verificar políticas RLS e permissões

-- 1. Verificar se RLS está habilitado para todas as tabelas
SELECT 
    c.relname as table_name, 
    c.relrowsecurity as rls_enabled,
    c.relforcerowsecurity as force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND c.relname IN (
    'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
    'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
)
ORDER BY c.relname;

-- 2. Verificar políticas RLS existentes (usando pg_policy diretamente)
SELECT 
    n.nspname AS schemaname,
    c.relname AS tablename,
    p.polname AS policyname,
    CASE 
        WHEN p.polpermissive THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
    END AS permissive,
    pg_get_userbyid(p.polroles[1]) AS roles,
    CASE p.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE 'ALL'
    END AS cmd,
    pg_get_expr(p.polqual, p.polrelid) AS qual,
    pg_get_expr(p.polwithcheck, p.polrelid) AS with_check
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname IN (
    'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
    'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
)
ORDER BY c.relname, p.polname;

-- 3. Verificar permissões de usuários
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN (
    'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
    'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
)
AND grantee IN ('anon', 'authenticated', 'postgres')
ORDER BY table_name, grantee, privilege_type;

-- 4. Verificar estrutura da tabela Usuario
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Usuario'
ORDER BY ordinal_position;

-- 5. Verificar se há dados na tabela Usuario
SELECT COUNT(*) as total_usuarios FROM "Usuario";

-- 6. Testar consulta com política simulada
-- Esta consulta simula o que acontece quando um usuário autenticado tenta acessar seus próprios dados
SELECT 
    u.*,
    (current_setting('request.jwt.claims', true)::json->>'sub') as jwt_sub
FROM "Usuario" u
WHERE (current_setting('request.jwt.claims', true)::json->>'sub')::text = u."id"::text
LIMIT 5;

-- 7. Verificar configurações de autenticação do Supabase
SELECT 
    rolname,
    rolsuper,
    rolcreatedb,
    rolcreaterole,
    rolcanlogin
FROM pg_roles
WHERE rolname IN ('anon', 'authenticated', 'postgres', 'service_role')
ORDER BY rolname;