# RealRisk dentro do 4Rivers — handoff

> Para a sessão do Claude Code neste repositório (4Rivers). Escrito em 02/Out/2026 pela sessão do `realrisk-mvp`.
> Contexto completo e regras de compliance do MLS: `../../realrisk-mvp/MLS-INTEGRACAO.md` — **ler antes de mexer em qualquer coisa de MLS**.

## Resumo

O RealRisk (dashboard de investimento do Lucas e do Jales, HTML/JS estático no repo `realrisk-mvp`) passa a morar na área admin do 4Rivers, em `/admin/realrisk`. Os dados vêm de uma tabela nova, `mls_listings`, preenchida pelo mesmo feed MLSGrid (Stellar, `mfrmls`) que o portal já sincroniza.

Tudo abaixo está **implementado e testado localmente** (MySQL local, `next dev`). **Nada foi commitado** e nada foi para produção.

## ⚠️ Passo 0: isolar o trabalho numa branch própria

Os arquivos do RealRisk estão **não commitados** no working tree, por cima da branch `feat/admin-ux-improvements`. Eles foram feitos em `feat/realrisk-mls-listings`, mas a branch foi trocada com eles pendentes. **Não rode `git add -A` / `git commit -a` na branch de UX**, senão o RealRisk entra no commit errado.

Arquivos do RealRisk (e só estes):

```
M  app/(platform)/admin/layout.tsx        # +1 item de menu "RealRisk" (ícone TrendingUp)
M  lib/mls-sync.ts                        # upsertMlsListing() dentro do loop do runMlsSync
M  next.config.js                         # headers/CSP próprios para /realrisk/*
M  prisma/schema.prisma                   # model MlsListing
M  services/mlsgrid.service.ts            # campos extras na interface MlsListing
?? app/(platform)/admin/realrisk/page.tsx
?? app/api/realrisk/export/route.ts
?? app/api/realrisk/listings/route.ts
?? lib/realrisk-mls.ts
?? lib/realrisk-excel.ts
?? lib/realrisk-dashboard.ts
?? prisma/migrations/20261002120000_realrisk_mls_listings/
?? public/realrisk/                       # cópia do dashboard (sem dados)
?? scripts/realrisk-mls-backfill.ts
?? scripts/realrisk-export.ts
?? scripts/realrisk-dashboard-data.ts
?? scripts/sync-realrisk-app.mjs
?? REALRISK-HANDOFF.md
```

`prisma/check-or-create-saulo.ts` **não** é do RealRisk; não mexer.

Para isolar: commitar o que for de UX na branch de UX, depois `git stash push -- <arquivos acima>`, `git checkout feat/realrisk-mls-listings` (ou criar uma branch nova a partir do `main`/da base certa), `git stash pop`. A branch `feat/realrisk-mls-listings` aponta para `b3b88cb` (`fix/rsc-link-serialization-crash`), que **não está no `main`**: tem 15 commits não mergeados. Decidir com o Lucas a base certa.

## O que existe

### Dados: `mls_listings` (`lib/realrisk-mls.ts`)
- **Condados** (`REALRISK_COUNTIES`): `Sumter, Marion, Lake, Polk, Pasco`. Vêm só da coluna "Sua definição" do formulário do Jales (`realrisk-mvp/RealRisk — Critérios de Elegibilidade _ Para preenchimento de Jales Castro_rev1.pdf`). A coluna "Sugestão inicial" (Orange/Osceola/Seminole) **não** é decisão dele; não usar.
- **Sem fotos e sem curadoria**: só dados. Mesmo compliance do portal: `MlgCanView=false` deleta a linha.
- **Duas formas de entrada:**
  1. `upsertMlsListing()` dentro do loop de `runMlsSync`. Não faz nenhuma requisição extra à MLSGrid. Está em `try/catch`: erro do RealRisk nunca derruba o sync do portal.
  2. `runRealriskSync()` com **cursor próprio** (`MlsSyncState` = `'mfrmls:realrisk'`). Nunca usa o cursor `'mfrmls'` do portal.
