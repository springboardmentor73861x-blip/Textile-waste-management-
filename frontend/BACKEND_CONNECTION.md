# FastAPI connection

Default backend: `http://127.0.0.1:8000`

Set `VITE_API_URL` in `.env` if your backend runs elsewhere. Do not append `/api` unless your FastAPI app actually mounts routers under `/api`.

## Start backend

```powershell
uvicorn app.main:app --reload
```

## Start frontend

```powershell
npm install
npm run dev
```

Axios automatically sends the stored JWT as `Authorization: Bearer <token>`.

Connected API areas include `/auth/*`, `/admin/*`, `/waste/*`, `/prediction/*`, `/waste-requests/*`, `/production-waste/*`, and `/sustainability/*`.

The standalone AI Insights pages/routes/menu entries are removed; AI prediction remains part of textile waste analysis.
