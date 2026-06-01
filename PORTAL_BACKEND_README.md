# 4River Realty — Portal Backend

Backend do Portal de Listagem de Propriedades, construído com **Next.js 14 App Router + Supabase**.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Banco de dados | Supabase (Postgres) |
| Autenticação | Supabase Auth |
| Storage | Supabase Storage |
| Validação | Zod |
| Linguagem | TypeScript |

---

## Setup inicial

### 1. Variáveis de ambiente

Crie `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>
```

### 2. Rodar as migrations

No **Supabase Dashboard → SQL Editor**, execute na ordem:

```
supabase/migrations/001_crm.sql        ← CRM base (já existia)
supabase/migrations/002_properties_fts.sql  ← FTS + políticas públicas + bucket
```

Ou via CLI:

```bash
supabase db push
```

### 3. Criar o bucket de imagens

A migration `002` já cria o bucket via SQL, mas você pode confirmar/criar manualmente:

1. Acesse **Supabase Dashboard → Storage**
2. Crie o bucket `property-images`
3. Marque como **Public bucket** ✓
4. As políticas RLS são criadas automaticamente pela migration

---

## API Routes

Todas as rotas estão em `app/api/properties/`.

### Listagem pública (com filtros)

```
GET /api/properties
```

**Parâmetros de query (todos opcionais):**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `search` | string | Full-text search (título, descrição, cidade, condado) |
| `type` | enum | `horse_farm`, `ranch`, `residential`, `commercial`, `land` |
| `status` | enum | `active` (padrão), `sold`, `under_contract` |
| `featured` | boolean | `true` para apenas destaques |
| `price_min` | number | Preço mínimo em USD |
| `price_max` | number | Preço máximo em USD |
| `acreage_min` | number | Acreagem mínima |
| `acreage_max` | number | Acreagem máxima |
| `county` | string | Filtro por condado (case-insensitive) |
| `city` | string | Filtro por cidade |
| `sort_by` | enum | `price_usd`, `acreage`, `created_at` (padrão), `title` |
| `sort_dir` | enum | `asc`, `desc` (padrão) |
| `page` | number | Página (padrão: 1) |
| `limit` | number | Itens por página (padrão: 12, máx: 100) |

**Exemplo:**
```bash
curl "https://seu-dominio.com/api/properties?type=horse_farm&price_max=500000&page=1&limit=6"
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Rolling Meadows Horse Farm",
      "type": "horse_farm",
      "price_usd": 450000,
      "acreage": 25.5,
      "county": "Marion",
      "city": "Ocala",
      "status": "active",
      "featured": true,
      "cover_image_url": "https://...supabase.co/storage/v1/object/public/property-images/uuid/img.jpg",
      "images": [...]
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 6,
  "total_pages": 7
}
```

---

### Detalhe da propriedade

```bash
GET /api/properties/:id
```

Retorna a propriedade com todas as imagens ordenadas por `sort_order`.

```bash
curl "https://seu-dominio.com/api/properties/550e8400-e29b-41d4-a716-446655440000"
```

---

### Propriedades em destaque (para o home)

```bash
GET /api/properties/featured
```

Retorna até 6 propriedades com `featured=true` e `status=active`.

```bash
curl "https://seu-dominio.com/api/properties/featured"
```

---

### Full-text search

```bash
GET /api/properties/search?q=horse+farm+ocala&page=1&limit=12
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | **Obrigatório.** Termo de busca |
| `type` | enum | Filtro adicional por tipo |
| `status` | enum | Padrão: `active` |
| `page` | number | Padrão: 1 |
| `limit` | number | Padrão: 12 |

```bash
curl "https://seu-dominio.com/api/properties/search?q=stables+pastures&type=horse_farm"
```

---

### Upload de imagem (admin)

```bash
POST /api/properties/:id/images
Content-Type: multipart/form-data
Authorization: Bearer <token>

file=@/path/to/image.jpg
```

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@photo.jpg" \
  "https://seu-dominio.com/api/properties/uuid/images"
```

**Resposta:**
```json
{
  "id": "uuid",
  "url": "https://...supabase.co/storage/v1/object/public/property-images/uuid/timestamp-hash.jpg",
  "is_cover": true,
  "sort_order": 0
}
```

---

### Deletar imagem (admin)

```bash
DELETE /api/properties/:id/images
Content-Type: application/json
Authorization: Bearer <token>

{ "image_id": "uuid" }
```

---

### Reordenar imagens (admin)

