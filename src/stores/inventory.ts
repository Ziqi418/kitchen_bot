import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { InventoryItem, IngredientRow, ItemStatus } from '@/types'
import { supabase } from '@/lib/supabase'

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
  const items = ref<InventoryItem[]>([])
  const loading = ref(false)

  const fridgeItems = computed(() => items.value.filter(i => i.category === 'fridge'))
  const pantryItems = computed(() => items.value.filter(i => i.category === 'pantry'))
  const urgentItems = computed(() => items.value.filter(i => i.status === 'urgent'))

  async function fetchItems() {
    loading.value = true
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('created_at')
    if (!error && data) {
      items.value = data.map(toInventoryItem)
    }
    loading.value = false
  }

  async function addItem(row: IngredientRow) {
    const { data, error } = await supabase
      .from('ingredients')
      .insert(row)
      .select()
      .single()
    if (!error && data) {
      items.value.push(toInventoryItem(data))
    }
  }

  async function removeItem(id: string) {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
    if (!error) {
      items.value = items.value.filter(i => i.id !== id)
    }
  }

  fetchItems()

  return { items, loading, fridgeItems, pantryItems, urgentItems, addItem, removeItem, fetchItems }
})
