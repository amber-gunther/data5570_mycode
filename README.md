# FreshTrack

Django backend for kitchen inventory, expiry tracking, and saved recipes.

## Layout

- `backend/` - Django project (`config`) and app (`api`)
- `myvenv/` - local Python virtual environment (not committed)
- `requirements.txt` - pinned Python packages
- `render.yaml` - Render Blueprint (web service + Postgres)
- `FRESHTRACK.md` - product notes

## Local setup

```powershell
python -m venv myvenv
.\myvenv\Scripts\Activate.ps1
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 0.0.0.0:8000
```

If `myvenv` already exists, activate it and install from `requirements.txt` if needed.

Visit http://127.0.0.1:8000/ for the home page and http://127.0.0.1:8000/admin/ for Django admin.

## API

Django REST Framework endpoints (Part 3):

- http://127.0.0.1:8000/api/pantry/
- http://127.0.0.1:8000/api/recipes/
- http://127.0.0.1:8000/api/lifespans/
- http://127.0.0.1:8000/api/users/
- http://127.0.0.1:8000/api/health/

On Render, use the same paths on https://freshtrack-4k21.onrender.com/ (for example `/api/pantry/`).

`python manage.py seed_demo` creates the demo admin/test users plus a sample Milk pantry item and Scrambled eggs recipe.

## Deploy on Render

1. Push this repo to GitHub.
2. Open https://dashboard.render.com/blueprint/new?repo=https://github.com/amber-gunther/data5570_mycode
3. Apply the Blueprint. Render will create the web service and Postgres database.

Local development still uses SQLite. Render uses Postgres via `DATABASE_URL`.

## Accounts

Admin site: https://freshtrack-4k21.onrender.com/admin/

| Role | Username | Password |
| --- | --- | --- |
| Admin | amber-gunther | RenderRocks! |
| Test user | test_user | RenderRocks! |

These credentials are for class/demo use. Anyone with access to this GitHub repo can see them.
