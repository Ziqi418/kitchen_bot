# Kitchen Bot — Project Setup

**Stack:** Ionic + Vue 3 + TypeScript + Capacitor + Supabase

---

## Prerequisites

```bash
node -v   # >= 18
npm -v    # >= 9
```

Install the Ionic CLI globally:

```bash
npm install -g @ionic/cli
```

---

## 1. Create the Ionic + Vue project

```bash
ionic start kitchen-bot tabs --type vue --capacitor
cd kitchen-bot
```

- `tabs` is the starter template (tab-based navigation, suits this app well)
- `--type vue` scaffolds a Vue 3 project
- `--capacitor` wires up Capacitor from the start

Verify it runs in the browser:

```bash
ionic serve
```

---

## 2. Add Capacitor platforms

```bash
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios          # macOS only; skip if on Linux/Windows
```

> You need Android Studio for Android, and Xcode (macOS) for iOS.

---

## 3. Set up Supabase

### 3a. Create a project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**, give it a name (e.g. `kitchen-bot`), pick a region close to you
3. Save the **database password** somewhere safe
4. Wait ~2 minutes for the project to provision

### 3b. Get your credentials

In your Supabase dashboard: **Project Settings → API**

Copy:
- `Project URL` (looks like `https://xxxx.supabase.co`)
- `anon public` key

### 3c. Install the Supabase JS client

```bash
npm install @supabase/supabase-js
```

### 3d. Configure the client

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Create `.env` at the project root:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Add `.env` to `.gitignore` (it should already be there, but double-check).

---

## 4. Create the database schema

In your Supabase dashboard, go to **SQL Editor** and run:

```sql
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity numeric,
  unit text,
  category text,
  expires_at date,
  created_at timestamptz default now()
);

create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  instructions text,
  source text,
  created_at timestamptz default now()
);

create table recipe_requirements (
  recipe_id uuid references recipes(id) on delete cascade,
  ingredient_name text not null,
  quantity numeric,
  unit text
);
```

Verify the tables appear in **Table Editor**.

---

## 5. Smoke test the Supabase connection

In `src/views/Tab1Page.vue` (or any page), add a quick test in `onMounted`:

```ts
import { supabase } from '@/lib/supabase'

onMounted(async () => {
  const { data, error } = await supabase.from('ingredients').select('*')
  console.log(data, error)
})
```

Run `ionic serve`, open the browser console — you should see `[] null` (empty array, no error).

Remove this test code once confirmed.

---

## 6. Install Pinia for state management

```bash
npm install pinia
```

Register it in `src/main.ts`:

```ts
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createPinia())
app.use(IonicVue)
app.use(router)
app.mount('#app')
```

---

## 7. (Optional) Add NativeWind or keep Ionic components

Ionic ships its own adaptive components (`ion-list`, `ion-card`, etc.) that automatically look native on iOS and Android. For a personal project, these are enough — no extra CSS framework needed.

If you prefer Tailwind:

```bash
npm install -D tailwindcss autoprefixer
npx tailwindcss init
```

Then configure `tailwind.config.js` to scan `./src/**/*.{vue,ts}`.

---

## 8. Sync and open in native IDE

After any code change you want to test natively:

```bash
ionic build
npx cap sync
npx cap open android   # opens Android Studio
npx cap open ios       # opens Xcode (macOS only)
```

For day-to-day development, `ionic serve` in the browser is faster — use the native IDE only to test device-specific behaviour.

---

## Project structure (after setup)

```
kitchen-bot/
├── src/
│   ├── lib/
│   │   └── supabase.ts       # Supabase client
│   ├── stores/               # Pinia stores (create this folder)
│   ├── views/                # Page components (Tab1, Tab2, Tab3)
│   ├── components/
│   └── main.ts
├── android/
├── ios/
├── .env                      # Supabase credentials (not committed)
└── capacitor.config.ts
```

---

## Next steps (after setup is done)

1. Build the ingredient list UI — display, add, delete items
2. Build the recipe suggestion feature — send current ingredients to Claude API, get recipe proposals
3. Generate a shopping list from missing ingredients
4. Add auth + `user_id` columns when you're ready for multi-device sync
