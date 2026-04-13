// --- DB row types (mirror Supabase schema) ---

export interface IngredientRow {
  id: string
  name: string
  quantity: number | null
  unit: string | null
  category: string | null
  expires_at: string | null  // ISO date string YYYY-MM-DD
  created_at: string
}

export interface RecipeRow {
  id: string
  title: string
  instructions: string | null  // newline-separated steps
  source: string | null
  created_at: string
}

export interface RecipeRequirement {
  recipe_id: string
  ingredient_name: string
  quantity: number | null
  unit: string | null
}

// --- App-level types ---

export type ItemStatus = 'good' | 'soon' | 'urgent'

export type InventoryItem = IngredientRow & {
  status: ItemStatus
}

export type Recipe = RecipeRow & {
  requirements: RecipeRequirement[]
}
