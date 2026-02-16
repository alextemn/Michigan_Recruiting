# Club Recruit

A full-stack web app for clubs to manage application forms, questions, and applicants—and for students to apply online.

- **Frontend:** React (Vite) + React Router + Axios  
- **Backend:** Django REST Framework + JWT (Simple JWT)  
- **Database:** PostgreSQL (production) / SQLite (local dev)

---

## Live links

| App | URL |
|-----|-----|
| **Frontend** | [michigan-recruiting.vercel.app](https://michigan-recruiting.vercel.app) |
| **API** | [club-applications (Heroku)](https://club-applications-d42c9d50a2b6.herokuapp.com/) |

---

## Project structure

```
Club_Recruit/
├── club_backend/          # Django API
│   ├── api/               # Models, views, serializers, URLs
│   ├── club_backend/      # Settings, WSGI, root URLs
│   ├── manage.py
│   ├── Procfile
│   └── requirements.txt
├── club_frontend/         # React (Vite) SPA
│   ├── src/
│   │   ├── pages/         # Route components
│   │   ├── components/
│   │   ├── apiClient.js   # Axios + JWT interceptors
│   │   └── AuthContext.jsx
│   ├── vercel.json
│   └── package.json
├── DEPLOY.md              # Heroku + Vercel deployment details
└── README.md
```

---

## Features

- **Auth:** Register (with club selection), login, JWT access + refresh tokens
- **Dashboard (authenticated):**
  - **Clubs** – one club per user (from profile)
  - **Applications** – list, create, edit title, delete; “Updated” reflects when questions change
  - **Questions** – add/delete questions per application (Short, Long, Multi-Select, File)
  - **Applicants** – list; per-application view with answers, ordering, delete applicant, download file answers
- **Apply flow (public):** Choose club → choose application → fill name/year → answer questions (text or file upload)
- **API:** REST with nested routes (e.g. `/api/club/{id}/application/{id}/question`), CORS and JWT configured for production and preview deployments

---

## Local development

### Prerequisites

- Python 3.10+
- Node.js 18+
- (Optional) PostgreSQL; otherwise SQLite is used if `DATABASE_URL` is unset

### Backend

```bash
cd club_backend
python -m venv venv
source venv/bin/activate   # or: venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Optional: create a `.env` or set env vars:

- `DATABASE_URL` – PostgreSQL URL (omit to use SQLite)
- `DJANGO_SECRET_KEY` – override default dev key
- `DEBUG` – e.g. `true`

Run migrations and server:

```bash
python manage.py migrate
python manage.py runserver
```

API: **http://127.0.0.1:8000/api/**

### Frontend

```bash
cd club_frontend
npm install
```

Optional: create `.env.local` so the app talks to your local API:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start dev server:

```bash
npm run dev
```

App: **http://localhost:5173**

---

## Deployment

See **[DEPLOY.md](DEPLOY.md)** for:

- Heroku: backend config vars (`DATABASE_URL`, `DJANGO_SECRET_KEY`, `DEBUG`)
- Vercel: root directory `club_frontend`, optional `VITE_API_URL`
- CORS and client-side routing notes

---

## License

Private / unlicensed unless otherwise specified.

---

## Next Steps

Higher level of security for club creation. Createing an admin user per club to approve new user sign ups associated with their club, and delete clubs tab in dashboard (meant for dev use). Complete taking files, buggy now and gets added to local database instead of Heroku. 