- **Campos `MFR_*` descobertos** (inspeção de 1 payload): `MFR_FloodZoneCode` (100% preenchido), `MFR_MonthlyHOAAmount`, `MFR_LeaseRestrictionsYN`, `MFR_MinimumLease`. Idade de telhado/HVAC **não existe** no MLS.

### Scripts (rodar **localmente**, sem o limite de 60s da Vercel)
| Comando | O que faz |
|---|---|
| `npx tsx scripts/realrisk-mls-backfill.ts` | Backfill com status Active/Pending/AUC desde o cursor. Retomável (o cursor é salvo a cada página). Pausa sozinho entre 05:50 e 06:30 UTC (cron do portal). |
| `npx tsx scripts/realrisk-mls-backfill.ts --delta` | Delta sem filtro de status: pega Withdrawn/Expired/Closed dos imóveis que já temos. |
| `npx tsx scripts/realrisk-export.ts saida.xlsx [--days 7]` | Gera a planilha de gestão. |
| `npx tsx scripts/realrisk-dashboard-data.ts ../../realrisk-mvp/data-mls.js` | Gera `data-mls.js` para testar o dashboard fora do 4Rivers (arquivo gitignored no realrisk-mvp). |
| `node scripts/sync-realrisk-app.mjs` | Copia o dashboard do `../../realrisk-mvp` para `public/realrisk/`. |

Os scripts leem `.env.local` sozinhos. O Prisma CLI **não** lê esse arquivo: use `export $(grep -E '^DATABASE_URL=' .env.local | xargs)` antes de `npx prisma ...`.

Resultado do backfill local (02/Out): **34.040 imóveis** em cerca de 15 min e 1.335 requisições, sem nenhum problema de rate limit.

### APIs (ambas com `requireAuth`)
- `GET /api/realrisk/listings?limit=300`: JSON no formato do `data.js` do dashboard, gerado por `lib/realrisk-dashboard.ts`. São os candidatos de **Fix & Flip**: Sumter/Marion/Lake/Polk, Single Family, Flood X, `$/sqft` ≥10% abaixo de casas de tamanho parecido (±30%) no mesmo ZIP. O `id` é formado pelos dígitos do `ListingKey`, o que o mantém estável para os likes/comentários no Supabase.
- `GET /api/realrisk/export?days=7`: planilha `.xlsx` (`lib/realrisk-excel.ts`) com as abas Resumo, Novos, Ativos, Sob contrato, Redução de preço e Saíram do mercado. Aluguéis (`*Lease`) ficam de fora.
  - Obs.: `lib/excel.ts` tem um bug pré-existente que **não** foi corrigido. `addLogoHeader` escreve o título na linha 1 e logo depois `sheet.columns = [...]` grava o cabeçalho por cima. Os exports de Leads e Properties saem sem título.

### Dashboard em `/admin/realrisk`
- `page.tsx` = iframe de `/realrisk/index.html`. Os estáticos em `public/realrisk/` **não contêm dados do MLS**.
- O `app.js` detecta que está sendo servido em `/realrisk/`, busca `/api/realrisk/listings` e, se receber 401, manda para `/auth/login`.
- `next.config.js`: `/realrisk/*` tem CSP própria (unpkg para Leaflet/Supabase, `*.supabase.co`, `frame-ancestors 'self'`). O resto do site continua com a CSP original (o source global virou `/((?!realrisk/).*)`).
- **A fonte do código do dashboard é o repo `realrisk-mvp`.** Editar lá e rodar `sync-realrisk-app.mjs`, nunca editar `public/realrisk/` direto.

### Testado localmente
- Migration aplicada no MySQL local. A migration antiga `20260930130000_add_bedrooms_bathrooms` foi marcada como `--applied`, porque as colunas já existiam localmente.
- Sem sessão, `/api/realrisk/listings` responde 401. Com sessão, responde 200 com 300 imóveis (~3 s no dev). Os headers de `/realrisk/*` estão corretos.
- **Não testado no navegador**: a renderização visual do iframe, o mapa e os likes. O Lucas vai testar.

## Pendências para produção — status em 02/Out/2026

