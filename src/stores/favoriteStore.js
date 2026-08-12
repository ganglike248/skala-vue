import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 본인 추가 Store: 즐겨찾는 도시를 관리하는 스토어
export const useFavoriteStore = defineStore('favorite', () => {
  // state: 즐겨찾기한 도시 id 목록
  const favoriteIds = ref([])

  // getters: 즐겨찾기 개수, 특정 도시가 즐겨찾기인지 확인하는 함수
  const favoriteCount = computed(() => favoriteIds.value.length)
  const isFavorite = computed(() => (cityId) => favoriteIds.value.includes(cityId))

  // actions: 즐겨찾기 토글
  function toggleFavorite(cityId) {
    const index = favoriteIds.value.indexOf(cityId)
    if (index === -1) {
      favoriteIds.value.push(cityId)
    } else {
      favoriteIds.value.splice(index, 1)
    }
  }

  return {
    favoriteIds,
    favoriteCount,
    isFavorite,
    toggleFavorite,
  }
})
