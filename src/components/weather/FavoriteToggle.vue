<script setup>
import { Star } from '@lucide/vue'
import { useFavoriteStore } from '@/stores/favoriteStore'

const props = defineProps({
  cityId: { type: String, required: true },
})
const favoriteStore = useFavoriteStore()
</script>

<template>
  <button
    class="favorite-toggle"
    :class="{ active: favoriteStore.isFavorite(cityId) }"
    @click.stop="favoriteStore.toggleFavorite(cityId)"
    :aria-label="favoriteStore.isFavorite(cityId) ? '즐겨찾기 해제' : '즐겨찾기 추가'"
  >
    <Star :size="18" :fill="favoriteStore.isFavorite(cityId) ? 'currentColor' : 'none'" :stroke-width="1.8" />
  </button>
</template>

<style scoped>
.favorite-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    color 0.15s ease;
}
.favorite-toggle:hover {
  transform: scale(1.15);
}
.favorite-toggle.active {
  color: #f5a623;
}
</style>
