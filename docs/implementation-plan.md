# Kitchen Bot — Implementation Plan

## Context
The Paper design defines three screens for a kitchen app: Inventory (Tab 1), Recipe Recommendations (Tab 2), and Cooking Mode (Tab 3). The project already has a working Ionic 8 + Vue 3 + TypeScript scaffold with three placeholder tab pages, Pinia installed (but unused), and Supabase wired up. The goal is to implement the core UI with mock data first — no backend calls yet — so the app is usable end-to-end before adding persistence.

---

## Scope (MVP, mock data only)
- Tab 1: Inventory list (Fridge + Pantry sections, status badges, search bar)
- Tab 2: Recipe recommendations (urgency banner, filter chips, recipe cards, "Select" button)
- Tab 3: Cooking mode (step-by-step for selected recipes, "Next Step" CTA)
- Shared: correct tab bar icons/labels, green theme

---

## Files to Create / Modify

| File | Action | Purpose |
|---|---|---|
| `src/theme/variables.css` | Edit | Set `--ion-color-primary` to `#2E7D32` (green) |
| `src/types/index.ts` | Create | TypeScript interfaces |
| `src/data/mock.ts` | Create | Hardcoded sample inventory + recipes |
| `src/stores/inventory.ts` | Create | Pinia store for inventory items |
| `src/stores/recipes.ts` | Create | Pinia store for recipe list + selected recipes |
| `src/views/TabsPage.vue` | Edit | Update tab icons and labels |
| `src/views/Tab1Page.vue` | Rewrite | Inventory UI |
| `src/views/Tab2Page.vue` | Rewrite | Recipe recommendations UI |
| `src/views/Tab3Page.vue` | Rewrite | Cooking mode UI |

---

## Step-by-Step Plan

### Step 1 — Theme (`src/theme/variables.css`)
Set Ionic CSS variables so the primary green matches the design:
```css
--ion-color-primary: #2E7D32;
--ion-color-primary-shade: #256427;
--ion-color-primary-tint: #438F47;
```

### Step 2 — TypeScript types (`src/types/index.ts`)

DB row types mirror Supabase column names exactly (snake_case). App-level types extend them with computed fields.

```ts
// --- DB row types (mirror Supabase schema) ---

export interface IngredientRow {
  id: string               // uuid
  name: string
  quantity: number | null
  unit: string | null
  category: string | null
  expires_at: string | null  // ISO date string YYYY-MM-DD
  created_at: string
}

export interface RecipeRow {
  id: string               // uuid
  title: string
  instructions: string | null  // plain text, may be newline-separated steps
  source: string | null
  created_at: string
}

export interface RecipeRequirement {
  recipe_id: string
  ingredient_name: string  // matches IngredientRow.name (not id)
  quantity: number | null
  unit: string | null
}

// --- App-level types (DB rows + derived/computed fields) ---

export type ItemStatus = 'good' | 'soon' | 'urgent'  // derived from expires_at

export type InventoryItem = IngredientRow & {
  status: ItemStatus  // computed: urgent (<2d), soon (<5d), good (otherwise)
}

export type Recipe = RecipeRow & {
  requirements: RecipeRequirement[]  // joined from recipe_requirements
}
```

> Note: `instructions` is a free-text field. For the cooking mode step list, parse it by splitting on newlines. No structured steps in the DB.

### Step 3 — Mock data (`src/data/mock.ts`)
Populate with the same items shown in the Paper design:
- **Inventory**: Eggs, Whole Milk, Cheddar Cheese, Chicken Breast (fridge) + White Rice, Olive Oil (pantry)
- **Recipes**: Pan-Seared Chicken (5 steps), Cheesy Scrambled Eggs (3 steps), Chicken Fried Rice (4 steps)

Expiry dates set relative to today so statuses (good/soon/urgent) are always realistic.

### Step 4 — Pinia stores

**`src/stores/inventory.ts`**
- `state`: `items: InventoryItem[]` (seeded from mock data)
- `getters`: `fridgeItems`, `pantryItems`, `urgentItems`
- `actions`: `addItem(item)`, `removeItem(id)` — for future use

**`src/stores/recipes.ts`**
- `state`: `recipes: Recipe[]`, `selectedRecipeIds: string[]`, `currentStepIndex: Record<string, number>`
- `getters`: `selectedRecipes`, `recommendedRecipes(inventoryIds)` — filters recipes where all ingredients are in stock
- `actions`: `selectRecipe(id)`, `deselectRecipe(id)`, `nextStep(recipeId)`, `resetCooking()`

### Step 5 — TabsPage.vue (tab bar)
Replace placeholder ionicons with:
- Tab 1: `home-outline` / `home` (active) — label "Inventory"
- Tab 2: `time-outline` / `time` (active) — label "Recipes"
- Tab 3: `list-outline` / `list` (active) — label "Cook"

### Step 6 — Tab1Page.vue (Inventory)

Structure:
```
IonHeader > IonToolbar > "My Kitchen" title + IonButtons (add FAB)
IonContent
  IonSearchbar  (filters list by name)
  IonListHeader  "🧊 Fridge"
  IonList > IonItem (per fridge item)
    IonAvatar   emoji in colored circle
    IonLabel    name + quantity/expiry subtitle
    IonBadge    Good / Soon / Urgent  (color via CSS class)
  IonListHeader  "🫙 Pantry"
  IonList > IonItem (per pantry item)
```

Tap "+ add" → `IonAlert` with fields: name, quantity, category (select), expiry (optional). Calls `inventoryStore.addItem()`.

### Step 7 — Tab2Page.vue (Recipes)

Structure:
```
IonHeader > "What to Cook"
IonContent
  Filter chips row  (IonChip: All / Quick <30m / Use urgent / Vegetarian)
  Urgency banner  (shown only if urgentItems.length > 0)
  Recipe cards (IonCard per recipe)
    Card image area  — colored gradient + emoji
    IonCardContent  — name, subtitle, ingredient match, duration, difficulty
    "Cook this" / "Select" button  → selectRecipe(id) + navigate to Tab 3
```

`recommendedRecipes` getter from store drives the list. Active filter chip controls a local `ref<string>` that further filters.

### Step 8 — Tab3Page.vue (Cooking Mode)

Structure:
```
IonHeader > "Cooking Mode" + "X min total" chip
IonContent
  Recipe switcher (IonSegment, one segment per selected recipe)
  Current step card  (IonCard)
    Step number badge
    Instruction text
    Tip block (if step.tip exists)
    Timer chip (if step.durationMin exists)
  Step list  (IonList, read-only)
    Completed steps  — strikethrough + checkmark
    Active step  — bold + green
    Upcoming steps  — dimmed
  "Next Step" IonButton (full-width, calls nextStep(recipeId))
```

If no recipes are selected, show an empty state: "No recipes selected — go to Recipes tab to pick one."

---

## Verification

1. `pnpm dev` → open in browser, verify all 3 tabs render without errors
2. Tab 1: items appear in Fridge/Pantry sections; search filters by name; "Urgent" badge is red for Chicken Breast
3. Tab 2: recipe cards shown; tapping "Select" on a recipe navigates to Tab 3
4. Tab 3: active recipe step is highlighted; tapping "Next Step" advances to the next step; completing all steps shows a done state
5. Tab bar icons and labels match the design; primary green is applied throughout
