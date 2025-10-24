-- Script para verificar se as tabelas estão corretamente criadas no Supabase

-- Verificar se as tabelas existem
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
  'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
)
ORDER BY table_name;

-- Verificar a estrutura da tabela Usuario
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Usuario'
ORDER BY ordinal_position;

-- Verificar se RLS está habilitado para a tabela Usuario
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND relname = 'Usuario';

-- Verificar políticas RLS para a tabela Usuario (se existirem)
SELECT polname, polrelid::regclass AS table_name, polcmd AS command, polqual AS condition
FROM pg_policy
WHERE polrelid = 'Usuario'::regclass;