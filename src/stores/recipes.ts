import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Recipe } from '@/types'
import { mockRecipes, mockRecipeRequirements } from '@/data/mock'

const allRecipes: Recipe[] = mockRecipes.map(r => ({
  ...r,
  requirements: mockRecipeRequirements.filter(req => req.recipe_id === r.id),
}))

export const useRecipesStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>(allRecipes)
  const selectedRecipeIds = ref<string[]>([])
  const currentStepIndex = ref<Record<string, number>>({})

  const selectedRecipes = computed(() =>
    recipes.value.filter(r => selectedRecipeIds.value.includes(r.id))
  )

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

  function addRecipe(recipe: Recipe) {
    recipes.value.push(recipe)
  }

  function resetCooking() {
    selectedRecipeIds.value = []
    currentStepIndex.value = {}
  }

  return {
    recipes,
    selectedRecipeIds,
    currentStepIndex,
    selectedRecipes,
    recommendedRecipes,
    selectRecipe,
    deselectRecipe,
    nextStep,
    addRecipe,
    resetCooking,
  }
})
