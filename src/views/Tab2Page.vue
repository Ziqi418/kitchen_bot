<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('recipes.title') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddRecipeModal">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Urgency banner -->
      <div v-if="inventoryStore.urgentItems.length > 0" class="urgency-banner">
        <ion-icon :icon="warningOutline" />
        <span>
          {{ t('recipes.useSoon', { items: inventoryStore.urgentItems.map(i => i.name).join(', ') }) }}
        </span>
      </div>

      <!-- Filter chips -->
      <div class="filter-chips">
        <ion-chip
          v-for="f in filters"
          :key="f.value"
          :color="activeFilter === f.value ? 'primary' : 'medium'"
          :outline="activeFilter !== f.value"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </ion-chip>
      </div>

      <!-- Recipe cards -->
      <div class="cards-container">
        <ion-card v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card" @click="viewRecipe(recipe)">
          <ion-card-content>
            <h2 class="recipe-title">{{ recipe.title }}</h2>
            <p class="recipe-meta">
              {{ t('recipes.meta', { ingredients: recipe.requirements.length, steps: stepCount(recipe) }) }}
            </p>
            <div class="ingredient-tags">
              <ion-badge
                v-for="req in recipe.requirements"
                :key="req.ingredient_name"
                :color="isUrgent(req.ingredient_name) ? 'danger' : 'light'"
                class="ingredient-tag"
              >
                {{ req.ingredient_name }}
              </ion-badge>
            </div>
          </ion-card-content>
        </ion-card>

        <div v-if="filteredRecipes.length === 0" class="empty-state">
          <ion-icon :icon="sadOutline" />
          <p>{{ t('recipes.noRecipes') }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardContent, IonChip, IonBadge, IonButton, IonButtons, IonIcon,
  alertController, modalController,
} from '@ionic/vue'
import { warningOutline, sadOutline, addOutline } from 'ionicons/icons'
import { useInventoryStore } from '@/stores/inventory'
import { useRecipesStore } from '@/stores/recipes'
import type { Recipe, RecipeRequirement } from '@/types'
import { useI18n } from 'vue-i18n'
import RecipeDetailModal from '@/components/RecipeDetailModal.vue'

const router = useRouter()
const inventoryStore = useInventoryStore()
const recipesStore = useRecipesStore()
const { t } = useI18n()

const filters = [
  { label: t('recipes.filters.all'), value: 'all' },
  { label: t('recipes.filters.urgent'), value: 'urgent' },
  { label: t('recipes.filters.quick'), value: 'quick' },
]
const activeFilter = ref('all')

const inventoryNames = computed(() => inventoryStore.items.map(i => i.name))
const recommended = computed(() => recipesStore.recommendedRecipes(inventoryNames.value))

const filteredRecipes = computed(() => {
  let list = recommended.value
  if (activeFilter.value === 'urgent') {
    const urgentNames = new Set(inventoryStore.urgentItems.map(i => i.name.toLowerCase()))
    list = list.filter(r =>
      r.requirements.some(req => urgentNames.has(req.ingredient_name.toLowerCase()))
    )
  } else if (activeFilter.value === 'quick') {
    list = [...list].sort((a, b) => stepCount(a) - stepCount(b))
  }
  return list
})

function stepCount(recipe: Recipe): number {
  if (!recipe.instructions) return 0
  return recipe.instructions.split('\n').filter(s => s.trim()).length
}

function isUrgent(name: string): boolean {
  return inventoryStore.urgentItems.some(i => i.name.toLowerCase() === name.toLowerCase())
}



async function openAddRecipeModal() {
  // for now, use alert
  const alert = await alertController.create({
    header: 'Add Recipe',
    inputs: [
      { name: 'title', type: 'text', placeholder: 'Recipe Title' },
      { name: 'instructions', type: 'textarea', placeholder: 'Instructions (one step per line)' },
      { name: 'ingredients', type: 'textarea', placeholder: 'Ingredients (one per line: name, quantity unit)' },
      { name: 'source', type: 'url', placeholder: 'Source URL or leave blank' },
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Add',
        handler: (data) => {
          if (!data.title?.trim()) return false
          const requirements: RecipeRequirement[] = []
          if (data.ingredients) {
            data.ingredients.split('\n').forEach((line: string) => {
              const parts = line.split(',').map((s: string) => s.trim())
              if (parts.length >= 1) {
                requirements.push({
                  recipe_id: '', // will set later
                  ingredient_name: parts[0],
                  quantity: parts[1] ? parseFloat(parts[1]) : null,
                  unit: parts[2] || null,
                })
              }
            })
          }
          const id = crypto.randomUUID()
          requirements.forEach(req => req.recipe_id = id)
          recipesStore.addRecipe({
            id,
            title: data.title.trim(),
            instructions: data.instructions || null,
            source: data.source || null,
            created_at: new Date().toISOString(),
            requirements,
          })
        },
      },
    ],
  })
  await alert.present()
}

async function viewRecipe(recipe: Recipe) {
  const modal = await modalController.create({
    component: RecipeDetailModal,
    componentProps: {
      recipe,
      onCook: () => {
        recipesStore.selectRecipe(recipe.id)
        router.push('/tabs/tab3')
      },
    },
    presentingElement: document.querySelector('ion-router-outlet') ?? undefined,
  })
  await modal.present()
}
</script>

<style scoped>
.urgency-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fce4ec;
  color: #b71c1c;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
}

.filter-chips {
  display: flex;
  gap: 8px;
  padding: 12px 16px 4px;
  overflow-x: auto;
}

.cards-container {
  padding: 8px 16px 24px;
}

.recipe-card {
  margin: 12px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.recipe-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.recipe-meta {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 10px;
}

.ingredient-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ingredient-tag {
  font-size: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: #999;
}

.empty-state ion-icon {
  font-size: 3rem;
  display: block;
  margin: 0 auto 12px;
}
</style>
