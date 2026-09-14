# FreshTrack

**Working title:** FreshTrack  
**Concept:** Kitchen inventory, expiry triage, and recipe shopping  
**Form factor:** Mobile-first kitchen inventory and meal-planning app  
**Job to be done:** Keep a living log of every ingredient you have, stop food from going to waste, and tell you exactly what to buy for the recipes you already saved.

---

## Why this exists

Most kitchen apps fail in one of two ways: they are tedious spreadsheets nobody maintains, or they are recipe browsers that ignore what is already in the house.

FreshTrack is both a **pantry log** and a **cook-from-what-you-own** system:

- Keep a running inventory of **all** ingredients (not only the ones about to spoil).
- Log groceries in seconds (scan, snap, or tap) so the log stays true.
- Forecast expiry so you know what must be used soon.
- Save **your** recipes in the same app, then compare them to the log.
- Get a store list of **only what you still need** for those recipes.

If logging is slower than throwing food away, the product has failed. If you still have to guess at the grocery store, the recipe side has failed.

---

## Product thesis

**The ingredient log is the source of truth.** Every expiry alert, meal suggestion, and shopping gap is computed from that log. Completeness matters here: staples, freezer bags, and half-used jars all count.

**Two jobs, same inventory.**

1. **Expiring groceries** — What must I cook, eat, or freeze in the next 48 hours?
2. **Recipe shopping** — For the meals I already saved, what am I missing and need to get from the store?

**Meals are the payoff.** Inventory is the engine. You come back either to rescue food that is dying, or to pull a saved recipe and walk into the store with a short, honest list.

**Storage state is part of time.** Fridge, freezer, pantry, and counter are not labels—they change how fast food expires.

---

## The two core pillars

These are equal. Neither is a side feature.

```
                    ┌─────────────────────────────────┐
                    │     Ingredient log (always on)  │
                    │  what you have, how much, where │
                    └──────────────┬──────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    │                    ▼
   Pillar A: Expiring groceries    │     Pillar B: Recipe shopping
   Use / freeze what dies soon     │     Saved recipes → store list
```

### Pillar A — Expiring groceries

Urgency-driven: Critical (≤ 48 hours), Soon (3–5 days), Stable (frozen or long shelf-life). Morning digest. “Use-it-first” ranking of **your saved recipes** that consume Critical items. Freeze-to-pause. Cooked deductions.

### Pillar B — What to get for my recipes

You pre-save recipes in FreshTrack (your household’s real meals, not a random internet dump). When you pick one recipe or a set for the week, the app diffs each ingredient against the log and produces a **buy list**: missing items and short quantities. What you already have stays off the list.

Both pillars read and write the same log. Buying for recipes restocks it. Cooking depletes it. Expiry tags are just a view on the same rows.

---

## The core loops

### Loop 1 — Keep the log honest (always)

```
[ Fast Intake ]                 [ Automated Tracking ]
Scan barcode / snap receipt --> Auto-calculate expiry
or tap manual quick-add         from USDA-style shelf life
                                + storage zone + quantity
```

### Loop 2 — Expiring groceries (Pillar A)

```
Log + dates --> Urgency tags --> Suggest saved recipes
                                 that use Critical items
                                 --> Cooked deducts from log
```

### Loop 3 — Recipe shopping (Pillar B)

```
Pick saved recipe(s) --> Diff vs ingredient log
                     --> Store list (need to get)
                     --> After shop, intake adds to log
                     --> Cooked deducts from log
```

---

## Ingredient log

This is the durable record of **everything currently in the kitchen**, not a temporary “about to expire” queue.

Each row should capture at least:

| Field | Purpose |
| --- | --- |
| Name / product | What it is (Open Food Facts metadata when scanned) |
| Quantity + unit | Enough to know if a recipe is covered |
| Storage zone | Pantry, Fridge, Freezer, Counter |
| Expiry | Estimated or printed use-by |
| Opened vs unopened | Switches shelf-life rules when known |
| Status | Active, frozen, used up, thrown out |

**Logging all ingredients** includes dry goods, spices you care to track, freezer inventory, and leftovers. A personal **staples list** (oil, salt, flour, etc.) can be marked “assume on hand unless I say otherwise,” so the log stays useful without forcing every salt canister to be scanned. Staples still appear on the store list if you uncheck them or mark them empty.

History: used-up and thrown-out items leave the *active* log but can remain in a simple history so waste and cooking patterns are visible later.

---

## Fast intake (feeds the log)

Log items with as little typing as possible:

