# Planejamento Diário — 4Rivers Realty
**Projeto:** Portal Imobiliário Full-Stack · Ocala & Sumter County, FL  
**Período:** 05/06/2026 – 14/08/2026 · 10 semanas  
**Equipe:** Lucas (Arquiteto/Lead) · Lindoso (Front-end) · Luan (Back-end)

---

> **Como usar este plano no Claude:**  
> Cada sessão diária começa com: _"Estou na [Semana X, Dia Y] do projeto 4Rivers. Hoje vou trabalhar em [tarefa]. Me ajude com..."_  
> O Claude tem contexto completo da proposta e pode gerar código, revisar, sugerir arquitetura e tirar dúvidas.

---

## SEMANA 1 — 05/06 a 09/06
**Módulo 01: Site Institucional (início)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Sex 05/06 | Lucas | Setup do projeto: criar repo, estrutura Next.js, Tailwind, Prisma+MySQL, variáveis de ambiente | ✅ Repo criado, projeto rodando localmente |
| Seg 09/06 (início semana real) | Lindoso | Layout base: NavBar, Footer, sistema de fontes (Cormorant + Barlow), paleta de cores do branding | ✅ Componentes base |

**Tarefas Claude desta semana:**
- [x] Gerar estrutura de pastas do projeto Next.js + Prisma
- [x] Criar `tailwind.config.js` com as cores e fontes da 4Rivers
- [x] Scaffolding dos componentes: `<Navbar>`, `<Footer>`, `<HeroSection>`
- [x] Checklist de segurança: rate limiting, JWT, headers HTTP
- [x] Configurar Jest + Testing Library com testes básicos
- [x] Setup local com XAMPP + MySQL (doc: `COMO-RODAR-LOCAL.md`)
- [x] Corrigir todos os links quebrados do site (Navbar, Footer, páginas)
- [x] Criar `PublicShell` — Navbar/Footer não aparecem em `/admin` e `/auth`
- [x] Criar layout do admin com sidebar (`app/admin/layout.tsx`)

---

## ⚠️ BRANDING PENDENTE — Aguardando designer
> Aplicar assim que o designer entregar os assets finais. Bloqueia o merge de Semana 2.

**🎨 Cores**
- [ ] Atualizar paleta em `tailwind.config.js` (navy, cyan.brand, cyan.light, site-bg, dark) com valores finais do branding
- [ ] Substituir todos os hex hardcoded inline (`text-[#00aeef]`, `bg-[#174079]`, etc.) pelos tokens Tailwind

**🔤 Tipografia**
- [ ] Verificar/substituir fontes em `layout.tsx` (Cormorant Garamond + Barlow) se o designer definir fontes diferentes

**🖼️ Logo**
- [ ] Mover `Logo Azul.png` e `Logo branca_.png` para `public/images/` e atualizar Navbar e Footer
- [ ] Adicionar `favicon.ico` e `icon.png` em `public/` e registrar em `layout.tsx`

**📸 Imagens placeholder**
- [ ] Substituir imagens Unsplash por fotos reais da 4Rivers
- [ ] Substituir avatares `ui-avatars.com` (About, depoimentos) por fotos reais

**✍️ Copy**
- [ ] Confirmar telefone `(352) 555-0100` e email `info@4riversrealty.com` com o cliente Jales

---

## SEMANA 2 — 12/06 a 16/06
**Módulo 01: Site Institucional (conclusão)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 12/06 | Lindoso | Página Home: hero com busca, seção de estatísticas, seção de destaques | ✅ Home completa |
| Ter 13/06 | Lindoso | Página Sobre: história, equipe, valores da empresa | ✅ Página Sobre |
| Qua 14/06 | Lindoso | Página Contato: formulário + mapa Google Maps embed | ✅ Página Contato |
| Qui 15/06 | Lucas + Lindoso | SEO: meta tags, Open Graph, sitemap.xml, robots.txt | ✅ SEO configurado |
| Sex 16/06 | Lindoso | Animações (Framer Motion), micro-interações, responsividade mobile | ✅ Módulo 01 completo |

---

