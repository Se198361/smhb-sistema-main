-- Criar todas as tabelas necessárias para o sistema SMHB

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela Usuario
CREATE TABLE IF NOT EXISTS "Usuario" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "nome" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Aviso
CREATE TABLE IF NOT EXISTS "Aviso" (
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
CREATE TABLE IF NOT EXISTS "Membro" (
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
CREATE TABLE IF NOT EXISTS "Evento" (
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
CREATE TABLE IF NOT EXISTS "Diretoria" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "cargo" TEXT NOT NULL,
  "foto" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Financa
CREATE TABLE IF NOT EXISTS "Financa" (
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
CREATE TABLE IF NOT EXISTS "Conteudo" (
  "id" SERIAL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "data" TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Cracha
CREATE TABLE IF NOT EXISTS "Cracha" (
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
CREATE TABLE IF NOT EXISTS "Embaixador" (
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
CREATE TABLE IF NOT EXISTS "BadgeTemplate" (
  "id" SERIAL PRIMARY KEY,
  "page" TEXT NOT NULL,
  "lado" TEXT NOT NULL,
  "name" TEXT,
  "img" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar chaves estrangeiras
ALTER TABLE "Cracha" DROP CONSTRAINT IF EXISTS "Cracha_embaixadorId_fkey";
ALTER TABLE "Cracha" ADD CONSTRAINT "Cracha_embaixadorId_fkey" 
  FOREIGN KEY ("embaixadorId") REFERENCES "Embaixador"("id") 
  ON DELETE SET NULL;

ALTER TABLE "Embaixador" DROP CONSTRAINT IF EXISTS "Embaixador_templateFrontId_fkey";
ALTER TABLE "Embaixador" ADD CONSTRAINT "Embaixador_templateFrontId_fkey" 
  FOREIGN KEY ("templateFrontId") REFERENCES "BadgeTemplate"("id") 
  ON DELETE SET NULL;

ALTER TABLE "Embaixador" DROP CONSTRAINT IF EXISTS "Embaixador_templateBackId_fkey";
ALTER TABLE "Embaixador" ADD CONSTRAINT "Embaixador_templateBackId_fkey" 
  FOREIGN KEY ("templateBackId") REFERENCES "BadgeTemplate"("id") 
  ON DELETE SET NULL;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS "Usuario_email_idx" ON "Usuario"("email");
CREATE INDEX IF NOT EXISTS "Aviso_createdAt_idx" ON "Aviso"("createdAt");
CREATE INDEX IF NOT EXISTS "Membro_nome_idx" ON "Membro"("nome");
CREATE INDEX IF NOT EXISTS "Evento_data_idx" ON "Evento"("data");
CREATE INDEX IF NOT EXISTS "Financa_data_idx" ON "Financa"("data");
CREATE INDEX IF NOT EXISTS "Financa_tipo_idx" ON "Financa"("tipo");
CREATE INDEX IF NOT EXISTS "Conteudo_data_idx" ON "Conteudo"("data");
CREATE INDEX IF NOT EXISTS "Cracha_origem_idx" ON "Cracha"("origem");
CREATE INDEX IF NOT EXISTS "Embaixador_nome_idx" ON "Embaixador"("nome");
CREATE INDEX IF NOT EXISTS "BadgeTemplate_page_lado_idx" ON "BadgeTemplate"("page", "lado");

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

-- Políticas básicas (serão substituídas pelo script CONFIGURE_RLS_POLICIES.sql)
-- As políticas estão comentadas aqui porque serão configuradas separadamente
-- para evitar erros de sintaxe

-- Funções e gatilhos para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Gatilhos para atualizar timestamps
DROP TRIGGER IF EXISTS update_usuario_updated_at ON "Usuario";
CREATE TRIGGER update_usuario_updated_at 
  BEFORE UPDATE ON "Usuario" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_aviso_updated_at ON "Aviso";
CREATE TRIGGER update_aviso_updated_at 
  BEFORE UPDATE ON "Aviso" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_membro_updated_at ON "Membro";
CREATE TRIGGER update_membro_updated_at 
  BEFORE UPDATE ON "Membro" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evento_updated_at ON "Evento";
CREATE TRIGGER update_evento_updated_at 
  BEFORE UPDATE ON "Evento" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diretoria_updated_at ON "Diretoria";
CREATE TRIGGER update_diretoria_updated_at 
  BEFORE UPDATE ON "Diretoria" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financa_updated_at ON "Financa";
CREATE TRIGGER update_financa_updated_at 
  BEFORE UPDATE ON "Financa" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conteudo_updated_at ON "Conteudo";
CREATE TRIGGER update_conteudo_updated_at 
  BEFORE UPDATE ON "Conteudo" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cracha_updated_at ON "Cracha";
CREATE TRIGGER update_cracha_updated_at 
  BEFORE UPDATE ON "Cracha" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_embaixador_updated_at ON "Embaixador";
CREATE TRIGGER update_embaixador_updated_at 
  BEFORE UPDATE ON "Embaixador" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_badge_template_updated_at ON "BadgeTemplate";
CREATE TRIGGER update_badge_template_updated_at 
  BEFORE UPDATE ON "BadgeTemplate" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();