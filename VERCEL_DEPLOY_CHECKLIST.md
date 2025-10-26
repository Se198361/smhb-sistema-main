# Checklist de Deploy na Vercel (Supabase)

Use este checklist sempre que fizer um novo deploy do frontend na Vercel com backend Supabase.

## Pré‑flight
- Repositório atualizado no `main` e builds locais ok (`npm run build`).
- Sem mudanças não commitadas.
- Verifique se `vercel.json` tem fallback SPA (já configurado neste projeto).

## Variáveis de Ambiente (Vercel)
Configure em Project Settings → Environment Variables, nos escopos `Production` e `Preview`:

```
# Frontend (Vite)
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
VITE_DEBUG_LOGS=false

# Personalização visual (opcional)
VITE_LOGO_URL=/smhb-logo.png
VITE_EMBAIXADORES_LOGO_URL=/er-logo.png
VITE_EMBAIXADORES_LOGO_STYLE=poster
```

Observações:
- As chaves precisam começar com `VITE_` para serem visíveis no bundle.
- Após criar/alterar envs, execute "Redeploy" para reconstituir o build.
- Use `.env.example` como referência; não commite segredos.

## Supabase: URLs de Autenticação
No dashboard do Supabase → Authentication → Settings → URL Configuration:
- `Site URL`: `https://<seu-dominio>.vercel.app`
- `Additional Redirect URLs`:
  - `https://<seu-dominio>.vercel.app/confirmacao-enviada`
  - `https://<seu-dominio>.vercel.app/login`
  - Previews: `https://<preview>.vercel.app/*`

Se utilizar `emailRedirectTo` no `signUp`, garanta que aponta para seu domínio público: `/confirmacao-enviada`.

## Vercel: Build & Routing
- Framework: `Vite`
- Install: `npm install`
- Build: `npm run build`
- Output: `dist`
- SPA fallback: `vercel.json` contém:
  - `routes`: `[{ "handle": "filesystem" }, { "src": "/(.*)", "dest": "/index.html" }]`

## Deploy
- Clique em "Deploy" ou faça um push para `main` para disparar build.
- Aguarde o deployment concluir.

## Validações Pós‑Deploy
- Navegação:
  - `https://<domínio>/` redireciona para `/login`.
  - Qualquer rota inválida (`/<algo>`) redireciona para `/login`.
- Autenticação:
  - Cadastro → e‑mail de confirmação → login → acesso às rotas protegidas.
  - Logout mostra “Saindo...” e volta para `/login`.
- Console do navegador:
  - Não deve aparecer “Supabase não configurado”.
  - `Network` pode mostrar `logout` como "aborted" — é esperado e não bloqueia.

## Erros Comuns & Correções
- "Supabase não configurado":
  - Faltam `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` na Vercel (corrija e Redeploy).
- 404 em rotas internas:
  - Verifique `vercel.json` SPA fallback; reimplante.
- E‑mail não redireciona:
  - Ajuste `Site URL`/`Redirect URLs` no Supabase para produção/previews.
- `net::ERR_ABORTED` no logout:
  - Navegação durante `signOut`. O app já aguarda `signOut` e ignora abortos com segurança.

## Rollback
- Vercel: use "Redeploy" para voltar a um deployment anterior.
- GitHub: reverta o commit e faça novo deploy.

## Referências
- `.env.example`: variáveis necessárias e placeholders.
- `VERCEL_DEPLOY_INSTRUCTIONS.md`: guia passo a passo de criação do projeto.