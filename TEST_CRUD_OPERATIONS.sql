-- Script para testar operações CRUD nas tabelas

-- Testar SELECT em todas as tabelas
SELECT * FROM "Usuario" LIMIT 2;
SELECT * FROM "Aviso" LIMIT 2;
SELECT * FROM "Membro" LIMIT 2;
SELECT * FROM "Evento" LIMIT 2;
SELECT * FROM "Diretoria" LIMIT 2;
SELECT * FROM "Financa" LIMIT 2;
SELECT * FROM "Conteudo" LIMIT 2;
SELECT * FROM "Cracha" LIMIT 2;
SELECT * FROM "Embaixador" LIMIT 2;
SELECT * FROM "BadgeTemplate" LIMIT 2;

-- Testar INSERT
INSERT INTO "Usuario" ("email", "senhaHash", "nome") 
VALUES ('teste.crud@example.com', 'hash.crud', 'Usuário CRUD Teste');

INSERT INTO "Aviso" ("titulo", "conteudo", "descricao") 
VALUES ('Aviso CRUD Teste', 'Conteúdo do aviso CRUD', 'Descrição do aviso CRUD');

INSERT INTO "Membro" ("nome", "endereco", "telefone") 
VALUES ('Membro CRUD Teste', 'Rua CRUD, 789', '(11) 55555-5555');

-- Testar UPDATE
UPDATE "Usuario" SET "nome" = 'Usuário CRUD Atualizado' WHERE "email" = 'teste.crud@example.com';
UPDATE "Aviso" SET "titulo" = 'Aviso CRUD Atualizado' WHERE "titulo" = 'Aviso CRUD Teste';
UPDATE "Membro" SET "endereco" = 'Rua CRUD Atualizada, 789' WHERE "nome" = 'Membro CRUD Teste';

-- Testar DELETE
DELETE FROM "Usuario" WHERE "email" = 'teste.crud@example.com';
DELETE FROM "Aviso" WHERE "titulo" = 'Aviso CRUD Atualizado';
DELETE FROM "Membro" WHERE "nome" = 'Membro CRUD Teste';

-- Verificar que os dados foram removidos
SELECT COUNT(*) as total_usuarios FROM "Usuario" WHERE "email" = 'teste.crud@example.com';
SELECT COUNT(*) as total_avisos FROM "Aviso" WHERE "titulo" = 'Aviso CRUD Atualizado';
SELECT COUNT(*) as total_membros FROM "Membro" WHERE "nome" = 'Membro CRUD Teste';

-- Testar relacionamentos
-- Inserir um embaixador
INSERT INTO "Embaixador" ("nome", "idade", "telefone") 
VALUES ('Embaixador Relacionamento', 35, '(11) 44444-4444');

-- Obter o ID do embaixador inserido
SELECT "id" FROM "Embaixador" WHERE "nome" = 'Embaixador Relacionamento';

-- Inserir um crachá associado ao embaixador (substitua o ID_EMB embaixo pelo ID retornado acima)
-- INSERT INTO "Cracha" ("nome", "front", "embaixadorId") 
-- VALUES ('Crachá Embaixador', 'cracha_embaixador.png', ID_EMB);

-- Verificar o relacionamento
SELECT c."nome" as cracha, e."nome" as embaixador 
FROM "Cracha" c 
JOIN "Embaixador" e ON c."embaixadorId" = e."id"
WHERE e."nome" = 'Embaixador Relacionamento';

-- Limpar dados de teste de relacionamento
DELETE FROM "Cracha" WHERE "nome" = 'Crachá Embaixador';
DELETE FROM "Embaixador" WHERE "nome" = 'Embaixador Relacionamento';