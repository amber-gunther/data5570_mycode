# FreshTrack

Kitchen inventory, expiry tracking, and saved recipes. The Expo app talks to **Supabase** (Postgres + API). `backend/` is the older Django/Render API and is not what the app uses anymore.

## Layout

- `freshtrack/` - Expo app (Create Expo Stack)
- `supabase/schema.sql` - tables, triggers, seed data (run once in the Supabase SQL editor)
- `backend/` - leftover Django project (not used by Expo)
- `myvenv/` - local Python virtual environment (not committed)
- `FRESHTRACK.md` - product notes
- `IDEAS.md` - later features

## Supabase (data + API)

1. Open https://supabase.com/dashboard/project/icmozzozwkmkcfanpmkf/sql/new
2. Paste `supabase/schema.sql` and click **Run**.
3. That creates `pantry`, `recipes`, and `recipe_ingredients`, plus a sample Milk lot and Scrambled eggs recipe.

Expo uses the project URL and publishable (anon) key. Copy `freshtrack/.env.example` to `freshtrack/.env` if you need to override them. Do not put the `service_role` key in the app.

## Frontend (Expo)

Requires Node.js LTS. From the repo root:

```powershell
cd freshtrack
copy .env.example .env
npm install
npm run web
```

That starts Metro and opens the app in the browser (http://localhost:8081). Press Ctrl+C in the terminal to stop it.

The app has bottom tabs plus detail screens:

- **Pantry** — lots sorted by expiry; use-soon banner; add a lot
- **Recipes** — saved recipes; add/edit/delete in the app
- **Shop** — pick recipes; buy list is only what you still need
- **Item details** — quantity, bought-on date, throw out vs remove, expiry
- **Recipe details** — Have/Need, **I made this**, undo last cook

`PantryList` / `PantryRow`, `RecipeList` / `RecipeRow`, and `RecipeForm` reuse the same building blocks. Redux thunks read and write Supabase tables (`pantry`, `recipes`, `recipe_ingredients`). Empty lots and thrown-out rows drop off the active list. Cooking uses FIFO and converts units in the same family (cup/gallon, oz/lb, egg/count).

The Expo app can run locally (`npm run web`) or on Expo Hosting:

https://freshtrack--0hsm2k6nc2.expo.app

That preview should be re-exported after this cutover so it talks to Supabase. After code changes, export and deploy again from `freshtrack`:

```powershell
npx.cmd expo export --platform web
npx.cmd eas-cli@latest deploy
```

The leftover Django admin (not used by Expo) is still at https://freshtrack-4k21.onrender.com/admin/ if you need the old data.