## SEMANA 3 — 19/06 a 23/06
**Módulo 02: Landing Page de Lançamentos**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 19/06 | Lindoso | Layout da landing: hero de lançamento, galeria de fotos/vídeo | Layout base |
| Ter 20/06 | Lindoso | Contador regressivo animado (React) + seção de especificações | ✅ Countdown funcional |
| Qua 21/06 | Luan | Formulário de captação integrado ao Prisma (tabela `leads`) | ✅ Lead salvo no banco |
| Qui 22/06 | Lindoso | Botão CTA WhatsApp flutuante + otimização mobile | ✅ `<WhatsAppCTA>` no layout global |
| Sex 23/06 | Lucas | Code review geral + deploy de preview | ✅ Módulo 02 completo |

---

## SEMANA 4 — 26/06 a 30/06
**Módulo 03: Portal de Listagem + Módulo 04: Cadastro (início)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 26/06 | Luan | Schema Prisma: `properties`, `property_images`, enums de tipo e status | ✅ Banco modelado |
| Ter 27/06 | Lindoso | Grid de cards de imóveis: visualização lista e quadro (toggle) | ✅ Grid responsivo |
| Qua 28/06 | Lindoso | Filtros avançados: tipo, preço, acreagem, condado (URL params) | ✅ Filtros funcionando |
| Qui 29/06 | Luan | API Routes: `GET /api/properties` com paginação e filtros | ✅ API funcionando |
| Sex 30/06 | Lindoso | Formulário multi-etapas de cadastro de propriedades | ✅ Steps prontos |

---

## SEMANA 5 — 03/07 a 07/07
**Módulo 03: Portal (cont.) + Módulo 04: Cadastro (cont.) + Módulo 05: Admin (início)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 03/07 | Lindoso | Mapa interativo Leaflet: pins customizados, clusters, preview ao hover | Mapa funcional |
| Ter 04/07 | Lindoso | Página de detalhe do imóvel: galeria, specs, formulário de interesse | ✅ Detalhe completo |
| Qua 05/07 | Luan | Auth custom JWT (jose): login, sessão cookie `4rivers_session`, roles Admin/Agent | ✅ Auth funcionando |
| Qui 06/07 | Luan | Campos específicos horse farm (cocheiras, arena, pasto) | ✅ Campos especializados |
| Sex 07/07 | Lindoso | Favoritar imóveis (localStorage), compartilhar link | ✅ Favoritos |

---

## SEMANA 6 — 10/07 a 14/07
**Módulo 03 e 04: Finalização**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 10/07 | Luan | Upload múltiplo de fotos: `lib/upload.ts` + `/api/properties/[id]/images` | ✅ Upload funcional |
| Ter 11/07 | Luan | Geolocalização no cadastro: Google Maps Geocoding API + pin no mapa | Geo funcional |
| Qua 12/07 | Lindoso | Polimento visual: skeleton loading, estados vazios | ✅ UX refinada |
| Qui 13/07 | Lucas + Luan | Code review módulos 03 e 04 + testes manuais | ✅ QA feito |
| Sex 14/07 | Lucas | Deploy preview módulos 03 e 04 + relatório semanal ao cliente | ✅ Módulos 03 e 04 |

---

## SEMANA 7 — 17/07 a 21/07
**Módulo 05: Painel Administrativo (conclusão) + Módulo 06: MLS/IDX (início)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 17/07 | Lindoso | Dashboard admin: KPIs reais (imóveis, leads, showings, offers, overdue) | ✅ Dashboard com dados reais |
| Ter 18/07 | Lindoso | CRUD completo de imóveis no admin: listagem, detalhe/edição, fotos, delete | ✅ CRUD completo |
| Qua 19/07 | Lindoso | Gestão de lançamentos e campanhas no admin | Lançamentos admin |
| Qui 20/07 | Luan | Início integração SimplyRETS: autenticação, primeiro fetch de listings | API conectada |
| Sex 21/07 | Lucas | Review + interface mobile para agentes em campo | ✅ Módulo 05 |

---

