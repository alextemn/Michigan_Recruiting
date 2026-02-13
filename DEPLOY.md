# Deployment

## Backend (Heroku)

- **App URL:** https://club-applications-d42c9d50a2b6.herokuapp.com/

Deploy from the `club_backend` directory (or set Heroku config to use that subdirectory).

**Config vars to set in Heroku (Settings → Config Vars):**

| Variable         | Description |
|------------------|-------------|
| `DATABASE_URL`   | Set automatically if you use Heroku Postgres; otherwise set your PostgreSQL connection URL. |
| `DJANGO_SECRET_KEY` | Strong random secret for production (e.g. `openssl rand -base64 48`). |
| `DEBUG`          | Set to `false` in production. |

Static files are served via WhiteNoise. Media uploads are stored on the dyno filesystem (ephemeral); for persistent file storage use something like AWS S3 and update Django settings.

---

## Frontend (Vercel)

- **App URL:** https://michigan-recruiting.vercel.app/

1. Import the repo and set the **Root Directory** to `club_frontend`.
2. Build command: `npm run build` (default for Vite).
3. Output directory: `dist` (Vite default).
4. **Environment variable** (optional):  
   - `VITE_API_URL` = `https://club-applications-d42c9d50a2b6.herokuapp.com/api`  
   If unset, the app uses this production API by default.

Client-side routing is handled by `vercel.json` rewrites so all routes serve `index.html`.

---

## Local development

- **Backend:** Set `DATABASE_URL` (or leave unset to use SQLite), and optionally `DJANGO_SECRET_KEY` and `DEBUG=true` in `.env` or the environment.
- **Frontend:** Create `club_frontend/.env.local` with `VITE_API_URL=http://127.0.0.1:8000/api` to point at your local Django server.
