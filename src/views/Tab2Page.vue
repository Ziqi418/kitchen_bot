<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>What to Cook</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Urgency banner -->
      <div v-if="inventoryStore.urgentItems.length > 0" class="urgency-banner">
        <ion-icon :icon="warningOutline" />
        <span>
          Use soon: {{ inventoryStore.urgentItems.map(i => i.name).join(', ') }}
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
        <ion-card v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
          <div :class="`card-banner card-banner-${recipe.id}`">
            <span class="card-emoji">{{ recipeEmoji(recipe.title) }}</span>
          </div>
          <ion-card-content>
            <h2 class="recipe-title">{{ recipe.title }}</h2>
            <p class="recipe-meta">
              {{ recipe.requirements.length }} ingredients ·
              {{ stepCount(recipe) }} steps
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
            <ion-button
              expand="block"
              class="cook-btn"
              @click="selectAndCook(recipe.id)"
            >
              Cook this
            </ion-button>
          </ion-card-content>
        </ion-card>

        <div v-if="filteredRecipes.length === 0" class="empty-state">
          <ion-icon :icon="sadOutline" />
          <p>No recipes match the current filter.</p>
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
  IonCard, IonCardContent, IonChip, IonBadge, IonButton, IonIcon,
} from '@ionic/vue'
import { warningOutline, sadOutline } from 'ionicons/icons'
import { useInventoryStore } from '@/stores/inventory'
import { useRecipesStore } from '@/stores/recipes'
import type { Recipe } from '@/types'

const router = useRouter()
const inventoryStore = useInventoryStore()
const recipesStore = useRecipesStore()

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Use Urgent', value: 'urgent' },
  { label: 'Fewest Steps', value: 'quick' },
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

const RECIPE_EMOJIS: Record<string, string> = {
  'pan-seared chicken': '🍗',
  'cheesy scrambled eggs': '🍳',
  'chicken fried rice': '🍱',
}

function recipeEmoji(title: string): string {
  return RECIPE_EMOJIS[title.toLowerCase()] ?? '🥘'
}

function selectAndCook(id: string) {
  recipesStore.selectRecipe(id)
  router.push('/tabs/tab3')
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

.card-banner {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-banner-r1 { background: linear-gradient(135deg, #ff8a65, #e64a19); }
.card-banner-r2 { background: linear-gradient(135deg, #fff176, #f9a825); }
.card-banner-r3 { background: linear-gradient(135deg, #80cbc4, #00796b); }

.card-emoji {
  font-size: 3rem;
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
  margin-bottom: 14px;
}

.ingredient-tag {
  font-size: 0.75rem;
}

.cook-btn {
  --border-radius: 12px;
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
