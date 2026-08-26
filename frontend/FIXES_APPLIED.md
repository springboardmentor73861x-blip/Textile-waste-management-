# Textile Waste AI Platform - Frontend Fixes

This version fixes the frontend crash and routing issues found in the uploaded project.

## Main fixes

- Replaced the recursive `src/components/DashboardCharts.jsx` with the real chart component.
- Kept `src/pages/DashboardCharts.jsx` as a compatibility re-export.
- Added `ProtectedRoute` so dashboard URLs redirect to `/login` when no user is stored.
- Cleaned duplicate login localStorage writes and normalized roles to lowercase.
- Added safe localStorage parsing in Navbar/Sidebar.
- Logout now clears `user`, `role`, and `access_token`.
- Fixed `/waste-upload` -> `/upload` compatibility route.
- Fixed dashboard navigation to use the actual manufacturer routes.
- Fixed the `Inventory.css` filename case mismatch.
- Fixed User Management role filtering for lowercase backend roles.
- Fixed Add User role values to use lowercase backend-friendly values.
- Added API base URL support through `VITE_API_URL`.
- Added optional Bearer token support through `access_token`.
- Added a catch-all route that returns to `/login`.

## Run on Windows

From the `frontend` folder:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/login
```

Backend default URL:

```text
http://127.0.0.1:8000
```

If your FastAPI server uses another URL, create a `.env` file:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## If the browser still opens `/admin`

Open `/login` directly. If an old login session is stored, clear the site's local storage once from Chrome DevTools, then reload `/login`.
