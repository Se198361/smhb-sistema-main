-- Script para testar a inserção direta de dados no banco de dados

-- Inserir um membro de teste com data de aniversário
INSERT INTO "Membro" ("nome", "endereco", "telefone", "aniversario", "foto") 
VALUES 
('Teste SQL', 'Rua Teste SQL, 123', '(11) 77777-0000', '1995-07-15', '');

-- Verificar se o membro foi inserido corretamente
SELECT "id", "nome", "aniversario", pg_typeof("aniversario") as tipo
FROM "Membro" 
WHERE "nome" = 'Teste SQL';

-- Verificar o formato da data
SELECT 
    "id", 
    "nome", 
    "aniversario",
    EXTRACT(YEAR FROM "aniversario") as ano,
    EXTRACT(MONTH FROM "aniversario") as mes,
    EXTRACT(DAY FROM "aniversario") as dia
FROM "Membro" 
WHERE "nome" = 'Teste SQL';

-- Remover o membro de teste
DELETE FROM "Membro" WHERE "nome" = 'Teste SQL';