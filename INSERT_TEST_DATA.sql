-- Script para inserir dados de teste nas tabelas

-- Inserir dados de teste na tabela Usuario
INSERT INTO "Usuario" ("email", "senhaHash", "nome") VALUES
('teste1@example.com', 'hash123', 'Usuário Teste 1'),
('teste2@example.com', 'hash456', 'Usuário Teste 2');

-- Inserir dados de teste na tabela Aviso
INSERT INTO "Aviso" ("titulo", "conteudo", "descricao") VALUES
('Aviso de Teste 1', 'Conteúdo do aviso de teste 1', 'Descrição do aviso 1'),
('Aviso de Teste 2', 'Conteúdo do aviso de teste 2', 'Descrição do aviso 2');

-- Inserir dados de teste na tabela Membro
INSERT INTO "Membro" ("nome", "endereco", "telefone", "aniversario") VALUES
('Membro Teste 1', 'Rua Teste, 123', '(11) 99999-9999', '1990-05-15'),
('Membro Teste 2', 'Av. Exemplo, 456', '(11) 88888-8888', '1985-12-25');

-- Inserir dados de teste na tabela Evento
INSERT INTO "Evento" ("titulo", "data", "local") VALUES
('Evento Teste 1', '2025-12-01 19:00:00', 'Igreja Central'),
('Evento Teste 2', '2025-12-15 18:00:00', 'Salão de Festas');

-- Inserir dados de teste na tabela Diretoria
INSERT INTO "Diretoria" ("nome", "cargo") VALUES
('Diretor Teste 1', 'Presidente'),
('Diretor Teste 2', 'Vice-Presidente');

-- Inserir dados de teste na tabela Financa
INSERT INTO "Financa" ("tipo", "valor", "data", "pagante") VALUES
('receita', 1000.00, '2025-11-01 00:00:00', 'Contribuinte 1'),
('despesa', 500.00, '2025-11-05 00:00:00', '');

-- Inserir dados de teste na tabela Conteudo
INSERT INTO "Conteudo" ("tipo", "titulo", "data") VALUES
('pregacao', 'A Mensagem da Salvação', '2025-11-10 00:00:00'),
('musica', 'Hinos de Adoração', '2025-11-12 00:00:00');

-- Inserir dados de teste na tabela BadgeTemplate
INSERT INTO "BadgeTemplate" ("page", "lado", "img") VALUES
('CRACHAS', 'front', 'template_front_1.png'),
('CRACHAS', 'back', 'template_back_1.png'),
('EMBAIXADORES', 'front', 'embaixador_front_1.png');

-- Inserir dados de teste na tabela Embaixador
INSERT INTO "Embaixador" ("nome", "idade", "telefone") VALUES
('Embaixador Teste 1', 30, '(11) 77777-7777'),
('Embaixador Teste 2', 25, '(11) 66666-6666');

-- Inserir dados de teste na tabela Cracha
INSERT INTO "Cracha" ("nome", "front", "origem") VALUES
('Crachá Teste 1', 'cracha_front_1.png', 'CRACHAS'),
('Crachá Teste 2', 'cracha_front_2.png', 'EMBAIXADORES');

-- Verificar os dados inseridos
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