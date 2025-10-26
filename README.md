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

## Configuração Completa do Supabase

Para configurar completamente o Supabase, siga o guia detalhado em [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md).

### Resumo dos Passos:

1. **Criar as Tabelas**: Execute o script [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql) no SQL Editor do Supabase
2. **Configurar Políticas de Segurança**: Execute o script [CONFIGURE_RLS_POLICIES.sql](CONFIGURE_RLS_POLICIES.sql)
3. **Verificar Estrutura**: Use o script [VERIFY_TABLES.sql](VERIFY_TABLES.sql) para verificar as tabelas
4. **Testar o Sistema**: Use os scripts [INSERT_TEST_DATA.sql](INSERT_TEST_DATA.sql) e [TEST_CRUD_OPERATIONS.sql](TEST_CRUD_OPERATIONS.sql) para testar

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
│   ├── supabaseDiagnostics.js # Funções de diagnóstico
│   └── api.js               # API wrapper para compatibilidade
├── pages/          # Páginas da aplicação
└── App.jsx         # Componente principal
```

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento do frontend

## Migração para Supabase

Este projeto foi migrado de uma arquitetura com backend Express para utilizar totalmente o Supabase como backend:

1. **Banco de Dados**: Todas as tabelas foram criadas no Supabase
2. **Autenticação**: Substituída para usar Supabase Auth
3. **Funções**: Criadas funções SQL personalizadas para lógica de negócios
4. **API**: Atualizada para usar o cliente Supabase diretamente

Os arquivos de migração estão disponíveis em:
- [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql) - Schema do banco de dados
- [SUPABASE_FUNCTIONS.sql](SUPABASE_FUNCTIONS.sql) - Funções SQL personalizadas

## Solução de Problemas

### Erro: "Could not find the table 'public.Usuario' in the schema cache"

Este erro ocorre quando o cliente Supabase não consegue encontrar a tabela no cache de schema. Para resolver:

1. **Verifique se as tabelas foram criadas**:
   - Acesse o dashboard do Supabase
   - Vá para "Table Editor"
   - Verifique se a tabela "Usuario" existe

2. **Execute o script de criação de tabelas**:
   - Acesse o dashboard do Supabase
   - Vá para "SQL Editor"
   - Cole e execute o conteúdo do arquivo [SUPABASE_SCHEMA.sql](SUPABASE_SCHEMA.sql)

3. **Atualize o cache de schema**:
   - Reinicie o servidor de desenvolvimento (`npm run dev`)
   - Ou acesse a página de diagnóstico em ambiente de desenvolvimento (`/diagnostico`)

4. **Verifique as permissões**:
   - Certifique-se de que as políticas RLS estão configuradas corretamente
   - Verifique se o usuário tem permissões para acessar a tabela

5. **Use a página de diagnóstico**:
   - Em ambiente de desenvolvimento, acesse `/diagnostico` para verificar:
     - Se as tabelas existem
     - Se as colunas estão corretas
     - Se a conexão está funcionando

Se o problema persistir, verifique os logs do console para obter mais detalhes sobre o erro.

### Problema com Data de Aniversário

#### Problema Identificado
- A data de aniversário precisa estar na ordem: dia, mês, ano
- Na Dashboard em Aniversariantes, precisa mostrar a data cadastrada em membros

#### Solução Implementada
Foram implementadas melhorias nas funções de formatação e tratamento de datas:

1. **Melhoria na função formatBR**: Agora trata corretamente datas em formato string (YYYY-MM-DD) e objetos Date
2. **Melhoria na função nextBirthdayDate**: Melhor tratamento de diferentes formatos de data
3. **Garantia de formato correto ao salvar**: Verificação do formato da data antes de salvar

Para mais detalhes, consulte o documento [SOLUCAO_DATA_ANIVERSARIO.md](SOLUCAO_DATA_ANIVERSARIO.md).

Se o problema persistir:
1. Verifique se há dados inconsistentes no banco de dados
2. Execute os scripts de diagnóstico para identificar o formato exato das datas armazenadas
3. Limpe e reinsira os dados de teste para verificar se o problema foi resolvido

### Problema com Exibição de Aniversariantes

#### Problema Identificado
- Ao trocar a Data de aniversário em membros, não estava aparecendo corretamente em Aniversariantes na página Dashboard

#### Solução Implementada
Correção na exibição da data na seção "Aniversariantes" da Dashboard:

1. **Correção da exibição**: Agora mostra a data original de aniversário do membro em vez da data calculada
2. **Manutenção da funcionalidade**: A data calculada ainda é usada internamente para ordenar os aniversariantes

Para mais detalhes, consulte o documento [CORRECAO_ANIVERSARIANTES.md](CORRECAO_ANIVERSARIANTES.md).

### Problema com Salvamento de Data de Aniversário

#### Problema Identificado
- Ao preencher a data de aniversário, ela não está sendo salva no cadastro na página de membros

#### Diagnóstico Realizado
Analisamos o fluxo completo de salvamento:

1. **Frontend**: O input `type="date"` retorna datas no formato "YYYY-MM-DD" corretamente
2. **Estado React**: O estado [aniversario](file://c:\Users\sergi\Downloads\smhb-sistema-main\smhb-sistema-main\src\pages\Membros.jsx#L13-L13) está sendo atualizado corretamente
3. **Envio para Backend**: Os dados estão sendo enviados corretamente para a API
4. **Banco de Dados**: A coluna "aniversario" é do tipo `TIMESTAMP WITH TIME ZONE` e aceita o formato enviado

#### Possíveis Causas
1. **Permissões de acesso**: As políticas RLS podem estar impedindo a inserção/atualização
2. **Erros silenciosos**: Pode haver erros que não estão sendo exibidos ao usuário
3. **Problemas de validação**: Validações no backend podem estar falhando

#### Soluções Propostas
1. **Adição de logs de debug** para identificar onde o processo está falhando
2. **Verificação das políticas RLS** para garantir permissões adequadas
3. **Testes diretos no banco de dados** para isolar o problema

Para acompanhar o diagnóstico, consulte o documento [SOLUCAO_PROBLEMA_ANIVERSARIO.md](SOLUCAO_PROBLEMA_ANIVERSARIO.md).