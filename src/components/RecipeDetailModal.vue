<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ recipe.title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="dismiss()">
            <ion-icon slot="icon-only" :icon="closeOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <section class="section">
        <h3 class="section-heading">Ingredients</h3>
        <ion-list lines="none" class="ingredient-list">
          <ion-item v-for="req in recipe.requirements" :key="req.ingredient_name" class="ingredient-item">
            <ion-icon :icon="ellipseOutline" slot="start" class="bullet" />
            <ion-label>
              {{ req.ingredient_name }}
              <span v-if="req.quantity" class="quantity"> · {{ req.quantity }} {{ req.unit }}</span>
            </ion-label>
          </ion-item>
        </ion-list>
      </section>

      <section class="section">
        <h3 class="section-heading">Steps</h3>
        <div v-if="steps.length" class="steps-list">
          <div v-for="(step, i) in steps" :key="i" class="step-row">
            <span class="step-number">{{ i + 1 }}</span>
            <p class="step-text">{{ step }}</p>
          </div>
        </div>
        <p v-else class="no-steps">No steps available.</p>
      </section>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <div class="footer-inner">
          <ion-button expand="block" class="cook-btn" @click="cook()">
            Cook this Recipe
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
  modalController,
} from '@ionic/vue'
import { closeOutline, ellipseOutline } from 'ionicons/icons'
import type { Recipe } from '@/types'

const props = defineProps<{
  recipe: Recipe
  onCook: () => void
}>()

const steps = computed(() =>
  props.recipe.instructions
    ? props.recipe.instructions.split('\n').filter(s => s.trim())
    : []
)

function dismiss() {
  modalController.dismiss()
}

function cook() {
  modalController.dismiss()
  props.onCook()
}
</script>

<style scoped>
.section {
  margin-bottom: 28px;
}

.section-heading {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ion-color-medium);
  margin: 0 0 10px;
}

.ingredient-list {
  --background: transparent;
}

.ingredient-item {
  --padding-start: 4px;
  --inner-padding-end: 0;
  --background: transparent;
}

.bullet {
  font-size: 0.5rem;
  color: var(--ion-color-primary);
  margin-right: 12px;
}

.quantity {
  color: var(--ion-color-medium);
  font-size: 0.85rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-text {
  margin: 4px 0 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.no-steps {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.footer-inner {
  padding: 8px 16px 8px;
}

.cook-btn {
  --border-radius: 12px;
  margin: 0;
}
</style>
