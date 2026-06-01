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
| Sex 05/06 | Lucas | Setup do projeto: criar repo, estrutura Next.js, Tailwind, Supabase project, variáveis de ambiente | Repo criado, projeto rodando localmente |
| Seg 09/06 (início semana real) | Lindoso | Layout base: NavBar, Footer, sistema de fontes (Cormorant + Barlow), paleta de cores do branding | Componentes base |

**Tarefas Claude desta semana:**
- Gerar estrutura de pastas do projeto Next.js + Supabase
- Criar `tailwind.config.js` com as cores e fontes da 4Rivers
- Scaffolding dos componentes: `<Navbar>`, `<Footer>`, `<HeroSection>`

---

## SEMANA 2 — 12/06 a 16/06
**Módulo 01: Site Institucional (conclusão)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 12/06 | Lindoso | Página Home: hero com busca, seção de estatísticas, seção de destaques | Home completa |
| Ter 13/06 | Lindoso | Página Sobre: história, equipe, valores da empresa | Página Sobre |
| Qua 14/06 | Lindoso | Página Contato: formulário + mapa Google Maps embed | Página Contato |
| Qui 15/06 | Lucas + Lindoso | SEO: meta tags, Open Graph, sitemap.xml, robots.txt | SEO configurado |
| Sex 16/06 | Lindoso | Animações (Framer Motion), micro-interações, responsividade mobile | Módulo 01 ✅ |

**Tarefas Claude esta semana:**
- Gerar componentes React para cada seção do Home
- Criar schema de meta tags dinâmicas com Next.js `<Head>`
- Gerar sitemap.xml e configurar next-sitemap
- Revisar responsividade com breakpoints mobile/tablet/desktop

---

## SEMANA 3 — 19/06 a 23/06
**Módulo 02: Landing Page de Lançamentos**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 19/06 | Lindoso | Layout da landing: hero de lançamento, galeria de fotos/vídeo | Layout base |
| Ter 20/06 | Lindoso | Contador regressivo animado (React) + seção de especificações | Countdown funcional |
| Qua 21/06 | Luan | Formulário de captação integrado ao Supabase (tabela `leads`) | Lead salvo no banco |
| Qui 22/06 | Lindoso | Botão CTA WhatsApp flutuante + otimização mobile | CTA mobile |
| Sex 23/06 | Lucas | Code review geral + deploy de preview (Vercel) | Módulo 02 ✅ |

**Tarefas Claude esta semana:**
- Gerar componente `<CountdownTimer>` em React
- Criar schema SQL da tabela `leads` no Supabase
- Gerar API Route Next.js para salvar lead (`/api/leads`)
- Revisar acessibilidade e performance (Lighthouse)

---

## SEMANA 4 — 26/06 a 30/06
**Módulo 03: Portal de Listagem (início) + Módulo 04: Cadastro (início)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 26/06 | Luan | Schema SQL: tabelas `properties`, `property_images`, `property_types` | Banco modelado |
| Ter 27/06 | Lindoso | Grid de cards de imóveis: visualização lista e quadro (toggle) | Grid responsivo |
| Qua 28/06 | Lindoso | Filtros avançados: tipo, preço, acreagem, condado (URL params) | Filtros funcionando |
| Qui 29/06 | Luan | API Routes: `GET /api/properties` com paginação e filtros | API funcionando |
| Sex 30/06 | Lindoso | Início formulário multi-etapas de cadastro de propriedades | Step 1 e 2 prontos |

**Tarefas Claude esta semana:**
- Gerar schema SQL completo de properties com campos específicos para farms/horse farms
- Criar hook `useProperties()` com React Query
- Gerar componente `<PropertyCard>` e `<PropertyGrid>`
- Criar componente `<MultiStepForm>` com validação Zod

---

## SEMANA 5 — 03/07 a 07/07
**Módulo 03: Portal (cont.) + Módulo 04: Cadastro (cont.) + Módulo 05: Admin (início)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 03/07 | Lindoso | Mapa interativo Leaflet: pins customizados, clusters, preview ao hover | Mapa funcional |
| Ter 04/07 | Lindoso | Página de detalhe do imóvel: galeria, specs, formulário de interesse | Detalhe completo |
| Qua 05/07 | Luan | Supabase Auth: login email/senha, perfis Admin e Agent (RLS) | Auth funcionando |
| Qui 06/07 | Luan | Continuação cadastro: campos específicos horse farm (cocheiras, arena, pasto) | Campos especializados |
| Sex 07/07 | Lindoso | Favoritar imóveis (localStorage + Supabase), compartilhar link | Favoritos ✅ |

**Tarefas Claude esta semana:**
- Integrar Leaflet com Next.js (SSR disabled para o mapa)
- Gerar campos especializados: `<HorseFarmFields>`, `<FarmFields>`, `<LotFields>`
- Configurar Supabase RLS policies para Admin vs Agent
- Criar contexto de autenticação `<AuthProvider>`

---

## SEMANA 6 — 10/07 a 14/07
**Módulo 03 e 04: Finalização**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 10/07 | Luan | Upload múltiplo de fotos: Supabase Storage, compressão automática (Sharp) | Upload funcional |
| Ter 11/07 | Luan | Geolocalização no cadastro: Google Maps Geocoding API + pin no mapa | Geo funcional |
| Qua 12/07 | Lindoso | Polimento visual: animações de entrada, skeleton loading, estados vazios | UX refinada |
| Qui 13/07 | Lucas + Luan | Code review módulos 03 e 04 + testes manuais completos | QA feito |
| Sex 14/07 | Lucas | Deploy preview módulos 03 e 04 + relatório semanal ao cliente | Módulos 03 e 04 ✅ |

