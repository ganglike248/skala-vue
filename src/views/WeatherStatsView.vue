<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart3, Flame, Snowflake, Building2, Droplets, Wind, ArrowUp, ArrowDown } from '@lucide/vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { celsiusToFahrenheit, msToMph } from '@/utils/weatherMath'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'

const router = useRouter()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()

onMounted(() => {
  weatherStore.loadAllCurrent()
})

const cities = computed(() => weatherStore.weatherList)
const displayTemp = (t) => (configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t)
const displayWind = (w) => (configStore.windSpeedUnit === 'mph' ? msToMph(w) : w)

const averageTemp = computed(() => {
  if (cities.value.length === 0) return 0
  const total = cities.value.reduce((sum, c) => sum + c.temp, 0)
  return Math.round((total / cities.value.length) * 10) / 10
})
const averageHumidity = computed(() => {
  if (cities.value.length === 0) return 0
  const total = cities.value.reduce((sum, c) => sum + c.humidity, 0)
  return Math.round(total / cities.value.length)
})

const hottest = computed(() => {
  if (cities.value.length === 0) return null
  return cities.value.reduce((a, b) => (a.temp > b.temp ? a : b))
})
const coldest = computed(() => {
  if (cities.value.length === 0) return null
  return cities.value.reduce((a, b) => (a.temp < b.temp ? a : b))
})
const windiest = computed(() => {
  if (cities.value.length === 0) return null
  return cities.value.reduce((a, b) => (a.windSpeed > b.windSpeed ? a : b))
})

// ---- 정렬 가능한 비교 테이블 (기온만 보여주던 가로 막대 대신, 체감/습도/풍속까지 한 번에 비교) ----
const SORT_COLUMNS = [
  { key: 'temp', label: '현재' },
  { key: 'feelsLike', label: '체감' },
  { key: 'humidity', label: '습도' },
  { key: 'windSpeed', label: '풍속' },
]
const sortKey = ref('temp')
const sortDir = ref('desc')

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

const sortedCities = computed(() => {
  const list = [...cities.value]
  list.sort((a, b) => {
    const diff = a[sortKey.value] - b[sortKey.value]
    return sortDir.value === 'desc' ? -diff : diff
  })
  return list
})

function goDetail(id) {
  router.push(`/weather/${id}`)
}
</script>

<template>
  <div class="page stats-page">
    <div class="section-title"><BarChart3 :size="20" />날씨 통계</div>

    <p v-if="cities.length === 0" class="empty-message text-muted">날씨 데이터를 불러오는 중...</p>

    <template v-else>
      <section class="stat-tiles">
        <div class="stat-tile glass-card">
          <Building2 :size="18" class="text-muted" />
          <span class="tile-label text-muted">등록된 도시 수</span>
          <strong class="tile-value">{{ cities.length }}개</strong>
        </div>
        <div class="stat-tile glass-card">
          <BarChart3 :size="18" class="text-muted" />
          <span class="tile-label text-muted">평균 기온</span>
          <strong class="tile-value">{{ displayTemp(averageTemp) }}{{ configStore.unitSymbol }}</strong>
        </div>
        <div class="stat-tile glass-card">
          <Droplets :size="18" class="text-muted" />
          <span class="tile-label text-muted">평균 습도</span>
          <strong class="tile-value">{{ averageHumidity }}%</strong>
        </div>
        <div class="stat-tile glass-card" @click="goDetail(hottest.id)">
          <Flame :size="18" style="color: #e74c3c" />
          <span class="tile-label text-muted">가장 더운 도시</span>
          <strong class="tile-value">{{ hottest.name }} {{ displayTemp(hottest.temp) }}°</strong>
        </div>
        <div class="stat-tile glass-card" @click="goDetail(coldest.id)">
          <Snowflake :size="18" style="color: #3498db" />
          <span class="tile-label text-muted">가장 추운 도시</span>
          <strong class="tile-value">{{ coldest.name }} {{ displayTemp(coldest.temp) }}°</strong>
        </div>
        <div class="stat-tile glass-card" @click="goDetail(windiest.id)">
          <Wind :size="18" style="color: #34c8e8" />
          <span class="tile-label text-muted">바람이 가장 강한 도시</span>
          <strong class="tile-value">{{ windiest.name }} {{ displayWind(windiest.windSpeed) }}{{ configStore.windSpeedSymbol }}</strong>
        </div>
      </section>

      <section class="comparison glass-card">
        <div class="section-title">도시별 비교</div>
        <p class="text-muted comparison-hint">열 제목을 눌러 정렬 기준을 바꿔보세요.</p>

        <div class="table-scroll">
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="col-rank">#</th>
                <th class="col-city">도시</th>
                <th class="col-weather">날씨</th>
                <th
                  v-for="col in SORT_COLUMNS"
                  :key="col.key"
                  class="sortable"
                  :class="{ active: sortKey === col.key }"
                  @click="toggleSort(col.key)"
                >
                  {{ col.label }}
                  <component :is="sortKey === col.key && sortDir === 'asc' ? ArrowUp : ArrowDown" :size="12" class="sort-icon" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(city, index) in sortedCities" :key="city.id" @click="goDetail(city.id)">
                <td class="col-rank text-muted">{{ index + 1 }}</td>
                <td class="col-city">{{ city.name }}</td>
                <td class="col-weather">
                  <WeatherIcon :code="city.iconCode" :size="20" />
                  <span class="text-muted">{{ city.description }}</span>
                </td>
                <td>{{ displayTemp(city.temp) }}{{ configStore.unitSymbol }}</td>
                <td>{{ displayTemp(city.feelsLike) }}{{ configStore.unitSymbol }}</td>
                <td>{{ city.humidity }}%</td>
                <td>{{ displayWind(city.windSpeed) }}{{ configStore.windSpeedSymbol }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.stats-page {
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.stat-tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.stat-tile {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.stat-tile:hover {
  transform: translateY(-3px);
}
.tile-label {
  font-size: 0.75rem;
}
.tile-value {
  font-size: 1.3rem;
}

.comparison {
  padding: 22px 24px 20px;
}
.comparison-hint {
  font-size: 0.8rem;
  margin: -8px 0 14px;
}

.table-scroll {
  overflow-x: auto;
}
.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}
.comparison-table th,
.comparison-table td {
  padding: 11px 12px;
  text-align: left;
  white-space: nowrap;
}
.comparison-table thead th {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  user-select: none;
}
.comparison-table th.sortable {
  cursor: pointer;
}
.comparison-table th.sortable:hover {
  color: var(--color-primary);
}
.comparison-table th.active {
  color: var(--color-primary);
}
.sort-icon {
  opacity: 0.6;
  vertical-align: -1px;
}
.comparison-table tbody tr {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.comparison-table tbody tr:hover {
  background: rgba(21, 145, 220, 0.07);
}
.comparison-table tbody td {
  border-bottom: 1px solid var(--color-border);
}
.comparison-table tbody tr:last-child td {
  border-bottom: none;
}
.col-rank {
  width: 30px;
  text-align: center;
}
.col-city {
  font-weight: 700;
}
.col-weather {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-message {
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 900px) {
  .stat-tiles {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .stat-tiles {
    grid-template-columns: 1fr;
  }
}
</style>
