# FreshTrack ideas (later)

Park features here so we do not keep building Expo-only extras before the app is wired to Django + Postgres.

**Rule:** the next real work is backend as the source of truth. New product ideas go in the list below, not into the app, until that is done.

## Do next (foundation)

- Allow the Expo web app to call the live API (CORS on Django).
- Load pantry and recipes from the logged-in user's database, not only Redux / demo rows.
- Save add, remove, +/−, and **I made this** back to the API so a refresh does not lose the kitchen log.
- Decide when demo data belongs in `seed_demo` only, vs staying hardcoded in the app.

## Parked ideas

- **Empty pantry on first launch** — user adds everything; no client-side Milk/Eggs/peas.
- **Add / edit recipes in the app** — today that is Django admin only.
- **Shopping list** — recipes you pick, minus what you have, equals what to buy.
- **Unit conversion** — do not subtract `0.25 cup` from `1 gallon` until we convert honestly.
- **Undo after cooking** — short “used 2 eggs” with undo.
- **Throw out vs used up** — status is already on the model; the app does not expose it yet.
- **Expiry / use-soon view** — cook from what dies in 48 hours.
- **Better name matching** — `egg` vs `Eggs` vs `dozen eggs`.
- **Login in Expo** — so pantry/recipes are per account, not a shared demo API.
- **Barcode / receipt intake** — product notes in `FRESHTRACK.md`; not for this homework slice.
- **Restock as separate lots (use oldest first)** — Buying a second jug of milk while the first is still open should not smash both into one quantity. Each package needs its own row (or lot) with its own expiry. Cooking and − should deduct from the oldest/soonest-expiring lot first (FIFO). How we show that in the UI is still TBD (two Milk rows vs one name with a lot list).

## Inbox

Add new thoughts here (date + one line). Do not implement until the foundation list is done.

- 2026-10-19 — Restock / FIFO lots (second gallon of milk, different expiry, use old first). See parked list.
