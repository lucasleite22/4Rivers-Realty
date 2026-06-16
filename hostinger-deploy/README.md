# 4Rivers Realty — Deploy Guide (Hostinger)

## Stack
- Next.js 14 (standalone output)
- MySQL 8 (Hostinger managed)
- Prisma ORM
- Node.js 20+

---

## 1. Criar Banco MySQL no hPanel

1. Acesse **hPanel → Databases → MySQL Databases**
2. Clique em **Create database**
   - Database name: `4rivers_realty`
3. Clique em **Create user**
   - Username: `4rivers_user`
   - Password: (gere uma senha forte e anote)
4. Clique em **Add User to Database** → selecione o usuário e banco → **All Privileges**

> Anote: `host`, `port` (geralmente `localhost` ou `127.0.0.1:3306`), `database`, `user`, `password`.

---

## 2. Configurar Variáveis de Ambiente

No servidor, crie o arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
nano .env
```

Preencha:
```
DATABASE_URL="mysql://4rivers_user:SUA_SENHA@localhost:3306/4rivers_realty"
JWT_SECRET="gere-com-openssl-rand-base64-32"
NEXT_PUBLIC_API_URL="https://4riversrealty.com/api"
NEXT_PUBLIC_SITE_URL="https://4riversrealty.com"
NODE_ENV="production"
```

---

## 3. Instalar Dependências

```bash
npm install
```

Certifique-se de que o `package.json` contém:
```json
{
  "dependencies": {
    "@prisma/client": "^5.x",
    "bcryptjs": "^2.x",
    "jose": "^5.x",
    "next": "14.x",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## 4. Rodar Migrations

```bash
npx prisma migrate deploy
```

Isso aplica `prisma/migrations/001_init/migration.sql` ao banco.

Para verificar:
```bash
npx prisma studio
```

---

## 5. Popular Dados Iniciais (seed)

```bash
npx prisma db seed
```

Isso cria:
- 3 usuários (admin + 2 agentes)
- 6 propriedades
- 8 leads + atividades

Credenciais do admin:
- Email: `lucas@4riversrealty.com`
- Senha: `admin2024` ← **troque imediatamente em produção!**

Para trocar a senha em produção:
```bash
npx prisma studio
# Ou via script:
node -e "
const {PrismaClient} = require('@prisma/client');
const {hashSync} = require('bcryptjs');
const p = new PrismaClient();
p.user.update({where:{email:'lucas@4riversrealty.com'}, data:{password:hashSync('NOVA_SENHA',12)}}).then(()=>p.\$disconnect());
"
```

---

## 6. Build da Aplicação

```bash
npm run build
```

O output estará em `.next/standalone/`.

---

## 7. Configurar Node.js App no hPanel

1. Acesse **hPanel → Advanced → Node.js**
2. Clique em **Create application**
   - Node.js version: **20.x** (ou mais recente LTS)
   - Application mode: **Production**
   - Application root: `/home/USER/public_html` (ou subpasta do projeto)
   - Application startup file: `server.js`
3. Clique em **Create**

Após criar, no terminal SSH:
```bash
cd /home/USER/public_html
# Copie o standalone output:
cp -r .next/standalone/* .
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

---

## 8. Comando de Start

```bash
node server.js
```

Ou configure como startup no hPanel Node.js Manager apontando para `server.js`.

Para manter o processo ativo com PM2:
```bash
npm install -g pm2
pm2 start server.js --name 4rivers-realty
pm2 save
pm2 startup
```

---

## 9. Apontar Domínio 4riversrealty.com

### Opção A — Hostinger DNS (domínio registrado na Hostinger)
1. **hPanel → Domains → DNS Zone Editor**
2. Certifique-se que o registro A aponta para o IP do servidor VPS:
   ```
   @ → A → SEU_IP_VPS
   www → CNAME → 4riversrealty.com
   ```

### Opção B — Domínio externo (apontando para Hostinger)
No painel do registrador do domínio, atualize os nameservers para:
```
ns1.hostinger.com
ns2.hostinger.com
```
Aguarde propagação (até 48h).

### SSL/HTTPS
1. **hPanel → SSL → Let's Encrypt**
2. Selecione o domínio e clique em **Install**
3. Certifique-se que `NODE_ENV=production` está definido no `.env`

---

## 10. Uploads de Imagens

As imagens são salvas em `public/uploads/properties/`. No servidor:

```bash
mkdir -p public/uploads/properties
chmod 755 public/uploads/properties
```

Certifique-se que o usuário Node.js tem permissão de escrita nessa pasta.

---

## Checklist Final

- [ ] `.env` configurado com credenciais reais
- [ ] `npx prisma migrate deploy` executado com sucesso
- [ ] `npx prisma db seed` executado
- [ ] Senha do admin trocada
- [ ] `npm run build` sem erros
- [ ] PM2 configurado com `pm2 startup`
- [ ] SSL instalado via Let's Encrypt
- [ ] Pasta `public/uploads/properties/` com permissão de escrita
- [ ] DNS apontando para o IP do servidor
