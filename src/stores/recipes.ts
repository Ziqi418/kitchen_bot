import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Recipe, RecipeRequirement } from '@/types'
import { supabase } from '@/lib/supabase'

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)
  const selectedRecipeIds = ref<string[]>([])
  const currentStepIndex = ref<Record<string, number>>({})

  const selectedRecipes = computed(() =>
    recipes.value.filter(r => selectedRecipeIds.value.includes(r.id))
  )

  async function fetchRecipes() {
    loading.value = true
    const { data, error } = await supabase
      .from('recipes')
      .select('*, recipe_requirements(*)')
      .order('created_at')
    if (!error && data) {
      recipes.value = data.map(r => ({
        ...r,
        requirements: (r.recipe_requirements ?? []) as RecipeRequirement[],
      }))
    }
    loading.value = false
  }

  function recommendedRecipes(inventoryNames: string[]): Recipe[] {
    const nameSet = new Set(inventoryNames.map(n => n.toLowerCase()))
    return recipes.value.filter(r =>
      r.requirements.every(req => nameSet.has(req.ingredient_name.toLowerCase()))
    )
  }

  function selectRecipe(id: string) {
    if (!selectedRecipeIds.value.includes(id)) {
      selectedRecipeIds.value.push(id)
      currentStepIndex.value[id] = 0
    }
  }

  function deselectRecipe(id: string) {
    selectedRecipeIds.value = selectedRecipeIds.value.filter(rid => rid !== id)
    delete currentStepIndex.value[id]
  }

  function nextStep(recipeId: string) {
    const recipe = recipes.value.find(r => r.id === recipeId)
    if (!recipe || !recipe.instructions) return
    const steps = recipe.instructions.split('\n').filter(s => s.trim())
    const current = currentStepIndex.value[recipeId] ?? 0
    if (current < steps.length - 1) {
      currentStepIndex.value[recipeId] = current + 1
    }
  }

  async function addRecipe(recipe: Recipe) {
    const { requirements, ...recipeRow } = recipe
    const { error: recipeError } = await supabase
      .from('recipes')
      .insert(recipeRow)
    if (recipeError) return

    if (requirements.length > 0) {
      await supabase.from('recipe_requirements').insert(requirements)
    }

    recipes.value.push(recipe)
  }

  function resetCooking() {
    selectedRecipeIds.value = []
    currentStepIndex.value = {}
  }

  fetchRecipes()

  return {
    recipes,
    loading,
    selectedRecipeIds,
    currentStepIndex,
    selectedRecipes,
    recommendedRecipes,
    selectRecipe,
    deselectRecipe,
    nextStep,
    addRecipe,
    resetCooking,
    fetchRecipes,
  }
})
