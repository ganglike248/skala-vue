<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useWeatherStore } from '@/stores/weatherStore'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import TipBanner from '@/components/exercise/TipBanner.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import StatusBar from '@/components/exercise/StatusBar.vue'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const weatherStore = useWeatherStore()

// 화면 진입 시 실시간 날씨 데이터 로드 (이미 불러온 상태면 재요청하지 않음)
onMounted(() => {
  weatherStore.ensureLoaded()
})

const searchQuery = ref('')
const defaultCityInfo = '카드를 클릭하거나 검색해 보세요.'
const selectedCityInfo = ref(defaultCityInfo)

// 상세정보 펼쳐짐 상태
const expandedId = ref(null)

// 즐겨찾기한 도시만 보기 (favoriteStore)
const showFavoritesOnly = ref(false)

// 검색어 + 즐겨찾기 여부에 따른 필터링된 리스트를 computed로 계산
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  let list = keyword
    ? weatherStore.weatherList.filter((item) => item.name.includes(keyword))
    : weatherStore.weatherList
  if (showFavoritesOnly.value) {
    list = list.filter((item) => favoriteStore.isFavorite(item.id))
  }
  return list
})

// 카드 클릭 시 하단 상태바 갱신 + 상세정보 패널 토글
const selectCity = (item) => {
  const isClosing = expandedId.value === item.id
  expandedId.value = isClosing ? null : item.id
  selectedCityInfo.value = isClosing ? defaultCityInfo : `${item.name}이(가) 선택되었습니다.`
}

// SearchBar에서 Enter 입력 시 검색 결과 건수를 상태바에 표기
const handleSearchEnter = () => {
  const count = filteredWeatherList.value.length
  selectedCityInfo.value = searchQuery.value
    ? `'${searchQuery.value}' 검색 결과: ${count}건`
    : '전체 도시가 표시 중입니다.'
}

// 상세보기 클릭 시 alert 대신 상세 페이지로 Programmatic Navigation
const goToDetail = (item) => {
  router.push('/weather/' + item.id)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <TipBanner />

    <BaseDashboardCard>
      <SearchBar
        :current-query="searchQuery"
        @update-query="(val) => (searchQuery = val)"
        @search-enter="handleSearchEnter"
      />
    </BaseDashboardCard>

    <StatusBar :message="selectedCityInfo" />

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>

      <!-- 즐겨찾기(favoriteStore)한 도시만 필터링 -->
      <label class="favorite-filter">
        <input style="width: 5%" type="checkbox" v-model="showFavoritesOnly" />
        ⭐ 즐겨찾기만 보기 ({{ favoriteStore.favoriteCount }})
      </label>

      <!-- 실시간 API 로딩/에러 상태 -->
      <p v-if="weatherStore.isLoading" class="empty-message">날씨 데이터를 불러오는 중...</p>
      <p v-else-if="weatherStore.error" class="empty-message">{{ weatherStore.error }}</p>

      <!-- 검색 결과가 없을 때 -->
      <p
        v-else-if="filteredWeatherList.length === 0"
        class="empty-message"
      >
        검색 결과가 없습니다.
      </p>

      <!-- 카드를 2열로 배치 (좁은 화면에서는 1열로 자동 축소) -->
      <div v-else class="card-grid">
        <WeatherCard
          v-for="item in filteredWeatherList"
          :key="item.id"
          :city-item="item"
          :is-expanded="expandedId === item.id"
          @select-card="selectCity"
          @click-detail="goToDetail"
        />
      </div>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
}

.empty-message {
  text-align: center;
  color: #e74c3c;
  padding: 10px 0;
}

.favorite-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 12px;
  cursor: pointer;
  justify-content: flex-end;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

@media (max-width: 560px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
