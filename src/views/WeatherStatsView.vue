<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart3, Flame, Snowflake, Building2 } from '@lucide/vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { celsiusToFahrenheit } from '@/utils/weatherMath'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'

const router = useRouter()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()

onMounted(() => {
  weatherStore.loadAllCurrent()
})

const cities = computed(() => weatherStore.weatherList)
const displayTemp = (t) => (configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t)

const averageTemp = computed(() => {
  if (cities.value.length === 0) return 0
  const total = cities.value.reduce((sum, c) => sum + c.temp, 0)
  return Math.round((total / cities.value.length) * 10) / 10
})

const hottest = computed(() => {
  if (cities.value.length === 0) return null
  return cities.value.reduce((a, b) => (a.temp > b.temp ? a : b))
})
const coldest = computed(() => {
  if (cities.value.length === 0) return null
  return cities.value.reduce((a, b) => (a.temp < b.temp ? a : b))
})

const ranked = computed(() => [...cities.value].sort((a, b) => b.temp - a.temp))
const maxTemp = computed(() => (ranked.value.length ? ranked.value[0].temp : 1))

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
      </section>

      <section class="ranking glass-card">
        <div class="section-title">기온 랭킹</div>
        <button v-for="(city, index) in ranked" :key="city.id" class="rank-row" @click="goDetail(city.id)">
          <span class="rank-index text-muted">{{ index + 1 }}</span>
          <WeatherIcon :code="city.iconCode" :size="24" />
          <span class="rank-name">{{ city.name }}</span>
          <div class="rank-bar-track">
            <div class="rank-bar-fill" :style="{ width: `${(city.temp / maxTemp) * 100}%` }" />
          </div>
          <strong class="rank-temp">{{ displayTemp(city.temp) }}{{ configStore.unitSymbol }}</strong>
        </button>
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
  grid-template-columns: repeat(4, 1fr);
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

.ranking {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rank-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 6px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text);
  width: 100%;
  text-align: left;
}
.rank-row:hover {
  background: rgba(79, 124, 255, 0.08);
}
.rank-index {
  width: 18px;
  font-size: 0.78rem;
  text-align: center;
}
.rank-name {
  width: 60px;
  font-weight: 600;
  font-size: 0.88rem;
}
.rank-bar-track {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(127, 143, 164, 0.16);
  overflow: hidden;
}
.rank-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-2));
  transition: width 0.4s ease;
}
.rank-temp {
  width: 56px;
  text-align: right;
  font-size: 0.9rem;
}

.empty-message {
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 720px) {
  .stat-tiles {
    grid-template-columns: repeat(2, 1fr);
  }
  .rank-name {
    width: 44px;
    font-size: 0.8rem;
  }
}
</style>