0. ✅ **Passo 0 feito.** `origin/main` já continha os 15 commits da base antiga. `feat/realrisk-mls-listings` foi reapontada para `origin/main` e o RealRisk está commitado nela.
1. **Merge**: via PR para o `main`.
2. **Migration**: o `build` roda `prisma migrate deploy`. ⚠️ Na Vercel, `DATABASE_URL` é **o mesmo para Production e Preview**, então o build do Preview da branch já cria `mls_listings` no TiDB de produção. Ela é aditiva (só `CREATE TABLE`), e o Lucas autorizou.
3. **Backfill no TiDB**: rodar `realrisk-mls-backfill.ts` localmente apontando para o `DATABASE_URL` de produção (cerca de 15 min). Autorizado pelo Lucas. Só depois que a tabela existir (pós-deploy).
4. ✅ **Quem acessa**: qualquer usuário logado (decisão do Lucas). Fica `requireAuth`.
5. **Email diário: arquitetura pronta, desligada** (decisão do Lucas: só deixar pronto).
   - `lib/realrisk-digest.ts`: resumo em HTML (contagens, top 10 novos e top 10 reduções, sempre com a corretora) + `.xlsx` anexo. Avisa no assunto quando os dados estão com mais de 48h. Sem `REALRISK_DIGEST_TO`/`RESEND_API_KEY`, não faz nada e informa o motivo.
   - `app/api/cron/realrisk-digest`: `CRON_SECRET`. Roda um delta limitado por tempo (35s, cursor `mfrmls:realrisk`) e depois manda o email.
   - `npx tsx scripts/realrisk-digest-preview.ts [pasta] [--days 1]`: gera `digest.html` + `.xlsx` localmente, sem enviar e sem chamar a MLSGrid.
   - **Para ligar:** (a) `REALRISK_DIGEST_TO` (separado por vírgula) e `RESEND_API_KEY` na Vercel; (b) domínio do remetente verificado no Resend (`REALRISK_DIGEST_FROM`, padrão `notifications@4riversrealty.us`); (c) adicionar `{ "path": "/api/cron/realrisk-digest", "schedule": "0 10 * * *" }` ao `vercel.json` (07:00 BRT, longe do cron do portal às 06:00 UTC). O backfill local já pausa nas duas janelas.
   - **Limitação:** no Hobby (60s, 1x/dia), o delta pode não acompanhar o volume diário de modificações do Stellar. Se o email avisar "dados desatualizados", rodar `realrisk-mls-backfill.ts --delta` localmente.
6. **Observação de segurança (pré-existente)**: as páginas `/admin/*` não verificam a sessão no servidor (o layout é client e o middleware exclui `admin`). Os dados estão protegidos porque todas as APIs usam `requireAuth`, mas o "shell" das páginas abre sem login.

## Limitações conhecidas (deixar claras para o Lucas/Jales)
- **ARV e CAPEX são estimativas.** O ARV é o preço *pedido* de casas parecidas no ZIP, e o CAPEX é um valor por sqft conforme o ano de construção. O ROI sai otimista por construção. O correto é usar comparáveis `Closed` (fase 2, tarefa 11 do guia).
- **Telhado/HVAC** só são detectados por regex na descrição ("new roof"). Quando não há menção, ficam `null`, e o `scoring.js` dá pontuação intermediária.
- **"STR ok? (HOA)"** reflete só a regra de locação da HOA, não o zoneamento. O Jales marcou STR como obrigatório, então a verificação continua manual.
- O dashboard só cobre Fix & Flip. Farmland (≥20 acres, $400k–10M, ≤$20k/acre, zoneamento agrícola) e Ranch (≥10 acres, $500k–4M) existem só como triagem pontual e na planilha.
- **Compliance**: dados do MLS sempre atrás de login, sem cópia estática publicada, mostrando sempre a corretora/corretor de origem. A planilha é de uso interno; checar o acordo do Stellar antes de mandar para fora.

## Estado dos processos locais deixados pela sessão do realrisk-mvp
- `next dev -p 3005` (este repo) e `python -m http.server 8080` (realrisk-mvp) podem ainda estar rodando. Encerrar se não forem usados.
