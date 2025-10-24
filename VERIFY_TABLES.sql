-- Script para verificar se todas as tabelas e colunas foram criadas corretamente

-- Verificar se todas as tabelas existem
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

-- Verificar a estrutura da tabela Aviso
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Aviso'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela Membro
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Membro'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela Evento
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Evento'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela Diretoria
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Diretoria'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela Financa
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Financa'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela Conteudo
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Conteudo'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela Cracha
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Cracha'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela Embaixador
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Embaixador'
ORDER BY ordinal_position;

-- Verificar a estrutura da tabela BadgeTemplate
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'BadgeTemplate'
ORDER BY ordinal_position;

-- Verificar as chaves estrangeiras
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN (
  'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
  'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
)
ORDER BY tc.table_name;