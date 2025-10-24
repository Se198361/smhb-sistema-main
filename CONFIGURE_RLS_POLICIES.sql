-- Script para configurar políticas de segurança (RLS) para todas as tabelas

-- Garantir que RLS está habilitado para todas as tabelas
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Aviso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membro" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Evento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Diretoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Financa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conteudo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cracha" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Embaixador" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BadgeTemplate" ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios dados" ON "Usuario";
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON "Usuario";
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON "Usuario";
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios dados" ON "Usuario";
DROP POLICY IF EXISTS "Todos podem visualizar avisos" ON "Aviso";
DROP POLICY IF EXISTS "Usuários autenticados podem inserir avisos" ON "Aviso";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar avisos" ON "Aviso";
DROP POLICY IF EXISTS "Usuários autenticados podem deletar avisos" ON "Aviso";
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar membros" ON "Membro";
DROP POLICY IF EXISTS "Usuários autenticados podem inserir membros" ON "Membro";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar membros" ON "Membro";
DROP POLICY IF EXISTS "Usuários autenticados podem deletar membros" ON "Membro";
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar eventos" ON "Evento";
DROP POLICY IF EXISTS "Usuários autenticados podem inserir eventos" ON "Evento";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar eventos" ON "Evento";
DROP POLICY IF EXISTS "Usuários autenticados podem deletar eventos" ON "Evento";
DROP POLICY IF EXISTS "Todos podem visualizar diretoria" ON "Diretoria";
DROP POLICY IF EXISTS "Usuários autenticados podem inserir diretores" ON "Diretoria";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar diretores" ON "Diretoria";
DROP POLICY IF EXISTS "Usuários autenticados podem deletar diretores" ON "Diretoria";
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar finanças" ON "Financa";
DROP POLICY IF EXISTS "Usuários autenticados podem inserir finanças" ON "Financa";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar finanças" ON "Financa";
DROP POLICY IF EXISTS "Usuários autenticados podem deletar finanças" ON "Financa";
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar conteúdos" ON "Conteudo";
DROP POLICY IF EXISTS "Usuários autenticados podem inserir conteúdos" ON "Conteudo";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar conteúdos" ON "Conteudo";
DROP POLICY IF EXISTS "Usuários autenticados podem deletar conteúdos" ON "Conteudo";
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar crachás" ON "Cracha";
DROP POLICY IF EXISTS "Usuários autenticados podem inserir crachás" ON "Cracha";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar crachás" ON "Cracha";
DROP POLICY IF EXISTS "Usuários autenticados podem deletar crachás" ON "Cracha";
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar embaixadores" ON "Embaixador";
DROP POLICY IF EXISTS "Usuários autenticados podem inserir embaixadores" ON "Embaixador";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar embaixadores" ON "Embaixador";
DROP POLICY IF EXISTS "Usuários autenticados podem deletar embaixadores" ON "Embaixador";
DROP POLICY IF EXISTS "Todos podem visualizar templates" ON "BadgeTemplate";
DROP POLICY IF EXISTS "Usuários autenticados podem inserir templates" ON "BadgeTemplate";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar templates" ON "BadgeTemplate";
DROP POLICY IF EXISTS "Usuários autenticados podem deletar templates" ON "BadgeTemplate";

-- Políticas para tabela Usuario
CREATE POLICY "Usuários podem visualizar seus próprios dados" ON "Usuario"
  FOR SELECT USING (auth.uid()::text = "id"::text);

CREATE POLICY "Usuários podem inserir seus próprios dados" ON "Usuario"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON "Usuario"
  FOR UPDATE USING (auth.uid()::text = "id"::text);

CREATE POLICY "Usuários podem deletar seus próprios dados" ON "Usuario"
  FOR DELETE USING (auth.uid()::text = "id"::text);

-- Políticas para tabela Aviso (acesso público para leitura)
CREATE POLICY "Todos podem visualizar avisos" ON "Aviso"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir avisos" ON "Aviso"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar avisos" ON "Aviso"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar avisos" ON "Aviso"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela Membro
CREATE POLICY "Usuários autenticados podem visualizar membros" ON "Membro"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir membros" ON "Membro"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar membros" ON "Membro"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar membros" ON "Membro"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela Evento
CREATE POLICY "Usuários autenticados podem visualizar eventos" ON "Evento"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir eventos" ON "Evento"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar eventos" ON "Evento"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar eventos" ON "Evento"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela Diretoria (acesso público para leitura)
CREATE POLICY "Todos podem visualizar diretoria" ON "Diretoria"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir diretores" ON "Diretoria"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar diretores" ON "Diretoria"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar diretores" ON "Diretoria"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela Financa
CREATE POLICY "Usuários autenticados podem visualizar finanças" ON "Financa"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir finanças" ON "Financa"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar finanças" ON "Financa"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar finanças" ON "Financa"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela Conteudo
CREATE POLICY "Usuários autenticados podem visualizar conteúdos" ON "Conteudo"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir conteúdos" ON "Conteudo"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar conteúdos" ON "Conteudo"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar conteúdos" ON "Conteudo"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela Cracha
CREATE POLICY "Usuários autenticados podem visualizar crachás" ON "Cracha"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir crachás" ON "Cracha"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar crachás" ON "Cracha"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar crachás" ON "Cracha"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela Embaixador
CREATE POLICY "Usuários autenticados podem visualizar embaixadores" ON "Embaixador"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir embaixadores" ON "Embaixador"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar embaixadores" ON "Embaixador"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar embaixadores" ON "Embaixador"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tabela BadgeTemplate (acesso público para leitura)
CREATE POLICY "Todos podem visualizar templates" ON "BadgeTemplate"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir templates" ON "BadgeTemplate"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar templates" ON "BadgeTemplate"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar templates" ON "BadgeTemplate"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar políticas criadas
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
  'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
)
ORDER BY tablename, policyname;