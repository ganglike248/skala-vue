<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import TipBanner from '@/components/exercise/TipBanner.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import StatusBar from '@/components/exercise/StatusBar.vue'

const router = useRouter()

// WeatherParent와 동일한 도시 데이터
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 24, status: '맑음', humidity: 55, dust: '보통' },
  { id: 'city_02', name: '수원', temp: 19, status: '비', humidity: 80, dust: '좋음' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 62, dust: '좋음' },
  { id: 'city_04', name: '제주', temp: 22, status: '구름', humidity: 70, dust: '보통' },
  { id: 'city_05', name: '대전', temp: 30, status: '맑음', humidity: 45, dust: '나쁨' },
  { id: 'city_06', name: '광주', temp: 27, status: '비', humidity: 75, dust: '보통' },
])

const searchQuery = ref('')
const defaultCityInfo = '카드를 클릭하거나 검색해 보세요.'
const selectedCityInfo = ref(defaultCityInfo)

// 상세정보 펼쳐짐 상태
const expandedId = ref(null)

// 검색어에 따른 필터링된 리스트를 computed로 계산
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return weatherList.value
  return weatherList.value.filter((item) => item.name.includes(keyword))
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

      <!-- 검색 결과가 없을 때 -->
      <p v-if="filteredWeatherList.length === 0" class="empty-message">검색 결과가 없습니다.</p>

      <!-- 카드를 2열로 배치 (좁은 화면에서는 1열로 자동 축소) -->
      <div class="card-grid">
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
