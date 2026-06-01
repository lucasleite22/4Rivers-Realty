# 4River Realty — CRM Backend

Next.js 14 App Router + Supabase backend for the 4Rivers CRM.

---

## 1. Prerequisites

- Node 18+
- A Supabase project (free tier works)
- `@supabase/ssr`, `@supabase/supabase-js`, and `zod` installed

```bash
npm install @supabase/ssr @supabase/supabase-js zod
```

---

## 2. Environment Variables

Create a `.env.local` at the root of your Next.js project:

```env
# Found in Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...

# Service role key — keep secret, server-side only
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
```

> ⚠️ Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It bypasses all RLS.

---

## 3. Running the Migration

### Option A — Supabase CLI (recommended)

```bash
npx supabase db push
# or if using local dev:
npx supabase migration up
```

### Option B — Supabase Dashboard

1. Open your project → **SQL Editor**
2. Copy the contents of `supabase/migrations/001_crm.sql`
3. Paste and click **Run**

### Create the first super_admin user

After running the migration, create a user via the Dashboard (Auth → Users → Invite user), then run:

```sql
INSERT INTO users (id, email, name, role)
VALUES ('<auth-user-uuid>', 'admin@4riverrealty.com', 'Admin', 'super_admin');
```

Or use the `POST /api/crm/users` route (requires an existing super_admin to call it — bootstrap manually the first time).

---

## 4. File Structure

```
app/
  api/
    auth/
      login/route.ts       POST — sign in
      logout/route.ts      POST — sign out
      me/route.ts          GET  — current user
    crm/
      leads/
        route.ts                    GET (filters) | POST
        [id]/
          route.ts                  GET | PATCH | DELETE
          activities/route.ts       GET | POST
          stage/route.ts            PATCH (pipeline move)
      properties/
        route.ts                    GET (filters) | POST
        [id]/route.ts               GET | PATCH | DELETE
      users/
        route.ts                    GET | POST (admin only)
        [id]/route.ts               PATCH (admin only)
      dashboard/
        stats/route.ts              GET
lib/
  supabase/
    server.ts    — createClient, createAdminClient, requireAuth, requireAdmin
    client.ts    — createClient (browser)
types/
  crm.ts         — all TypeScript interfaces
supabase/
  migrations/
    001_crm.sql
```

---

## 5. API Reference & curl Examples

Replace `http://localhost:3000` with your domain and `<TOKEN>` with the `access_token` from login.

### Auth

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@4riverrealty.com","password":"yourpassword"}'

# Current user
curl http://localhost:3000/api/auth/me \
  -H "Cookie: sb-access-token=<TOKEN>"

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: sb-access-token=<TOKEN>"
```

### Leads

```bash
# List leads (paginated, with filters)
curl "http://localhost:3000/api/crm/leads?status=new_lead&page=1&limit=20" \
  -H "Cookie: sb-access-token=<TOKEN>"

# Search leads
curl "http://localhost:3000/api/crm/leads?search=John&type=buyer" \
  -H "Cookie: sb-access-token=<TOKEN>"

# Create lead
curl -X POST http://localhost:3000/api/crm/leads \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<TOKEN>" \
  -d '{
    "name": "John Smith",
    "email": "john@email.com",
    "phone": "555-1234",
    "type": "buyer",
    "origin": "Zillow",
    "budget_usd": 850000,
    "acreage_desired": 50,
    "county_preferred": "Marion"
  }'

# Get lead
curl http://localhost:3000/api/crm/leads/<lead-id> \
  -H "Cookie: sb-access-token=<TOKEN>"

# Update lead
curl -X PATCH http://localhost:3000/api/crm/leads/<lead-id> \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<TOKEN>" \
  -d '{"notes": "Very motivated buyer. Follow up Friday."}'

# Move pipeline stage
curl -X PATCH http://localhost:3000/api/crm/leads/<lead-id>/stage \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<TOKEN>" \
  -d '{"status": "showing"}'