## SEMANA 8 — 24/07 a 28/07
**Módulo 06: Integração MLS/IDX (conclusão)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 24/07 | Luan | Mapeamento de campos: MLS → banco 4Rivers (normalização) | Mapeamento documentado |
| Ter 25/07 | Luan | Edge Function para sync automático a cada 4 horas | Cron funcionando |
| Qua 26/07 | Luan | Feed unificado: imóveis MLS + próprios com filtros simultâneos | Feed unificado |
| Qui 27/07 | Lindoso | Exibição de conformidade MLS (atribuição obrigatória) nas listagens | Conformidade ✅ |
| Sex 28/07 | Lucas | Testes da integração MLS + documentação do módulo | ✅ Módulo 06 |

**Tarefas Claude esta semana:**
- [ ] Gerar Edge Function para sync MLS (TypeScript)
- [x] Criar mapeamento de tipos: MLS fields → schema 4Rivers
- [ ] Revisar conformidade com regras do Stellar MLS
- [ ] Gerar documentação técnica do módulo 06

---

## SEMANA 9 — 31/07 a 04/08
**Módulo 07: CRM + Módulo 08: Captação de Leads**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 31/07 | Luan + Lindoso | Pipeline Kanban 7 colunas com @dnd-kit + DragOverlay | ✅ Kanban funcional |
| Ter 01/08 | Luan | Modal de detalhes do lead: edição inline, stage selector, notas | ✅ Modal completo |
| Qua 02/08 | Lindoso | Log de atividades do lead: timeline, add entry, download TXT | ✅ Activity log |
| Qui 03/08 | Luan | Pipeline de captação: /api/contact + Resend (notif. agente + confirmação lead) | ✅ Notificação email |
| Sex 04/08 | Luan | Templates de email HTML (new-lead-agent + lead-confirmation) | ✅ Templates prontos |

---

## SEMANA 10 — 07/08 a 11/08
**Módulo 08: Exportação Excel + Testes Finais + Deploy**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 07/08 | Luan | Exportação Excel/CSV leads e properties (ExcelJS, xlsx estilizado) | ✅ Export funcional |
| Ter 08/08 | Lucas | Testes E2E com Playwright: fluxos críticos (busca, lead, login admin) | Testes passando |
| Qua 09/08 | Lucas | Otimizações de performance: lazy loading, image optimization, bundle size | Lighthouse 90+ |
| Qui 10/08 | Lucas | Setup produção: domínio, variáveis de ambiente Hostinger, MySQL prod | Infra pronta |
| Sex 11/08 | Lucas | Deploy final + screencast de 20min para o Jales + relatório de entrega | 🚀 GO LIVE ✅ |

**Tarefas Claude esta semana:**
- [ ] Criar scripts de testes E2E com Playwright
- [ ] Gerar roteiro do screencast de treinamento

---

## ✅ IMPLEMENTADO — Sprint 18/06/2026 (Dia 14)

### Redesign visual da Home (inspirado em jaywest.ca)

| Entregável | Detalhes | Status |
|------------|----------|--------|
| `HeroMedia.tsx` | Vídeo de fundo opcional com fallback automático para imagem (`fs.existsSync` no build); ativa sozinho quando o cliente enviar `public/videos/hero-ranch.mp4` | ✅ |
| Hero da Home redesenhado | Painel de texto sólido e compacto sobre o vídeo/imagem (em vez de gradiente full-bleed), badge de marca mantido | ✅ |
| `CircleFeature.tsx` + seção "Como Ajudamos" | 3 blocos de foto circular sobrepondo a base do hero | ✅ |
| Depoimento em destaque | Foto circular grande ao lado da citação em itálico (substituindo os 3 cards iguais) | ✅ |
| `PropertyListRow.tsx` + Featured Properties | Lista horizontal (foto + specs com ícones + CTA) substitui o grid de 3 cards na Home; `/properties` continua em grid | ✅ |
| Acessibilidade | `prefers-reduced-motion: reduce` oculta o vídeo decorativo, mantém o poster estático | ✅ |
| Fix: foto de vaca no bloco "Work With Locals" | Substituída por foto de rancho já validada (mesma usada no card Silver Creek Farm) | ✅ |
| Build, tipo-checagem e deploy | `tsc --noEmit` + `next build` limpos, mesmo bundle size; deploy produção Vercel confirmado | ✅ |

