<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('inventory.title') }}</ion-title>
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
        :placeholder="t('inventory.searchPlaceholder')"
        :debounce="200"
      />

      <!-- Fridge -->
      <ion-list-header>
        <ion-label>{{ t('inventory.fridge') }}</ion-label>
      </ion-list-header>
      <ion-list lines="full">
        <ion-item v-for="item in filteredFridge" :key="item.id">
          <ion-label>
            <h2>{{ item.name }}</h2>
            <p>{{ item.quantity }} {{ item.unit }} · {{ expiryLabel(item.expires_at) }}</p>
          </ion-label>
          <ion-badge slot="end" :class="`badge-${item.status}`">
            {{ statusLabel(item.status) }}
          </ion-badge>
        </ion-item>
        <ion-item v-if="filteredFridge.length === 0">
          <ion-label color="medium">{{ t('inventory.noFridge') }}</ion-label>
        </ion-item>
      </ion-list>

      <!-- Pantry -->
      <ion-list-header>
        <ion-label>{{ t('inventory.pantry') }}</ion-label>
      </ion-list-header>
      <ion-list lines="full">
        <ion-item v-for="item in filteredPantry" :key="item.id">
          <ion-label>
            <h2>{{ item.name }}</h2>
            <p>{{ item.quantity }} {{ item.unit }}</p>
          </ion-label>
          <ion-badge slot="end" class="badge-good">{{ statusLabel('good') }}</ion-badge>
        </ion-item>
        <ion-item v-if="filteredPantry.length === 0">
          <ion-label color="medium">{{ t('inventory.noPantry') }}</ion-label>
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
  IonSearchbar, IonButton, IonButtons, IonIcon,
  alertController,
} from '@ionic/vue'
import { addOutline } from 'ionicons/icons'
import { useInventoryStore } from '@/stores/inventory'
import type { ItemStatus } from '@/types'
import { useI18n } from 'vue-i18n'

const inventoryStore = useInventoryStore()
const searchQuery = ref('')
const { t } = useI18n()

const filteredFridge = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return inventoryStore.fridgeItems.filter(i => i.name.toLowerCase().includes(q))
})

const filteredPantry = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return inventoryStore.pantryItems.filter(i => i.name.toLowerCase().includes(q))
})

function statusLabel(status: ItemStatus) {
  return t(`inventory.status.${status}`)
}

function expiryLabel(expiresAt: string | null): string {
  if (!expiresAt) return t('inventory.expiry.noExpiry')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiresAt)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return t('inventory.expiry.expired')
  if (diffDays === 1) return t('inventory.expiry.tomorrow')
  return t('inventory.expiry.inDays', { days: diffDays })
}



async function openAddAlert() {
  const addItem = (data: Record<string, string>, category: 'fridge' | 'pantry') => {
    if (!data.name?.trim()) return false
    inventoryStore.addItem({
      id: crypto.randomUUID(),
      name: data.name.trim(),
      quantity: data.quantity ? Number(data.quantity) : null,
      unit: data.unit?.trim() || null,
      category,
      expires_at: data.expires_at || null,
      created_at: new Date().toISOString(),
    })
  }

  const alert = await alertController.create({
    header: t('inventory.addIngredient'),
    inputs: [
      { name: 'name', type: 'text', placeholder: t('inventory.name') },
      { name: 'quantity', type: 'number', placeholder: t('inventory.quantity') },
      { name: 'unit', type: 'text', placeholder: t('inventory.unit') },
      { name: 'expires_at', type: 'date', placeholder: t('inventory.expiryDate') },
    ],
    buttons: [
      { text: t('inventory.cancel'), role: 'cancel' },
      { text: t('inventory.addToFridge'), handler: (data) => addItem(data, 'fridge') },
      { text: t('inventory.addToPantry'), handler: (data) => addItem(data, 'pantry') },
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
