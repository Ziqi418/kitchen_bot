import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { InventoryItem, IngredientRow, ItemStatus } from '@/types'
import { mockIngredients } from '@/data/mock'

function computeStatus(expiresAt: string | null): ItemStatus {
  if (!expiresAt) return 'good'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiresAt)
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 2) return 'urgent'
  if (diffDays < 5) return 'soon'
  return 'good'
}

function toInventoryItem(row: IngredientRow): InventoryItem {
  return { ...row, status: computeStatus(row.expires_at) }
}

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>(mockIngredients.map(toInventoryItem))

  const fridgeItems = computed(() => items.value.filter(i => i.category === 'fridge'))
  const pantryItems = computed(() => items.value.filter(i => i.category === 'pantry'))
  const urgentItems = computed(() => items.value.filter(i => i.status === 'urgent'))

  function addItem(row: IngredientRow) {
    items.value.push(toInventoryItem(row))
  }

  function removeItem(id: string) {
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, fridgeItems, pantryItems, urgentItems, addItem, removeItem }
})