| Method | When to use | What happens |
| --- | --- | --- |
| Continuous barcode scan | Packing groceries, checking the fridge | Camera stays on; each barcode adds a product using Open Food Facts metadata (name, brand, size, category). |
| Receipt OCR | Right after a store run | Photo of the receipt bulk-adds line items; user confirms mismatches. |
| Manual quick-add | Farmers market, leftovers, unlabeled produce | Short name + storage zone; expiry is inferred from category heuristics. |

Intake should feel like scanning at a checkout, not filling a form. After a **recipe shopping** trip, the same intake closes the loop: bought items land in the log so the next store list shrinks.

---

## Automated expiry forecasting (Pillar A)

**Preloaded shelf-life heuristics**

- Backed by datasets such as USDA FoodKeeper (and similar public guidance).
- Lookup key: food category + storage zone (+ opened vs unopened when known).
- Output: an estimated “use by” date, not a false sense of lab precision. Copy should say *typically lasts about…* unless the user entered a printed date.

**Smart state transitions**

| Action | System behavior |
| --- | --- |
| Item added to Fridge / Counter / Pantry | Start or continue a countdown from the heuristic (or printed date). |
| Item moved to **Freezer** | Pause the perishable countdown; mark as **frozen**; treat as Stable for urgency. |
| Item moved **out of Freezer** (thaw) | Resume a *thawed* heuristic (usually much shorter than original fridge life). |
| Package marked **opened** | Switch from unopened to opened shelf-life row when the dataset has both. |
| User edits date | Trust the printed / user date; keep the heuristic as a fallback if they clear it. |

Users should almost never have to type `MM/DD/YYYY` for bananas, milk, or a can of beans.

**Storage zones**

| Zone | Typical foods | Effect on expiry |
| --- | --- | --- |
| **Fridge** | Dairy, leftovers, produce, opened packages | Standard refrigerated countdown |
| **Freezer** | Meat, bread, leftovers you are parking | Countdown **pauses**; item marked frozen |
| **Pantry** | Dry goods, cans, oils, unopened shelf-stable | Long / stable shelf life |
| **Counter** | Fruit, bread, tomatoes, ripening produce | Often shorter than fridge; some items last *longer* on the counter |

Zone is chosen at intake with a one-tap default (inferred from category) that the user can change.

---

## Triage & urgency alerts (Pillar A)

**Visual urgency tags** (a view on the full log, not a separate database)

| Tag | Color | Rule | User meaning |
| --- | --- | --- | --- |
| **Critical** | Red | Expires in **≤ 48 hours** | Cook, eat, or freeze today / tomorrow |
| **Soon** | Yellow | Expires in **3–5 days** | Plan into the next few meals |
| **Stable** | Green | Frozen **or** long shelf-life | Ignore until it leaves that state |

Frozen items are Stable even if they *would* have been Critical in the fridge. That is the point of the freezer as a pause button.

**Daily morning push digest**

One notification, not a drip of per-item nags:

- What **must be used today** (Critical).
- What should be **moved to the freezer** if you will not cook it.
- Optional: which **saved recipe** covers the most Critical items.

Quiet hours / digest-only is the default. Individual item alerts are off unless the user opts in.

---

## Saved recipes (shared by both pillars)

Recipes live **in this app**, saved by you. They are the household’s playbook, not an infinite browse feed (a starter set is fine; the product is *your* list).

Each saved recipe includes:

- Title and optional notes / steps
- Ingredient lines: name, quantity, unit
- Servings / scale factor
- Optional tags (weeknight, batch, uses leftovers)

**Pillar A use:** rank *your* saved recipes by how many Critical (then Soon) log items they consume. Match score example:

> Uses **3 critical items**; missing **1 non-staple** (lime).

**Pillar B use:** you choose the recipe(s) you intend to cook. The app does not require them to be the expiry-optimal pick. You might cook lasagna because you want lasagna. The log still tells you what to buy.

**Cooked = inventory truth** (both pillars)

- User taps **Cooked** (or **Cooked, half batch**).
- App deducts recipe quantities from the active log.
- If deduction would go negative, clamp to zero and prompt “Did you finish this?”
- Partial use should be one tap, not a calculator.

---

## Recipe shopping list (Pillar B)

This is the second core payoff: **know what to get from the store for recipes you already saved.**

### Diff engine

For each selected recipe (or a planned set):

1. Expand ingredients × servings.
2. Match each line to the ingredient log (name / category / unit conversion where possible).
3. Classify every line:

| Result | Meaning | On the store list? |
| --- | --- | --- |
| **Have enough** | Log quantity covers the recipe | No |
| **Have some** | Partial coverage | Yes — buy the **shortfall** |
| **Missing** | Not in the log (and not an assumed staple) | Yes — buy the full amount |
| **Assumed staple** | On the household staples list and not marked empty | No |

4. Merge duplicates across multiple selected recipes (one line for onions, summed).

