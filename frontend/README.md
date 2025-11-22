# Smart Business AI – Frontend (Vite + React + TS)

## Scripts

- npm run dev – start Vite dev server (defaults to http://localhost:5173)
- npm run build – type-check and build
- npm run preview – preview the production build

## Environment

Create a `.env` file (see `.env.example`):

```
VITE_API_BASE=http://127.0.0.1:5002
```

The Vite dev server proxies `/api/*` to `VITE_API_BASE` (see `vite.config.ts`).

## App Structure

- src/pages/App.tsx – Layout and navigation
- src/pages/Home.tsx – Public landing page
- src/pages/Login.tsx – Calls `POST /api/auth/login` and stores token
- src/pages/Dashboard.tsx – Protected; calls `GET /api/auth/me`
- src/pages/Profile.tsx – Vendor profile glass UI with metrics, timeline, and editable form
- src/components/ProtectedRoute.tsx – Redirects unauthenticated users to /login
- src/api/client.ts – Axios instance with Authorization header
- src/styles.css – Global styling including glass theming for the profile experience

## Vendor Profile Experience

The vendor profile page now features a wide glassmorphism layout that fills large displays while staying responsive on smaller screens. Key elements include:

- Hero banner with vendor identity, status chips, and quick actions
- Health metrics, engagement timeline, and channel coverage summary
- Expanded form layout with refined typography for profile settings
- Shared utility classes in `src/styles.css` for gradients, chips, and card treatments

## Running locally

1. Backend: ensure the server is running (local dev uses http://127.0.0.1:5002 by default)
2. Frontend: from `frontend/` run:

```bat
npm install
npm run dev
```

Open the URL printed by Vite (e.g., http://localhost:5173).

## Notes

- If you change the backend port, update `VITE_API_BASE` or the `server.proxy` target in `vite.config.ts`.
- Token is stored in `localStorage` for simplicity; consider HttpOnly cookies for production.
- Profile metrics and copy are derived from mock data inside `src/pages/Profile.tsx`; adjust the memoized helpers there to wire in real analytics when available.