# Delete lead (super_admin only)
curl -X DELETE http://localhost:3000/api/crm/leads/<lead-id> \
  -H "Cookie: sb-access-token=<TOKEN>"
```

### Activities

```bash
# List activities for a lead
curl http://localhost:3000/api/crm/leads/<lead-id>/activities \
  -H "Cookie: sb-access-token=<TOKEN>"

# Log an activity
curl -X POST http://localhost:3000/api/crm/leads/<lead-id>/activities \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<TOKEN>" \
  -d '{
    "type": "call",
    "notes": "Discussed property on CR 225. Client interested.",
    "activity_date": "2026-06-01T14:00:00Z"
  }'
```

### Properties

```bash
# List properties
curl "http://localhost:3000/api/crm/properties?status=active&type=horse_farm" \
  -H "Cookie: sb-access-token=<TOKEN>"

# Create property (super_admin only)
curl -X POST http://localhost:3000/api/crm/properties \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<TOKEN>" \
  -d '{
    "title": "Sunrise Horse Farm",
    "type": "horse_farm",
    "price_usd": 1250000,
    "acreage": 120,
    "county": "Marion",
    "city": "Ocala",
    "stables": 2,
    "arenas": 1,
    "pastures": 6,
    "featured": true
  }'

# Update property
curl -X PATCH http://localhost:3000/api/crm/properties/<property-id> \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<TOKEN>" \
  -d '{"status": "under_contract"}'
```

### Users (super_admin only)

```bash
# List all users
curl http://localhost:3000/api/crm/users \
  -H "Cookie: sb-access-token=<TOKEN>"

# Create agent
curl -X POST http://localhost:3000/api/crm/users \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<TOKEN>" \
  -d '{
    "email": "agent@4riverrealty.com",
    "name": "Jane Agent",
    "role": "agent",
    "password": "SecurePass123!"
  }'

# Deactivate user
curl -X PATCH http://localhost:3000/api/crm/users/<user-id> \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<TOKEN>" \
  -d '{"active": false}'
```

### Dashboard Stats

```bash
curl http://localhost:3000/api/crm/dashboard/stats \
  -H "Cookie: sb-access-token=<TOKEN>"

# Response shape:
# {
#   "data": {
#     "total_active_leads": 42,
#     "leads_showing": 8,
#     "leads_offer_made": 3,
#     "leads_closed_won_this_month": 2,
#     "leads_overdue_followup": 11,
#     "upcoming_activities": [...]
#   }
# }
```

---

## 6. Integrating with crm.html (Alpine.js → Fetch)

Replace Alpine.js `$fetch` / `axios` calls with the native `fetch` API pointed at these routes.

**Before (Alpine.js example):**
```js
Alpine.store('crm', {
  async loadLeads() {
    const res = await fetch('/api/crm/leads?status=new_lead')
    this.leads = (await res.json()).data
  }
})
```

**Authentication pattern** — after login, Supabase sets an `sb-*` cookie automatically. All subsequent `fetch` calls include it:

```js
// Login once
async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json() // { data: { user, session } }
}

// Then all other calls work with cookies automatically
async function moveLeadStage(leadId, status) {
  const res = await fetch(`/api/crm/leads/${leadId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return res.json()
}
```

**Kanban board update pattern:**
```js
// Drag-and-drop handler
async function onDropLead(leadId, newStatus) {
  await fetch(`/api/crm/leads/${leadId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  })
  await refreshBoard() // reload your columns
}
```

---

## 7. Notes

- **Pagination**: All list endpoints accept `?page=1&limit=20`. Response includes `meta.total`.
- **RLS**: Agents can read everything and create/edit leads & activities. Properties and user management require `super_admin`.
- **Service role key**: Used only for user creation (to bypass auth email confirmation). Never exposed to the client.
- **Supabase cookies**: The `@supabase/ssr` package handles cookie refresh automatically via middleware. Add `middleware.ts` at the root to enable token refresh on every request (see Supabase SSR docs).