```bash
PATCH /api/properties/:id/images/reorder
Content-Type: application/json
Authorization: Bearer <token>

{
  "images": [
    { "id": "uuid-1", "sort_order": 0 },
    { "id": "uuid-2", "sort_order": 1 },
    { "id": "uuid-3", "sort_order": 2 }
  ]
}
```

A imagem com `sort_order: 0` torna-se automaticamente a capa.

---

### Criar propriedade (admin)

```bash
POST /api/properties
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Oak Ridge Horse Farm",
  "type": "horse_farm",
  "price_usd": 750000,
  "acreage": 40,
  "county": "Alachua",
  "city": "Gainesville",
  "description": "Beautiful horse farm with 4 stables...",
  "status": "active",
  "featured": true,
  "stables": 4,
  "arenas": 1,
  "pastures": 3
}
```

---

### Atualizar propriedade (admin)

```bash
PATCH /api/properties/:id
Content-Type: application/json
Authorization: Bearer <token>

{ "price_usd": 695000, "featured": false }
```

---

## Server Actions

Disponíveis em `app/actions/properties.ts` para uso em componentes Server:

```typescript
import {
  createProperty,
  updateProperty,
  deleteProperty,
  toggleFeatured,
  updatePropertyStatus,
  addPropertyImage,
  removePropertyImage,
} from '@/app/actions/properties'

// Criar propriedade com imagens
await createProperty(
  { title: 'Oak Ridge Farm', type: 'horse_farm', price_usd: 750000 },
  [file1, file2]
)

// Alternar destaque
const isNowFeatured = await toggleFeatured(propertyId)

// Mudar status
await updatePropertyStatus(propertyId, 'sold')
```

---

## Conectar o portal.html existente às APIs

O arquivo `portal.html` usa dados em memória (array `sampleProperties`). Para conectá-lo às APIs reais:

### 1. Substituir a carga inicial de propriedades

Encontre no `portal.html` o bloco que popula as propriedades (algo como `const sampleProperties = [...]`).

Substitua por:

```javascript
async function loadProperties(filters = {}) {
  const params = new URLSearchParams(filters)
  const res = await fetch(`/api/properties?${params}`)
  const { data, total, total_pages } = await res.json()
  return { properties: data, total, total_pages }
}
```

### 2. Conectar os filtros do formulário

```javascript
// Exemplo: filtro por tipo e preço máximo
const filters = {
  type: document.getElementById('type-filter').value,
  price_max: document.getElementById('price-max').value,
  page: currentPage,
  limit: 12,
}
const { properties } = await loadProperties(filters)
renderPropertyCards(properties)
```

### 3. Barra de busca → /api/properties/search

```javascript
searchInput.addEventListener('input', debounce(async (e) => {
  const q = e.target.value.trim()
  if (!q) return loadProperties()
  const res = await fetch(`/api/properties/search?q=${encodeURIComponent(q)}`)
  const { data } = await res.json()
  renderPropertyCards(data)
}, 400))
```

### 4. Seção "Featured" do home → /api/properties/featured

```javascript
const res = await fetch('/api/properties/featured')
const featured = await res.json()
renderFeaturedSection(featured)
```

### 5. Detalhe da propriedade

```javascript
// Quando o usuário clica num card:
async function openPropertyDetail(id) {
  const res = await fetch(`/api/properties/${id}`)
  const property = await res.json()
  renderModal(property)
}
```

---

## Autenticação nas rotas admin

As rotas de escrita usam `supabase.auth.getUser()` para verificar a sessão. Para obter o token:

```javascript
// No cliente (browser)
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token

// Usar em fetch
fetch('/api/properties', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(propertyData),
})
```

---

## Estrutura dos arquivos criados

```
app/
  actions/
    properties.ts          ← Server Actions
  api/
    properties/
      route.ts             ← GET (list) + POST (create)
      [id]/
        route.ts           ← GET (detail) + PATCH (update) + DELETE
        images/
          route.ts         ← POST (upload) + DELETE (remove)
          reorder/
            route.ts       ← PATCH (reorder)
      featured/
        route.ts           ← GET 6 featured properties
      search/
        route.ts           ← GET full-text search

lib/
  supabase/
    storage.ts             ← Upload/delete helpers

supabase/
  migrations/
    001_crm.sql            ← CRM base (existia)
    002_properties_fts.sql ← FTS + public policies + bucket

types/
  properties.ts            ← TypeScript types
```
