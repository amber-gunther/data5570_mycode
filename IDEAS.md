# FreshTrack ideas (later)

Park features here so we do not keep building extras before the current slice is submitted.

**Shipped first pass (final project):** zero quantity marks `used_up` and hides the lot; each add is its own row with optional expiry; **I made this** deducts FIFO (soonest expiry first). Secrets live in `.env` / `EXPO_PUBLIC_API_URL`.

**Shipped parked slice:** empty pantry when the API is empty or down (no client-side milk/eggs/peas); add/edit/delete recipes in the app; Shop tab (selected recipes minus pantry); volume/weight/count conversion when units are in the same family; undo last cook; throw out vs remove; use-soon banner (past / 48h / this week); name matching that treats `egg` / `Eggs` / `dozen eggs` as the same food.

## Do next (foundation)

- Deploy the Expo app with EAS Hosting and submit that URL.
- Per-user login in Expo (POST currently assigns the first Django user).

## Parked ideas

- **Empty pantry on first launch** — First pass: no hardcoded pantry fallback; an empty or failed GET shows an empty kitchen.
- **Add / edit recipes in the app** — First pass: new/edit/delete screens POST/PUT/DELETE `/api/recipes/`.
- **Shopping list** — First pass: Shop tab; pick recipes; buy list is only short/missing lines; **I bought this** adds lots.
- **Unit conversion** — First pass: convert within volume, weight, or count families (cup ↔ gallon, oz ↔ lb, egg ↔ count). Mixed families still show Unit.
- **Undo after cooking** — First pass: **Undo last cook** restores the lots from the most recent **I made this**.
- **Throw out vs used up** — First pass: item details **Throw out** sets `thrown_out` and hides the row; hitting 0 still sets `used_up`.
- **Expiry / use-soon view** — First pass: pantry sorts by urgency and banners items in the next 5 days.
- **Better name matching** — First pass: ignore `dozen`/`fresh`, singularize, require the same tokens (`egg` = `Eggs`; `butter` ≠ `peanut butter`).
- **Login in Expo** — so pantry/recipes are per account, not a shared demo API.
- **Barcode / receipt intake** — product notes in `FRESHTRACK.md`; not for this homework slice.
- **Restock as separate lots (use oldest first)** — First pass in the app: each add is a new row with optional expiry; **I made this** uses soonest expiry first. Per-item − still edits the row you opened.
- **Zero inventory** — First pass: quantity ≤ 0 sets `used_up` on save; API and UI hide used_up / thrown_out lots.

## Inbox

Add new thoughts here (date + one line). Do not implement until the foundation list is done.

- 2026-10-19 — Restock / FIFO lots (second gallon of milk, different expiry, use old first). See parked list.
- 2026-11-09 — When a product reaches zero inventory, update pantry (used_up / hide / remove). See parked list.
- 2026-11-16 — Bought-on date on each pantry lot; Shop “I bought this” stamps today.