> **Pendente do cliente:** arquivo de vídeo real do hero (`hero-ranch.mp4`) — instruções já deixadas em `public/videos/.gitkeep`.
> Fase 2 (mesmo tratamento visual em `/about`, `/properties`, `/contact`, `/launches`, `/list-property`) ainda não iniciada — aguardando aprovação do cliente sobre o resultado na Home.

### Decisão registrada: Mapa (Leaflet vs. Google Maps API)
Mantido **react-leaflet + OpenStreetMap** (gratuito, já funcional). Migrar para Google Maps API traria satélite/Street View melhores, mas exige billing + API key + mudanças de CSP — só vale a pena se Street View/satélite de alta resolução for um diferencial de venda explícito do cliente.

---

## 📈 Curva S — Progresso Planejado vs. Real

> **Metodologia:** progresso real = média ponderada de conclusão dos 8 módulos (M01–M08, 12.5% cada). Progresso planejado = linear ao longo das 10 semanas (cronograma original). Atualizado em 18/06/2026.

| Semana | Data referência | Planejado (%) | Real (%) | Observação |
|--------|------------------|----------------|----------|------------|
| S1 | 09/06 | 10% | 15% | Setup + base adiantados |
| S1→S2 | 09/06 (sprint) | — | 70% | Sprint grande: M05 Admin, M07 CRM, M08 Leads entregues fora de ordem |
| S2 | 16/06 | 20% | 80% | DB real (TiDB), branding aplicado, M01 (Home/Sobre/Contato), Lighthouse, Playwright |
| **Hoje** | **18/06** | **~21%** | **86%** | Redesign jaywest.ca na Home + fix imagem |
| S3 | 23/06 | 30% | 86% | *(projeção — sem trabalho extra agendado)* |
| S4–S6 | 30/06–14/07 | 40–70% | 86% | Patamar mantido até desbloqueio do M06 |
| S7–S8 | 21/07–28/07 | 80–90% | 86%→? | M06 (MLS/IDX) depende de credenciais SimplyRETS do cliente — único módulo a 0% |
| S9–S10 | 04/08–14/08 | 90–100% | →100% | QA final, deploy produção, screencast — projeção pós-desbloqueio do M06 |

**Leitura:** o projeto está ~65 pontos percentuais adiantado do cronograma calendário, puxado pelos sprints intensivos de 09/06, 16/06 e 18/06. O único gargalo real é o **Módulo 06 (MLS/IDX)**, 100% bloqueado por uma dependência externa (credenciais SimplyRETS) — não é um risco de execução, é uma espera de terceiros.

---

## ✅ IMPLEMENTADO — Sprint 16/06/2026

### Deploy & Infraestrutura

| Entregável | Detalhes | Status |
|------------|----------|--------|
| Questionário de conteúdo para o cliente | `questionario-cliente-4rivers.html` — 7 seções (dados, história, M/V/V, números, equipe, depoimentos, contato) + checklist de imagens com specs técnicas + botão "Salvar como PDF" | ✅ |
| Repositório GitHub | `github.com/lucasleite22/4Rivers-Realty` (privado) — 108 arquivos, histórico limpo | ✅ |
| Deploy Vercel (preview para cliente) | URL ativa em demo mode — sem banco de dados necessário | ✅ |
| Modo demo | Login bypass (`DEMO_MODE=true`) — banner "Ambiente de Demonstração", botão "Access Demo →", JWT sem DB | ✅ |
| Fixes de build (10 PRs) | resend missing, leaflet missing, Decimal→Number, Buffer→Uint8Array, jest tsconfig exclude, prisma generate, JWT runtime, Resend lazy, Suspense/useSearchParams, API empty-on-error | ✅ |
| API resilience para demo | Todas as rotas críticas retornam dados vazios (não 500) quando DB indisponível | ✅ |

---

## ✅ IMPLEMENTADO — Sprint 09/06/2026

### Módulo 05 — Admin Panel

