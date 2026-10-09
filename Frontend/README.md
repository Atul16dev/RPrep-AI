# Artify API frontend

The frontend is a React application built with Vite. Run the API backend separately from the `Backend` directory.

## Local development

1. Install frontend dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `VITE_GOOGLE_CLIENT_ID` to the Google OAuth web client ID used by the backend.
3. Leave `VITE_API_URL` empty to use the local API at `http://localhost:3000`.
4. Start the frontend with `npm run dev`.

## Production

For Vercel deployments, configure `BACKEND_API_URL` in the Vercel project environment variables with the backend origin, for example `https://api.example.com` (do not append `/api`). Remove or leave `VITE_API_URL` empty so browser requests use the same-origin API proxy; this also allows the authentication cookie to work when the backend is hosted on a different domain. Redeploy after changing environment variables.

For other hosting platforms, set `VITE_API_URL` to the deployed backend origin before building. The backend must allow the deployed frontend origin through `CORS_ORIGIN` and must use HTTPS in production.

Build with `npm run build`; the deployable static files are written to `dist`. Vercel serves `/api/*` through the proxy and rewrites client-side routes such as `/dashboard` to the app.
