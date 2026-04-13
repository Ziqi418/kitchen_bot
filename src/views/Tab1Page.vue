<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>My Kitchen</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddAlert">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-searchbar
        v-model="searchQuery"
        placeholder="Search ingredients..."
        :debounce="200"
      />

      <!-- Fridge -->
      <ion-list-header>
        <ion-label>🧊 Fridge</ion-label>
      </ion-list-header>
      <ion-list lines="full">
        <ion-item v-for="item in filteredFridge" :key="item.id">
          <ion-avatar slot="start" :class="`avatar-${item.status}`">
            <span>{{ itemEmoji(item.name) }}</span>
          </ion-avatar>
          <ion-label>
            <h2>{{ item.name }}</h2>
            <p>{{ item.quantity }} {{ item.unit }} · {{ expiryLabel(item.expires_at) }}</p>
          </ion-label>
          <ion-badge slot="end" :class="`badge-${item.status}`">
            {{ statusLabel(item.status) }}
          </ion-badge>
        </ion-item>
        <ion-item v-if="filteredFridge.length === 0">
          <ion-label color="medium">No fridge items match your search.</ion-label>
        </ion-item>
      </ion-list>

      <!-- Pantry -->
      <ion-list-header>
        <ion-label>🫙 Pantry</ion-label>
      </ion-list-header>
      <ion-list lines="full">
        <ion-item v-for="item in filteredPantry" :key="item.id">
          <ion-avatar slot="start" class="avatar-good">
            <span>{{ itemEmoji(item.name) }}</span>
          </ion-avatar>
          <ion-label>
            <h2>{{ item.name }}</h2>
            <p>{{ item.quantity }} {{ item.unit }}</p>
          </ion-label>
          <ion-badge slot="end" class="badge-good">Good</ion-badge>
        </ion-item>
        <ion-item v-if="filteredPantry.length === 0">
          <ion-label color="medium">No pantry items match your search.</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonListHeader, IonItem, IonLabel, IonBadge,
  IonAvatar, IonSearchbar, IonButton, IonButtons, IonIcon,
  alertController,
} from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { useInventoryStore } from '@/stores/inventory'
import type { ItemStatus } from '@/types'

const inventoryStore = useInventoryStore()
const searchQuery = ref('')

const filteredFridge = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return inventoryStore.fridgeItems.filter(i => i.name.toLowerCase().includes(q))
})

const filteredPantry = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return inventoryStore.pantryItems.filter(i => i.name.toLowerCase().includes(q))
})

function statusLabel(status: ItemStatus) {
  return status === 'urgent' ? 'Urgent' : status === 'soon' ? 'Soon' : 'Good'
}

function expiryLabel(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiry'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiresAt)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Expired'
  if (diffDays === 1) return 'Expires tomorrow'
  return `Expires in ${diffDays} days`
}

const EMOJIS: Record<string, string> = {
  'chicken breast': '🍗',
  'whole milk': '🥛',
  'eggs': '🥚',
  'cheddar cheese': '🧀',
  'white rice': '🍚',
  'olive oil': '🫒',
}

function itemEmoji(name: string): string {
  return EMOJIS[name.toLowerCase()] ?? '🥘'
}

async function openAddAlert() {
  const alert = await alertController.create({
    header: 'Add Ingredient',
    inputs: [
      { name: 'name', type: 'text', placeholder: 'Name' },
      { name: 'quantity', type: 'number', placeholder: 'Quantity' },
      { name: 'unit', type: 'text', placeholder: 'Unit (g, pieces, …)' },
      {
        name: 'category',
        type: 'radio',
        label: 'Fridge',
        value: 'fridge',
        checked: true,
      },
      {
        name: 'category',
        type: 'radio',
        label: 'Pantry',
        value: 'pantry',
      },
      { name: 'expires_at', type: 'date', placeholder: 'Expiry date (optional)' },
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Add',
        handler: (data) => {
          if (!data.name?.trim()) return false
          inventoryStore.addItem({
            id: crypto.randomUUID(),
            name: data.name.trim(),
            quantity: data.quantity ? Number(data.quantity) : null,
            unit: data.unit?.trim() || null,
            category: data.category ?? 'fridge',
            expires_at: data.expires_at || null,
            created_at: new Date().toISOString(),
          })
        },
      },
    ],
  })
  await alert.present()
}
</script>

<style scoped>
ion-list-header ion-label {
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 12px;
}

ion-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  border-radius: 50%;
}

ion-avatar span {
  line-height: 1;
}

.avatar-good  { background: #e8f5e9; }
.avatar-soon  { background: #fff8e1; }
.avatar-urgent { background: #fce4ec; }

ion-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
}

.badge-good   { --background: #2E7D32; --color: #fff; }
.badge-soon   { --background: #f57c00; --color: #fff; }
.badge-urgent { --background: #c62828; --color: #fff; }
</style>
