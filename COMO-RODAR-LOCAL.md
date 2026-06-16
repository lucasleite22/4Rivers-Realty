# Como rodar o 4Rivers Realty localmente

## Pré-requisitos (instalar uma vez)
- [Node.js 18+](https://nodejs.org)
- [XAMPP](https://www.apachefriends.org) — para o MySQL local

---

## Toda vez que for trabalhar

### 1. Iniciar o banco de dados
1. Abrir o **XAMPP Control Panel**
2. Clicar em **Start** no módulo **MySQL**
3. Aguardar ficar verde com "Running"

### 2. Abrir o terminal na pasta do projeto
```
cd "C:\Users\leite\OneDrive\Documentos\Projetos virtuais\4Rivers Realty\4River REalty"
```

### 3. Rodar o servidor
```
npm run dev
```

### 4. Acessar no browser
```
http://localhost:3000
```

---

## Páginas principais

| Página | URL |
|--------|-----|
| Site público | http://localhost:3000 |
| Lançamentos | http://localhost:3000/launches |
| Imóveis | http://localhost:3000/properties |
| Contato | http://localhost:3000/contact |
| Login admin | http://localhost:3000/auth/login |
| Dashboard | http://localhost:3000/admin |
| CRM / Kanban | http://localhost:3000/admin/leads |
| Propriedades admin | http://localhost:3000/admin/properties |

---

## Login

| Usuário | Email | Senha | Perfil |
|---------|-------|-------|--------|
| Lucas Leite | lucas@4riversrealty.com | admin2024 | Super Admin |
| Lindoso | lindoso@4riversrealty.com | agent2024 | Agent |
| Luan | luan@4riversrealty.com | agent2024 | Agent |

---

## Primeira vez (configuração inicial)

Execute estes comandos **uma única vez** ao clonar o projeto:

```
npm install
npm install leaflet react-leaflet @types/leaflet
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

Se aparecer erro de coluna faltando após o migrate, rode:
```
npx prisma db execute --stdin
ALTER TABLE `properties` ADD COLUMN IF NOT EXISTS `latitude` DOUBLE NULL, ADD COLUMN IF NOT EXISTS `longitude` DOUBLE NULL, ADD COLUMN IF NOT EXISTS `mlsId` VARCHAR(191) NULL;
EOF
npx prisma db seed
```

---

## Banco de dados

| Campo | Valor |
|-------|-------|
| Host | localhost |
| Porta | 3306 |
| Banco | 4rivers_realty |
| Usuário | root |
| Senha | *(vazia no XAMPP padrão)* |

Visualizar o banco pelo browser:
```
http://localhost/phpmyadmin
```

---

## Comandos úteis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npx prisma studio` | Interface visual do banco (http://localhost:5555) |
| `npx prisma db seed` | Repopula o banco com dados de teste |
| `npx prisma migrate dev --name nome` | Cria e aplica nova migração |
| `npx prisma generate` | Regenera o Prisma Client após mudar o schema |
| `npm test` | Roda os testes Jest |

---

## Parar o servidor
Pressionar `Ctrl + C` no terminal onde o `npm run dev` está rodando.

Depois parar o MySQL no XAMPP Control Panel clicando em **Stop**.

---

## Subir para o Hostinger (quando chegar a hora)

1. Trocar o `DATABASE_URL` no `.env` para as credenciais do Hostinger:
   ```
   DATABASE_URL="mysql://u457512967_lucas:SENHA@HOST_HOSTINGER:3306/u457512967_4riversrealty"
   ```
2. Liberar o IP do servidor em: Hostinger → Databases → Remote MySQL
3. Rodar a migração no servidor:
   ```
   npx prisma migrate deploy
   ```
4. Rodar o seed (apenas uma vez):
   ```
   npx prisma db seed
   ```

---

*Projeto: 4Rivers Realty · Ocala & Sumter County, FL*
*Stack: Next.js 14 + Prisma + MySQL + Tailwind CSS*
