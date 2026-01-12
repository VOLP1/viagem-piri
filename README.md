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