### Store list behavior

- Group by store section if easy (produce, dairy, pantry); otherwise a flat checklist is enough for v1.
- Checking off at the store is optional; **logging after the trip** (scan / receipt) is what restocks the ingredient log.
- If a Critical item would cover a recipe, the list can note “use the yogurt that expires tomorrow instead of buying more”—optional hint, not a blocker. You can still buy if you want.

**North-star for this pillar:** open a saved recipe (or several), see a short list of gaps, shop that list, come home, scan, cook.

---

## Primary screens (mobile-first)

1. **Today / Triage** — Pillar A: Critical and Soon, freezer suggestions, digest recap; shortcut into a saved recipe that uses them.
2. **Kitchen / Log** — Full ingredient log, grouped by zone; search; filters by urgency or “everything.”
3. **Add** — Camera (barcode), Receipt, Quick-add — the only way the log grows quickly.
4. **Recipes** — Your pre-saved recipes; open one or select several.
5. **Store list** — Pillar B: need-to-get for the selected recipe(s), generated from the log.
6. **Item detail** — Name, quantity, zone, date, freeze / opened / used-up.
7. **Recipe detail** — Ingredients, match vs log, Cooked, “Add missing to store list.”

Empty states: “Scan tonight’s groceries” for the log; “Save a recipe you actually cook” for Pillar B.

---

## Key user journeys

### After a grocery run (log)

1. Add → Receipt or continuous barcode while unpacking.
2. Confirm items and zones.
3. App assigns expiry; log is complete for that trip.
4. Today updates if anything is already short-dated.

### Morning (Pillar A)

1. Push digest: “2 items expire tomorrow. Your saved fried rice uses eggs, leftover rice, spinach.”
2. Cook that recipe, pick another saved recipe that still helps, or freeze the bread.

### Plan meals, then shop (Pillar B)

1. Open Recipes; select tacos, sheet-pan chicken, and overnight oats.
2. App diffs against the full log.
3. Store list: tortillas, cilantro, chicken thighs (short 1 lb)—not the rice, oil, or eggs you already have.
4. Shop; at home, intake those purchases into the log.
5. During the week, Cooked deducts as you go.

### After dinner

1. Tap **Cooked**.
2. Quantities drop; finished items leave the active log.
3. Leftovers quick-add as a Fridge item with a short leftover heuristic (often 3–4 days).

### Rescue instead of cooking

1. Critical item you will not eat in time.
2. Move to Freezer → urgency flips to Stable; countdown pauses. The item remains in the log for future recipes.

---

## Data & intelligence (v1)

| Source | Role |
| --- | --- |
| User ingredient log | Quantities, zones, dates, deductions — source of truth |
| User saved recipes | Household recipe book; input to expiry ranking **and** store-list diff |
| Open Food Facts | Barcode → product name, brand, size, category, image |
| USDA FoodKeeper (and similar) | Category + zone → typical days until expiry |

**v1 rules of thumb**

- Prefer category-level expiry over SKU-level perfection.
- Prefer “good enough date + easy freeze” over asking for every label.
- Recipe matching can be fuzzy on names (“scallion” / “green onion”) with a confirm if confidence is low.
- Staples list is editable (households differ: soy sauce, tortillas, etc.).
- Store list is a *diff*, not a second inventory. The log stays the only stock record.

---

## What this is not

- Not a calorie tracker or diet coach (unless added later).
- Not a full ERP for restaurants.
- Not a social network or infinite recipe discovery feed (saved recipes you chose).
- Not a weekly calendar that ignores what is about to spoil.
- Not two separate apps (expiry vs shopping) that drift out of sync.

---

## Success looks like

- The ingredient log is complete enough that both pillars are trustworthy.
- Logging a shopping trip takes **under a few minutes**.
- Users do not routinely type expiry dates.
- Today (expiry) and Store list (recipe gaps) are the two screens people actually open.
- Tapping Cooked is part of dinner cleanup.
- You rarely buy a third bottle of something you already have, and you rarely throw out food you forgot you bought.

**North-star questions**

- Pillar A: *What should we cook so the food we already bought does not go to waste?*
- Pillar B: *For the recipes I saved, what do I actually need to get from the store?*

---

## Open decisions (for later design / build)

- How recipes are added (manual form, URL import, photo of a card).
- Households / shared lists vs single-user first.
- Units and quantity UX (count vs weight) and unit conversion for the diff.
- How aggressive OCR confirmation should be vs auto-accept high-confidence lines.
- Whether “opened” is inferred (scan at purchase vs first Cooked on that item).
- Whether the store list can target more than one store.

These do not block the concept: the **ingredient log** plus **expiring groceries** plus **recipe shopping** is the product.
