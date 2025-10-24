-- Script para corrigir políticas RLS com abordagem mais simples

-- Remover todas as políticas existentes
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

-- Criar políticas simplificadas para desenvolvimento
-- NOTA: Estas políticas são para desenvolvimento e devem ser reforçadas em produção

-- Para tabela Usuario
CREATE POLICY "Usuários podem visualizar seus próprios dados" ON "Usuario"
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir seus próprios dados" ON "Usuario"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON "Usuario"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários podem deletar seus próprios dados" ON "Usuario"
  FOR DELETE USING (true);

-- Para tabela Aviso (acesso público para leitura)
CREATE POLICY "Todos podem visualizar avisos" ON "Aviso"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir avisos" ON "Aviso"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar avisos" ON "Aviso"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar avisos" ON "Aviso"
  FOR DELETE USING (true);

-- Para tabela Membro
CREATE POLICY "Usuários autenticados podem visualizar membros" ON "Membro"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir membros" ON "Membro"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar membros" ON "Membro"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar membros" ON "Membro"
  FOR DELETE USING (true);

-- Para tabela Evento
CREATE POLICY "Usuários autenticados podem visualizar eventos" ON "Evento"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir eventos" ON "Evento"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar eventos" ON "Evento"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar eventos" ON "Evento"
  FOR DELETE USING (true);

-- Para tabela Diretoria (acesso público para leitura)
CREATE POLICY "Todos podem visualizar diretoria" ON "Diretoria"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir diretores" ON "Diretoria"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar diretores" ON "Diretoria"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar diretores" ON "Diretoria"
  FOR DELETE USING (true);

-- Para tabela Financa
CREATE POLICY "Usuários autenticados podem visualizar finanças" ON "Financa"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir finanças" ON "Financa"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar finanças" ON "Financa"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar finanças" ON "Financa"
  FOR DELETE USING (true);

-- Para tabela Conteudo
CREATE POLICY "Usuários autenticados podem visualizar conteúdos" ON "Conteudo"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir conteúdos" ON "Conteudo"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar conteúdos" ON "Conteudo"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar conteúdos" ON "Conteudo"
  FOR DELETE USING (true);

-- Para tabela Cracha
CREATE POLICY "Usuários autenticados podem visualizar crachás" ON "Cracha"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir crachás" ON "Cracha"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar crachás" ON "Cracha"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar crachás" ON "Cracha"
  FOR DELETE USING (true);

-- Para tabela Embaixador
CREATE POLICY "Usuários autenticados podem visualizar embaixadores" ON "Embaixador"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir embaixadores" ON "Embaixador"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar embaixadores" ON "Embaixador"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar embaixadores" ON "Embaixador"
  FOR DELETE USING (true);

-- Para tabela BadgeTemplate (acesso público para leitura)
CREATE POLICY "Todos podem visualizar templates" ON "BadgeTemplate"
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir templates" ON "BadgeTemplate"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar templates" ON "BadgeTemplate"
  FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar templates" ON "BadgeTemplate"
  FOR DELETE USING (true);

-- Verificar políticas criadas
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'Usuario', 'Aviso', 'Membro', 'Evento', 'Diretoria', 
  'Financa', 'Conteudo', 'Cracha', 'Embaixador', 'BadgeTemplate'
)
ORDER BY tablename, policyname;