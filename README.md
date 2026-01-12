# PiriMatch

Tinder-style voting app for waterfalls.

## Requirements

- Docker Desktop (for PostgreSQL)
- Node.js 18+ (works with newer too)

## 1) Start the database

```powershell
Set-Location "c:\Users\Eduli\viagem piri"
docker-compose up -d
```

Postgres runs on `localhost:5432` with:

- user: `postgres`
- password: `password`
- database: `pirimatch`

## 2) Start the API

```powershell
Set-Location "c:\Users\Eduli\viagem piri\server"
npm install
$env:PORT=3000
node index.js
```

API:
- `POST http://localhost:3000/vote`
- `GET  http://localhost:3000/ranking`

## 3) Start the client

```powershell
Set-Location "c:\Users\Eduli\viagem piri\client"
npm install
# Optional (if your API is not on :3000):
# Copy-Item .env.example .env
# notepad .env
npm run dev
```

Open `http://localhost:5173`.

## Notes

- If the API says `EADDRINUSE :3000`, something is already using port 3000. Stop the other process, or run with another port:

```powershell
Set-Location "c:\Users\Eduli\viagem piri\server"
$env:PORT=3001
node index.js
```

## Deploy no Coolify (separados)

Você vai criar 3 recursos no Coolify: **Postgres** + **API (server)** + **Client (frontend)**.

### 1) Subir para um repositório

Crie um repositório (GitHub/GitLab) e envie esse projeto.

### 2) Postgres (Database resource)

No Coolify: **New Resource → Database → PostgreSQL**.

Guarde as credenciais/host/porta que o Coolify te der (ou use as que você configurar).

### 3) API (Node/Express)

No Coolify: **New Resource → Application** apontando para o mesmo repo, com **Root Directory** = `server`.

Env vars (exemplo):

- `PORT=3000`
- `PGHOST=<host do postgres no coolify>`
- `PGPORT=5432`
- `PGDATABASE=pirimatch`
- `PGUSER=postgres`
- `PGPASSWORD=<sua senha>`

Comandos sugeridos:

- **Build**: `npm ci`
- **Start**: `npm start`

Depois do deploy, teste:

- `GET https://SEU-DOMINIO-DA-API/health`

### 4) Client (Vite)

No Coolify: **New Resource → Application** apontando para o repo, com **Root Directory** = `client`.

Env vars:

- `VITE_API_BASE=https://SEU-DOMINIO-DA-API`

Comandos sugeridos:

- **Build**: `npm ci ; npm run build`
- **Start**: `npm run preview -- --host 0.0.0.0 --port $PORT`

Observações:

- `VITE_API_BASE` é lido no build do Vite; depois que mudar no Coolify, faça redeploy do client.
- Configure domínio/HTTPS no Coolify (ex: `api.seudominio.com` para a API e `app.seudominio.com` para o client).
