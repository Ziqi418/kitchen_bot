import type { IngredientRow, RecipeRow, RecipeRequirement } from '@/types'

// Today: 2026-04-09
// urgent = expires within 2 days, soon = within 5 days, good = beyond 5 days

export const mockIngredients: IngredientRow[] = [
  {
    id: '1',
    name: 'Chicken Breast',
    quantity: 2,
    unit: 'pieces',
    category: 'fridge',
    expires_at: '2026-04-10',  // 1 day → urgent
    created_at: '2026-04-01',
  },
  {
    id: '2',
    name: 'Whole Milk',
    quantity: 1,
    unit: 'liter',
    category: 'fridge',
    expires_at: '2026-04-13',  // 4 days → soon
    created_at: '2026-04-05',
  },
  {
    id: '3',
    name: 'Eggs',
    quantity: 6,
    unit: 'pieces',
    category: 'fridge',
    expires_at: '2026-04-20',  // 11 days → good
    created_at: '2026-04-01',
  },
  {
    id: '4',
    name: 'Cheddar Cheese',
    quantity: 200,
    unit: 'g',
    category: 'fridge',
    expires_at: '2026-04-25',  // 16 days → good
    created_at: '2026-04-01',
  },
  {
    id: '5',
    name: 'White Rice',
    quantity: 500,
    unit: 'g',
    category: 'pantry',
    expires_at: null,
    created_at: '2026-03-01',
  },
  {
    id: '6',
    name: 'Olive Oil',
    quantity: 1,
    unit: 'bottle',
    category: 'pantry',
    expires_at: null,
    created_at: '2026-03-01',
  },
]

export const mockRecipeRequirements: RecipeRequirement[] = [
  // Pan-Seared Chicken
  { recipe_id: 'r1', ingredient_name: 'Chicken Breast', quantity: 2, unit: 'pieces' },
  { recipe_id: 'r1', ingredient_name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
  // Cheesy Scrambled Eggs
  { recipe_id: 'r2', ingredient_name: 'Eggs', quantity: 3, unit: 'pieces' },
  { recipe_id: 'r2', ingredient_name: 'Cheddar Cheese', quantity: 50, unit: 'g' },
  { recipe_id: 'r2', ingredient_name: 'Whole Milk', quantity: 2, unit: 'tbsp' },
  // Chicken Fried Rice
  { recipe_id: 'r3', ingredient_name: 'Chicken Breast', quantity: 1, unit: 'pieces' },
  { recipe_id: 'r3', ingredient_name: 'White Rice', quantity: 200, unit: 'g' },
  { recipe_id: 'r3', ingredient_name: 'Olive Oil', quantity: 1, unit: 'tbsp' },
  { recipe_id: 'r3', ingredient_name: 'Eggs', quantity: 2, unit: 'pieces' },
]

export const mockRecipes: RecipeRow[] = [
  {
    id: 'r1',
    title: 'Pan-Seared Chicken',
    instructions: [
      'Season chicken breasts with salt, pepper, and your favorite spices.',
      'Heat olive oil in a skillet over medium-high heat.',
      'Place chicken in the pan and sear for 6-7 minutes without moving.',
      'Flip and cook another 6-7 minutes until internal temp reaches 165°F.',
      'Rest for 5 minutes before slicing and serving.',
    ].join('\n'),
    source: null,
    created_at: '2026-04-01',
  },
  {
    id: 'r2',
    title: 'Cheesy Scrambled Eggs',
    instructions: [
      'Whisk eggs with a splash of milk and a pinch of salt.',
      'Melt butter in a non-stick pan over low heat, pour in egg mixture.',
      'Stir gently and continuously until just set, fold in cheddar cheese and serve.',
    ].join('\n'),
    source: null,
    created_at: '2026-04-01',
  },
  {
    id: 'r3',
    title: 'Chicken Fried Rice',
    instructions: [
      'Cook diced chicken in olive oil over medium-high heat until browned, set aside.',
      'Scramble eggs in the same pan, push to one side.',
      'Add cooked rice and stir-fry everything together for 3-4 minutes.',
      'Return chicken to pan, season with soy sauce and sesame oil, serve hot.',
    ].join('\n'),
    source: null,
    created_at: '2026-04-01',
  },
]
