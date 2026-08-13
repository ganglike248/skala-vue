<script setup>
import { ref, computed, onMounted } from 'vue'
import { Building2, Star } from '@lucide/vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import SearchBox from '@/components/weather/SearchBox.vue'
import CityCard from '@/components/weather/CityCard.vue'

const weatherStore = useWeatherStore()
const favoriteStore = useFavoriteStore()

onMounted(() => {
  weatherStore.loadAllCurrent()
})

const showFavoritesOnly = ref(false)

const visibleCities = computed(() => {
  if (showFavoritesOnly.value) {
    return weatherStore.allCities.filter((city) => favoriteStore.isFavorite(city.id))
  }
  return weatherStore.allCities
})

const customIds = computed(() => new Set(weatherStore.customCities.map((c) => c.id)))

function isRemovable(cityId) {
  return customIds.value.has(cityId)
}

function handleRemove(cityId) {
  favoriteStore.favoriteIds = favoriteStore.favoriteIds.filter((id) => id !== cityId)
  weatherStore.removeCustomCity(cityId)
}
</script>

<template>
  <div class="page regions-page">
    <div class="section-title">
      <Building2 :size="20" />
      지역별 날씨
      <span class="count-badge">{{ weatherStore.allCities.length }}개 도시</span>
    </div>
    <p class="text-muted intro">6개 주요 도시를 기본으로 보여드려요. 검색해서 원하는 도시를 자유롭게 추가해보세요.</p>

    <SearchBox />

    <div class="filter-row">
      <button class="chip" :class="{ active: !showFavoritesOnly }" @click="showFavoritesOnly = false">전체</button>
      <button class="chip" :class="{ active: showFavoritesOnly }" @click="showFavoritesOnly = true">
        <Star :size="13" />
        즐겨찾기만 ({{ favoriteStore.favoriteCount }})
      </button>
    </div>

    <p v-if="visibleCities.length === 0" class="empty-message text-muted">
      즐겨찾기한 도시가 없어요. 카드의 별 아이콘을 눌러 추가해보세요.
    </p>

    <div v-else class="city-grid">
      <CityCard
        v-for="city in visibleCities"
        :key="city.id"
        :city="city"
        :removable="isRemovable(city.id)"
        @remove="handleRemove"
      />
    </div>
  </div>
</template>

<style scoped>
.regions-page {
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.count-badge {
  margin-left: 4px;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary);
  background: rgba(52, 120, 246, 0.1);
}
.intro {
  margin-top: -10px;
  font-size: 0.85rem;
}
.filter-row {
  display: flex;
  gap: 8px;
}
.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 18px;
}
.empty-message {
  text-align: center;
  padding: 40px 0;
}
</style>
