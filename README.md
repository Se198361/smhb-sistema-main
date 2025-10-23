# SMHB Sistema

Sistema de gerenciamento para igrejas com funcionalidades completas de administração.

## Tecnologias Utilizadas

- **Frontend**: React + Vite
- **Backend**: Node.js com Express
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT
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
   # Iniciar o servidor backend
   npm run server
   
   # Em outro terminal, iniciar o frontend
   npm run dev
   ```

## Deploy

### Vercel (Frontend)
O frontend pode ser implantado diretamente na Vercel seguindo as configurações padrão.

### Backend
O backend pode ser implantado em qualquer serviço que suporte Node.js, como:
- Railway
- Render
- Heroku
- Servidor próprio

## Estrutura do Projeto

```
src/
├── components/     # Componentes React reutilizáveis
├── context/        # Contextos do React (autenticação, etc.)
├── lib/            # Funções auxiliares e configurações
├── pages/          # Páginas da aplicação
└── App.jsx         # Componente principal
```

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento do frontend
- `npm run build` - Compila o projeto para produção
- `npm run server` - Inicia o servidor backend
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate:dev` - Executa migrações do banco de dados