| Funcionalidade | Arquivos-chave | Status |
|----------------|----------------|--------|
| Dashboard com KPIs reais (active props, leads, showings, offers, closed, overdue) + feed de eventos | `app/admin/page.tsx`, `app/api/dashboard/stats/route.ts` | ✅ |
| Tabela de propriedades com busca, badges de tipo/status/source, export Excel | `app/admin/properties/page.tsx` | ✅ |
| Página de detalhe/edição de propriedade: galeria com thumbnails clicáveis, edição inline, visibilidade, danger zone | `app/admin/properties/[id]/page.tsx` | ✅ |
| Formulário de criação de propriedade com uploader de imagens (drop zone + grid de previews, até 20 fotos) | `app/admin/properties/new/page.tsx` | ✅ |
| Painel de submissões de clientes: filtros por status, cards com fotos, contato, botão "Approve → Create Listing" | `app/admin/submissions/page.tsx` | ✅ |
| Badge de pendentes no sidebar (Submissions) atualizado ao carregar o admin | `app/admin/layout.tsx` | ✅ |
| Tag de origem nas propriedades: **Agent** (azul) · **MLS** (roxo) · **Client** (âmbar) | `app/admin/properties/page.tsx`, `[id]/page.tsx` | ✅ |
| Campo `source` no schema Prisma (`PropertySource` enum: AGENT/MLS/CLIENT, default AGENT) | `prisma/schema.prisma` | ✅ |

> **DB pendente:** `ALTER TABLE properties ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'AGENT';` + `npx prisma generate`

---

### Módulo 07 — CRM

| Funcionalidade | Arquivos-chave | Status |
|----------------|----------------|--------|
| Fix DnD Kanban: listeners no grip handle apenas, `isDragging` ref previne click após drag, `pointerWithin` collision detection | `components/crm/KanbanCard.tsx`, `KanbanBoard.tsx` | ✅ |
| Modal de detalhes do lead: tabs Details / Activity Log, edição inline de todos os campos | `components/crm/LeadDetailModal.tsx` | ✅ |
| Tag de origem legível no Kanban: Website · Referral · Zillow · Realtor.com · Instagram · MLS · Other | `components/crm/KanbanCard.tsx` | ✅ |
| Log de atividades: timeline visual, formulário para registrar Call/Email/Showing/Offer/Note | `LeadDetailModal.tsx`, `app/api/leads/[id]/activities/route.ts` | ✅ |
| Auto-log de mudanças de stage: toda vez que card é arrastado entre colunas, cria `LeadActivity` automaticamente | `app/api/leads/[id]/stage/route.ts` | ✅ |
| Download do log em `.txt`: lead info + histórico completo de atividades formatado | `LeadDetailModal.tsx` (client-side blob) | ✅ |

---

### Módulo 08 — Captação de Leads

| Funcionalidade | Arquivos-chave | Status |
|----------------|----------------|--------|
| Página `/list-property`: hero, workflow 4 etapas, formulário de vendedor + upload de até 8 fotos com drop zone e previews | `app/list-property/page.tsx` | ✅ |
| Endpoint de submissão com imagens: multipart FormData, salva lead SELLER + imagens em `/uploads/leads/[id]/` | `app/api/list-property/route.ts`, `lib/upload.ts` | ✅ |
| Aprovação de submissão: converte lead SELLER em Property (`source=CLIENT`), importa imagens, auto-log de atividade | `app/api/admin/approve-submission/route.ts` | ✅ |

---

## ✅ IMPLEMENTADO — Sprint 18/06/2026

| Entregável | Detalhes | Status |
|------------|----------|--------|
| Banco de dados real em produção | TiDB Cloud Serverless conectado no Vercel, `DEMO_MODE` removido, seed aplicado | ✅ |
| Marca em evidência | Logo maior no Navbar, sidebar do admin e hero do About com o logo oficial; favicon + manifest | ✅ |
| Fix de contraste no login | Substituídas classes mortas (`cyan-brand`, `bg-dark`) pelos tokens atuais | ✅ |
| Página de detalhe do imóvel | Galeria, specs, descrição, mapa e formulário de interesse (antes era um stub) | ✅ |
| Mapa interativo em `/properties` | Toggle Grid/Mapa com pins customizados na paleta atual | ✅ |
| Testes E2E Playwright | 5 specs: home, properties, auth, admin, contact | ✅ |
| Limpeza de cores legadas em todo o app | `cyan-brand`, `#00aeef`, `#33ccff`, `bg-site-bg`, `cyan-500/600` substituídos pelos tokens da marca em CRM/Kanban, formulários multi-etapa, launches, list-property, admin properties | ✅ |
| Auditoria Lighthouse | Performance 95 · Acessibilidade 95 · Boas Práticas 100 · SEO 100 (home) — heading-order corrigido no Footer | ✅ |
| Roteiro de screencast de treinamento | `roteiro-screencast-4rivers.md` — 20min, cobre site público + admin completo | ✅ |

