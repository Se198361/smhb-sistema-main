-- Script para testar a inserção e recuperação de um membro com data de aniversário

-- Inserir um membro de teste com data de aniversário
INSERT INTO "Membro" ("nome", "endereco", "telefone", "aniversario") 
VALUES ('Teste Aniversário', 'Rua Teste, 123', '(11) 99999-0000', '1990-05-15');

-- Recuperar o membro inserido
SELECT 
    "id",
    "nome",
    "endereco",
    "telefone",
    "aniversario",
    pg_typeof("aniversario") as tipo_data
FROM "Membro"
WHERE "nome" = 'Teste Aniversário';

-- Verificar o formato da data
SELECT 
    "id",
    "nome",
    "aniversario",
    EXTRACT(YEAR FROM "aniversario") as ano,
    EXTRACT(MONTH FROM "aniversario") as mes,
    EXTRACT(DAY FROM "aniversario") as dia,
    TO_CHAR("aniversario", 'YYYY-MM-DD') as data_formatada,
    TO_CHAR("aniversario", 'DD/MM/YYYY') as data_brasileira
FROM "Membro"
WHERE "nome" = 'Teste Aniversário';

-- Atualizar a data de aniversário
UPDATE "Membro" 
SET "aniversario" = '1985-12-25'
WHERE "nome" = 'Teste Aniversário';

-- Verificar se a atualização foi bem sucedida
SELECT 
    "id",
    "nome",
    "aniversario",
    TO_CHAR("aniversario", 'YYYY-MM-DD') as data_formatada,
    TO_CHAR("aniversario", 'DD/MM/YYYY') as data_brasileira
FROM "Membro"
WHERE "nome" = 'Teste Aniversário';

-- Remover o membro de teste
DELETE FROM "Membro" WHERE "nome" = 'Teste Aniversário';

-- Confirmar que o membro foi removido
SELECT COUNT(*) as total
FROM "Membro"
WHERE "nome" = 'Teste Aniversário';