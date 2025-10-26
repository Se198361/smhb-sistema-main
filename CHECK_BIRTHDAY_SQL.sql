-- Script para verificar como as datas de aniversário estão sendo armazenadas no banco de dados

-- Verificar a estrutura da tabela Membro
\d "Membro";

-- Consultar alguns registros para verificar o formato da data de aniversário
SELECT 
    id,
    nome,
    aniversario,
    pg_typeof(aniversario) as tipo_aniversario
FROM "Membro"
LIMIT 5;

-- Verificar se há registros com datas de aniversário preenchidas
SELECT 
    id,
    nome,
    aniversario,
    EXTRACT(YEAR FROM aniversario) as ano,
    EXTRACT(MONTH FROM aniversario) as mes,
    EXTRACT(DAY FROM aniversario) as dia
FROM "Membro"
WHERE aniversario IS NOT NULL
LIMIT 5;

-- Verificar como as datas estão sendo armazenadas em formato de string
SELECT 
    id,
    nome,
    aniversario,
    TO_CHAR(aniversario, 'DD/MM/YYYY') as data_formatada
FROM "Membro"
WHERE aniversario IS NOT NULL
LIMIT 5;