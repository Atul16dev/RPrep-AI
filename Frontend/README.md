# Artify API frontend

The frontend is a React application built with Vite. Run the API backend separately from the `Backend` directory.

## Local development

1. Install frontend dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `VITE_GOOGLE_CLIENT_ID` to the Google OAuth web client ID used by the backend.
3. Leave `VITE_API_URL` empty to use the local API at `http://localhost:3000`.
4. Start the frontend with `npm run dev`.

## Production

Set `VITE_API_URL` to the deployed backend origin before building, for example `https://api.example.com`. If the frontend and API share an origin, leave it empty and route `/api` to the backend through the hosting platform or reverse proxy.

Build with `npm run build`; the deployable static files are written to `dist`. The API must allow the deployed frontend origin through its `CORS_ORIGIN` setting and must use HTTPS when running in production.