> **Pendente de decisão do cliente:** contraste do `text-brand-blue` em textos pequenos ("eyebrows") está abaixo do mínimo AA — é uma cor de marca usada em várias páginas, não deve ser alterada sem validação visual.

---

## 🔲 BACKLOG — Pendentes prioritários

| # | Tarefa | Módulo | Observação |
|---|--------|--------|------------|
| 1 | Enviar questionário-cliente-4rivers.html para o Jales e aguardar resposta | M01 | Popula páginas Sobre, Time, M/V/V |
| 2 | Edge Function / cron job para sync SimplyRETS (4h) | M06 | Aguardando credenciais SimplyRETS |
| 3 | Conformidade Stellar MLS (atribuição obrigatória nas listagens) | M06 | Depende do item 2 |
| 4 | Documentação técnica módulo 06 | M06 | Depende do item 2 |
| 5 | Fotos reais (hoje são Unsplash/ui-avatars) | M01 | Aguardando cliente |
| 6 | Telefone/email reais no Contato | M01 | Aguardando cliente |
| 7 | Decisão de contraste do `brand-blue` em textos pequenos | M01 | Aguardando validação visual do cliente |
| 8 | Migrar para Hostinger (se o cliente preferir ao Vercel+TiDB atual) | M10 | Hoje já está em produção real no Vercel |
| 9 | Gravar o screencast seguindo o roteiro já pronto | M10 | Roteiro em `roteiro-screencast-4rivers.md` |

---

## Stack de Referência

| Camada | Tecnologia |
|--------|-----------|
| Front-end | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS + Framer Motion |
| ORM | Prisma ORM |
| Banco (local) | MySQL via XAMPP · banco: `4rivers_realty` |
| Banco (produção) | MySQL Hostinger |
| Auth | JWT customizado com `jose` · cookie: `4rivers_session` |
| Storage de arquivos | Sistema de arquivos local → `public/uploads/` |
| Mapa | Leaflet.js + react-leaflet |
| MLS | SimplyRETS API (Marion + Sumter County) |
| Email | Resend · remetente: `notifications@4riversrealty.com` |
| Deploy | Hostinger (produção) |
| Export | ExcelJS (xlsx estilizado) |
| Testes | Jest + Testing Library · Playwright (E2E, pendente) |
| DnD | @dnd-kit (Kanban) |
| Rate Limiting | In-memory sliding window (`lib/rateLimit.ts`) |

---

## Credenciais de Desenvolvimento

| Recurso | Valor |
|---------|-------|
| Admin login | `lucas@4riversrealty.com` / `admin2024` |
| Agent login | `lindoso@4riversrealty.com` / `agent2024` |
| Dev server | `http://localhost:3000` |
| phpMyAdmin | `http://localhost/phpmyadmin` |
| DB local | `mysql://root:@localhost:3306/4rivers_realty` |

---

## Sessões Recorrentes no Claude

| Quando | Tipo de sessão | Prompt base |
|--------|---------------|-------------|
| Toda manhã | Planejamento do dia | "Hoje é [data], estou na S[X]. Vou trabalhar em [tarefa]. Qual o melhor ponto de partida?" |
| Durante código | Debug/implementação | "Estou implementando [feature] no módulo [X]. Aqui está meu código atual: [código]. O problema é..." |
| Toda sexta | Code review | "Aqui está o PR desta semana. Revise a arquitetura, segurança e qualidade do código:" |
| Toda sexta | Relatório cliente | "Gere um relatório de progresso da semana [X] para enviar ao Jales. Concluímos: [lista]" |

---

*Proposta: PROP-290526-4RV · Edifico Engenharia · lucas.leite@edifico.com.br*
