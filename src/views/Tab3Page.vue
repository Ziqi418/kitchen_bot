<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Cooking Mode</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Empty state -->
      <div v-if="recipesStore.selectedRecipes.length === 0" class="empty-state">
        <ion-icon :icon="restaurantOutline" />
        <p>No recipes selected — go to <strong>Recipes</strong> tab to pick one.</p>
        <ion-button @click="router.push('/tabs/tab2')">Go to Recipes</ion-button>
      </div>

      <template v-else>
        <!-- Recipe switcher -->
        <ion-segment
          v-model="activeRecipeId"
          scrollable
          class="recipe-segment"
        >
          <ion-segment-button
            v-for="r in recipesStore.selectedRecipes"
            :key="r.id"
            :value="r.id"
          >
            <ion-label>{{ r.title }}</ion-label>
          </ion-segment-button>
        </ion-segment>

        <template v-if="activeRecipe">
          <!-- Current step card -->
          <ion-card class="step-card">
            <ion-card-content>
              <div class="step-header">
                <span class="step-badge">Step {{ currentIndex + 1 }} of {{ steps.length }}</span>
              </div>
              <p class="step-text">{{ steps[currentIndex] }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Step list -->
          <ion-list lines="none" class="step-list">
            <ion-item
              v-for="(step, idx) in steps"
              :key="idx"
              :class="stepClass(idx)"
            >
              <ion-icon
                slot="start"
                :icon="idx < currentIndex ? checkmarkCircle : idx === currentIndex ? playCircle : ellipseOutline"
                :color="idx < currentIndex ? 'success' : idx === currentIndex ? 'primary' : 'medium'"
              />
              <ion-label :class="{ 'step-done': idx < currentIndex, 'step-active': idx === currentIndex }">
                {{ step }}
              </ion-label>
            </ion-item>
          </ion-list>

          <!-- Done state -->
          <div v-if="currentIndex >= steps.length - 1 && steps.length > 0" class="done-banner">
            🎉 All steps complete! Enjoy your meal.
          </div>

          <!-- Next step button -->
          <div class="cta-area">
            <ion-button
              v-if="currentIndex < steps.length - 1"
              expand="block"
              size="large"
              class="next-btn"
              @click="recipesStore.nextStep(activeRecipeId)"
            >
              Next Step
              <ion-icon slot="end" :icon="arrowForwardOutline" />
            </ion-button>
            <ion-button
              v-else
              expand="block"
              size="large"
              fill="outline"
              color="danger"
              class="next-btn"
              @click="recipesStore.deselectRecipe(activeRecipeId)"
            >
              Remove Recipe
            </ion-button>
          </div>
        </template>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardContent, IonList, IonItem, IonLabel,
  IonSegment, IonSegmentButton, IonButton, IonIcon,
} from '@ionic/vue'
import {
  restaurantOutline, checkmarkCircle, playCircle,
  ellipseOutline, arrowForwardOutline,
} from 'ionicons/icons'
import { useRecipesStore } from '@/stores/recipes'

const router = useRouter()
const recipesStore = useRecipesStore()

const activeRecipeId = ref(recipesStore.selectedRecipes[0]?.id ?? '')

watch(() => recipesStore.selectedRecipes, (list) => {
  if (!list.find(r => r.id === activeRecipeId.value)) {
    activeRecipeId.value = list[0]?.id ?? ''
  }
}, { immediate: true })

const activeRecipe = computed(() =>
  recipesStore.selectedRecipes.find(r => r.id === activeRecipeId.value) ?? null
)

const steps = computed(() => {
  if (!activeRecipe.value?.instructions) return []
  return activeRecipe.value.instructions.split('\n').filter(s => s.trim())
})

const currentIndex = computed(() =>
  recipesStore.currentStepIndex[activeRecipeId.value] ?? 0
)

function stepClass(idx: number) {
  if (idx < currentIndex.value) return 'step-item-done'
  if (idx === currentIndex.value) return 'step-item-active'
  return 'step-item-upcoming'
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: #888;
}

.empty-state ion-icon {
  font-size: 4rem;
  display: block;
  margin: 0 auto 16px;
  color: #2E7D32;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 1rem;
  line-height: 1.5;
}

.recipe-segment {
  padding: 12px 16px 4px;
}

.step-card {
  margin: 12px 16px;
  border-radius: 16px;
  border-left: 4px solid #2E7D32;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.step-header {
  margin-bottom: 10px;
}

.step-badge {
  background: #e8f5e9;
  color: #2E7D32;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.step-text {
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0;
}

.step-list {
  padding: 0 8px;
}

.step-item-done ion-label {
  text-decoration: line-through;
  color: #aaa;
}

.step-item-active ion-label {
  font-weight: 700;
  color: #2E7D32;
}

.step-item-upcoming ion-label {
  color: #bbb;
}

.step-done {
  text-decoration: line-through;
  color: #aaa;
}

.step-active {
  font-weight: 700;
  color: #2E7D32;
}

.done-banner {
  text-align: center;
  background: #e8f5e9;
  color: #2E7D32;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 16px;
  margin: 12px 16px;
  border-radius: 12px;
}

.cta-area {
  padding: 16px;
}

.next-btn {
  --border-radius: 14px;
}
</style>
