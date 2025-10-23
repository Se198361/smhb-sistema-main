-- Criar todas as tabelas necessárias para o sistema SMHB

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela Usuario
CREATE TABLE "Usuario" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "nome" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Aviso
CREATE TABLE "Aviso" (
  "id" SERIAL PRIMARY KEY,
  "titulo" TEXT NOT NULL,
  "conteudo" TEXT,
  "descricao" TEXT,
  "inicio" TIMESTAMP WITH TIME ZONE,
  "fim" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Membro
CREATE TABLE "Membro" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "endereco" TEXT NOT NULL,
  "telefone" TEXT NOT NULL,
  "aniversario" TIMESTAMP WITH TIME ZONE,
  "foto" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Evento
CREATE TABLE "Evento" (
  "id" SERIAL PRIMARY KEY,
  "titulo" TEXT NOT NULL,
  "data" TIMESTAMP WITH TIME ZONE NOT NULL,
  "horario" TEXT,
  "local" TEXT NOT NULL,
  "comparecido" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Diretoria
CREATE TABLE "Diretoria" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "cargo" TEXT NOT NULL,
  "foto" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Financa
CREATE TABLE "Financa" (
  "id" SERIAL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "valor" DOUBLE PRECISION NOT NULL,
  "data" TIMESTAMP WITH TIME ZONE NOT NULL,
  "pagante" TEXT NOT NULL,
  "uso" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Conteudo
CREATE TABLE "Conteudo" (
  "id" SERIAL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "data" TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Cracha
CREATE TABLE "Cracha" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "front" TEXT NOT NULL,
  "back" TEXT,
  "origem" TEXT DEFAULT 'CRACHAS',
  "embaixadorId" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Embaixador
CREATE TABLE "Embaixador" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "idade" INTEGER,
  "telefone" TEXT,
  "foto" TEXT,
  "pai" TEXT,
  "mae" TEXT,
  "templateFrontId" INTEGER,
  "templateBackId" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela BadgeTemplate
CREATE TABLE "BadgeTemplate" (
  "id" SERIAL PRIMARY KEY,
  "page" TEXT NOT NULL,
  "lado" TEXT NOT NULL,
  "name" TEXT,
  "img" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar chaves estrangeiras
ALTER TABLE "Cracha" ADD CONSTRAINT "Cracha_embaixadorId_fkey" 
  FOREIGN KEY ("embaixadorId") REFERENCES "Embaixador"("id") 
  ON DELETE SET NULL;

ALTER TABLE "Embaixador" ADD CONSTRAINT "Embaixador_templateFrontId_fkey" 
  FOREIGN KEY ("templateFrontId") REFERENCES "BadgeTemplate"("id") 
  ON DELETE SET NULL;

ALTER TABLE "Embaixador" ADD CONSTRAINT "Embaixador_templateBackId_fkey" 
  FOREIGN KEY ("templateBackId") REFERENCES "BadgeTemplate"("id") 
  ON DELETE SET NULL;

-- Criar índices para melhorar performance
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");
CREATE INDEX "Aviso_createdAt_idx" ON "Aviso"("createdAt");
CREATE INDEX "Membro_nome_idx" ON "Membro"("nome");
CREATE INDEX "Evento_data_idx" ON "Evento"("data");
CREATE INDEX "Financa_data_idx" ON "Financa"("data");
CREATE INDEX "Financa_tipo_idx" ON "Financa"("tipo");
CREATE INDEX "Conteudo_data_idx" ON "Conteudo"("data");
CREATE INDEX "Cracha_origem_idx" ON "Cracha"("origem");
CREATE INDEX "Embaixador_nome_idx" ON "Embaixador"("nome");
CREATE INDEX "BadgeTemplate_page_lado_idx" ON "BadgeTemplate"("page", "lado");

-- Configurar Row Level Security (RLS)
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

-- Políticas básicas (podem ser ajustadas conforme necessário)
CREATE POLICY "Todos podem visualizar avisos" ON "Aviso" 
  FOR SELECT USING (true);

CREATE POLICY "Todos podem visualizar diretoria" ON "Diretoria" 
  FOR SELECT USING (true);

CREATE POLICY "Todos podem visualizar templates" ON "BadgeTemplate" 
  FOR SELECT USING (true);

-- Políticas para usuários autenticados (exemplo - ajustar conforme necessário)
CREATE POLICY "Usuários autenticados podem inserir membros" ON "Membro" 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem visualizar membros" ON "Membro" 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar membros" ON "Membro" 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar membros" ON "Membro" 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Funções e gatilhos para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Gatilhos para atualizar timestamps
CREATE TRIGGER update_usuario_updated_at 
  BEFORE UPDATE ON "Usuario" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aviso_updated_at 
  BEFORE UPDATE ON "Aviso" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membro_updated_at 
  BEFORE UPDATE ON "Membro" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evento_updated_at 
  BEFORE UPDATE ON "Evento" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diretoria_updated_at 
  BEFORE UPDATE ON "Diretoria" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financa_updated_at 
  BEFORE UPDATE ON "Financa" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conteudo_updated_at 
  BEFORE UPDATE ON "Conteudo" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cracha_updated_at 
  BEFORE UPDATE ON "Cracha" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_embaixador_updated_at 
  BEFORE UPDATE ON "Embaixador" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badge_template_updated_at 
  BEFORE UPDATE ON "BadgeTemplate" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();