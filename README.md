# SMHB Sistema

Sistema de gerenciamento para igrejas com funcionalidades completas de administração.

## Tecnologias Utilizadas

- **Frontend**: React + Vite
- **Backend**: Supabase (Functions e Database)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Estilização**: Tailwind CSS

## Funcionalidades

- Gerenciamento de membros
- Controle de eventos e presença
- Gestão financeira
- Conteúdo e avisos
- Crachás para embaixadores
- Sistema de autenticação e autorização

## Configuração do Ambiente

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```env
   VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA
   SUPABASE_URL=SUA_URL_DO_SUPABASE
   SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_DE_SERVIÇO
   DATABASE_URL=SUA_URL_DO_BANCO_DE_DADOS
   PORT=3001
   JWT_SECRET=seu_segredo_jwt
   APP_BASE_URL=http://localhost:5174
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

## Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas no Supabase:

- **Usuario**: Armazena informações dos usuários
- **Aviso**: Armazena avisos e notificações
- **Membro**: Armazena informações dos membros da igreja
- **Evento**: Armazena eventos e programações
- **Diretoria**: Armazena informações da diretoria
- **Financa**: Armazena registros financeiros
- **Conteudo**: Armazena conteúdos diversos
- **Cracha**: Armazena registros de crachás
- **Embaixador**: Armazena informações dos embaixadores
- **BadgeTemplate**: Armazena templates de crachás

## Deploy

### Vercel (Frontend)
O frontend pode ser implantado diretamente na Vercel seguindo as configurações padrão.

### Backend (Supabase)
Todas as funcionalidades de backend foram migradas para o Supabase usando:
- Supabase Database para armazenamento de dados
- Supabase Auth para autenticação
- Funções SQL personalizadas para lógica de negócios

## Estrutura do Projeto

```
src/
├── components/     # Componentes React reutilizáveis
├── context/        # Contextos do React (autenticação, etc.)
├── lib/            # Funções auxiliares e configurações
│   ├── supabase.js          # Configuração do cliente Supabase
│   ├── supabaseFunctions.js # Funções para interagir com o Supabase
│   └── api.js               # API wrapper para compatibilidade
├── pages/          # Páginas da aplicação
└── App.jsx         # Componente principal
```

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento do frontend
- `npm run build` - Compila o projeto para produção
- `npm run prisma:generate` - Gera o cliente Prisma (mantido para compatibilidade)
- `npm run prisma:migrate:dev` - Executa migrações do banco de dados (mantido para compatibilidade)

## Migração para Supabase

Este projeto foi migrado de uma arquitetura com backend Express para utilizar totalmente o Supabase como backend:

1. **Banco de Dados**: Todas as tabelas foram criadas no Supabase
2. **Autenticação**: Substituída para usar Supabase Auth
3. **Funções**: Criadas funções SQL personalizadas para lógica de negócios
4. **API**: Atualizada para usar o cliente Supabase diretamente

Os arquivos de migração estão disponíveis em:
- [SUPABASE_SCHEMA.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_SCHEMA.sql) - Schema do banco de dados
- [SUPABASE_FUNCTIONS.sql](file:///c:/Users/sergi/Downloads/smhb-sistema-main/smhb-sistema-main/SUPABASE_FUNCTIONS.sql) - Funções SQL personalizadas