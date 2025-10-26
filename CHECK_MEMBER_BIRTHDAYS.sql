-- Script para verificar se as datas de aniversário foram inseridas corretamente

-- Verificar todos os membros e suas datas de aniversário
SELECT 
    "id",
    "nome",
    "aniversario",
    pg_typeof("aniversario") as tipo_data
FROM "Membro"
ORDER BY "id";

-- Verificar se as datas de aniversário estão no formato correto
SELECT 
    "id",
    "nome",
    "aniversario",
    EXTRACT(YEAR FROM "aniversario") as ano,
    EXTRACT(MONTH FROM "aniversario") as mes,
    EXTRACT(DAY FROM "aniversario") as dia
FROM "Membro"
WHERE "aniversario" IS NOT NULL
ORDER BY "id";

-- Verificar como as datas estão sendo armazenadas como texto
SELECT 
    "id",
    "nome",
    "aniversario",
    TO_CHAR("aniversario", 'YYYY-MM-DD') as data_formatada,
    TO_CHAR("aniversario", 'DD/MM/YYYY') as data_brasileira
FROM "Membro"
WHERE "aniversario" IS NOT NULL
ORDER BY "id";