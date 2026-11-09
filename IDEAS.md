# FreshTrack ideas (later)

Park features here so we do not keep building extras before the current slice is submitted.

**Shipped first pass (final project):** zero quantity marks `used_up` and hides the lot; each add is its own row with optional expiry; **I made this** deducts FIFO (soonest expiry first). Secrets live in `.env` / `EXPO_PUBLIC_API_URL`.

## Do next (foundation)

- Deploy the Expo app with EAS Hosting and submit that URL.
- Decide when demo data belongs in `seed_demo` only, vs staying hardcoded in the app.
- Per-user login in Expo (POST currently assigns the first Django user).

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
- **Restock as separate lots (use oldest first)** — First pass in the app: each add is a new row with optional expiry; **I made this** uses soonest expiry first. Per-item − still edits the row you opened.
- **Zero inventory** — First pass: quantity ≤ 0 sets `used_up` on save; API and UI hide used_up / thrown_out lots.

## Inbox

Add new thoughts here (date + one line). Do not implement until the foundation list is done.

- 2026-10-19 — Restock / FIFO lots (second gallon of milk, different expiry, use old first). See parked list.
- 2026-11-09 — When a product reaches zero inventory, update pantry (used_up / hide / remove). See parked list.