**Tarefas Claude esta semana:**
- Gerar função de compressão de imagem com Sharp no Next.js
- Criar componente `<ImageUploader>` com drag-and-drop
- Revisar todas as API Routes com tratamento de erro consistente
- Gerar testes básicos com Jest/Testing Library

---

## SEMANA 7 — 17/07 a 21/07
**Módulo 05: Painel Administrativo (conclusão) + Módulo 06: MLS/IDX (início)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 17/07 | Lindoso | Dashboard admin: KPIs (imóveis, leads, conversões), layout dark | Dashboard visual |
| Ter 18/07 | Lindoso | CRUD de imóveis no admin: listagem, edição inline, gestão de fotos | CRUD completo |
| Qua 19/07 | Lindoso | Gestão de lançamentos e campanhas no admin | Lançamentos admin |
| Qui 20/07 | Luan | Início integração SimplyRETS: autenticação, primeiro fetch de listings | API conectada |
| Sex 21/07 | Lucas | Review + interface mobile para agentes em campo | Módulo 05 ✅ |

**Tarefas Claude esta semana:**
- Gerar layout do dashboard com gráficos (Recharts)
- Criar componentes de tabela com sort/filter para o admin
- Documentar endpoints SimplyRETS relevantes para o projeto
- Gerar wrapper `simplyrets.service.ts` para consumir a API

---

## SEMANA 8 — 24/07 a 28/07
**Módulo 06: Integração MLS/IDX (conclusão)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 24/07 | Luan | Mapeamento de campos: MLS → banco 4Rivers (normalização) | Mapeamento documentado |
| Ter 25/07 | Luan | Edge Function Supabase: sync automático a cada 4 horas | Cron funcionando |
| Qua 26/07 | Luan | Feed unificado: imóveis MLS + próprios com filtros simultâneos | Feed unificado |
| Qui 27/07 | Lindoso | Exibição de conformidade MLS (atribuição obrigatória) nas listagens | Conformidade ✅ |
| Sex 28/07 | Lucas | Testes da integração MLS + documentação do módulo | Módulo 06 ✅ |

**Tarefas Claude esta semana:**
- Gerar Edge Function Supabase para sync MLS (TypeScript)
- Criar mapeamento de tipos: MLS fields → schema 4Rivers
- Revisar conformidade com regras do Stellar MLS
- Gerar documentação técnica do módulo 06

---

## SEMANA 9 — 31/07 a 04/08
**Módulo 07: CRM + Módulo 08: Captação de Leads (início)**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 31/07 | Luan + Lindoso | Pipeline Kanban: colunas Novo → Contato → Proposta → Fechado (drag-and-drop) | Kanban funcional |
| Ter 01/08 | Luan | Perfis de clientes: histórico de interações, imóveis de interesse | Perfis completos |
| Qua 02/08 | Lindoso | Aba de campanhas de lançamento + métricas por agente | Campanhas ativas |
| Qui 03/08 | Luan | Pipeline de captação: formulários → Supabase → alerta Resend para agente | Notificação email |
| Sex 04/08 | Luan | E-mail de confirmação automático para o lead (template 4Rivers) | Módulos 07 e 08 ✅ |

**Tarefas Claude esta semana:**
- Gerar Kanban com `@dnd-kit` (drag-and-drop acessível)
- Schema SQL: tabelas `clients`, `interactions`, `pipeline_stages`
- Configurar Resend: templates HTML de email com logo 4Rivers
- Criar API Route para trigger de notificação por email

---

## SEMANA 10 — 07/08 a 11/08
**Módulo 08: Exportação Excel + Testes Finais + Deploy**

| Dia | Responsável | Sessão no Claude | Entregável |
|-----|-------------|------------------|------------|
| Seg 07/08 | Luan | Exportação Excel/CSV com filtros de data, origem e status (xlsx.js) | Export funcional |
| Ter 08/08 | Lucas | Testes E2E com Playwright: fluxos críticos (busca, lead, login admin) | Testes passando |
| Qua 09/08 | Lucas | Otimizações de performance: lazy loading, image optimization, bundle size | Lighthouse 90+ |
| Qui 10/08 | Lucas | Setup produção: domínio, variáveis de ambiente Vercel, Supabase prod | Infra pronta |
| Sex 11/08 | Lucas | Deploy final + screencast de 20min para o Jales + relatório de entrega | 🚀 GO LIVE ✅ |

**Tarefas Claude esta semana:**
- Gerar função de export Excel com `exceljs`
- Criar scripts de testes E2E com Playwright
- Checklist de segurança: RLS, env vars, rate limiting
- Gerar roteiro do screencast de treinamento

---

## Sessões Recorrentes no Claude

| Quando | Tipo de sessão | Prompt base |
|--------|---------------|-------------|
| Toda manhã | Planejamento do dia | "Hoje é [data], estou na S[X]. Vou trabalhar em [tarefa]. Qual o melhor ponto de partida?" |
| Durante código | Debug/implementação | "Estou implementando [feature] no módulo [X]. Aqui está meu código atual: [código]. O problema é..." |
| Toda sexta | Code review | "Aqui está o PR desta semana. Revise a arquitetura, segurança e qualidade do código:" |
| Toda sexta | Relatório cliente | "Gere um relatório de progresso da semana [X] para enviar ao Jales. Concluímos: [lista]" |

---

## Stack de Referência

| Camada | Tecnologia |
|--------|-----------|
| Front-end | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS + Framer Motion |
| Banco | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Mapa | Leaflet.js |
| MLS | SimplyRETS API |
| Email | Resend |
| Deploy | Vercel (front) + Supabase (back) |
| Export | ExcelJS |
| Testes | Jest + Playwright |

---

*Proposta: PROP-290526-4RV · Edifico Engenharia · lucas.leite@edifico.com.br*
