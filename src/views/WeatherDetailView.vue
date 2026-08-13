<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, MapPin, Droplets, Wind, Gauge, Eye, ThermometerSun, CalendarDays } from '@lucide/vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { celsiusToFahrenheit, msToMph } from '@/utils/weatherMath'
import { resolveGradientClass, resolveParticleType } from '@/utils/weatherIconMap'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'
import WeatherParticles from '@/components/weather/WeatherParticles.vue'
import FavoriteToggle from '@/components/weather/FavoriteToggle.vue'
import DaylightBar from '@/components/weather/DaylightBar.vue'
import AirQualityCard from '@/components/weather/AirQualityCard.vue'
import DiscomfortCard from '@/components/weather/DiscomfortCard.vue'
import HourlyForecastChart from '@/components/weather/HourlyForecastChart.vue'
import DailyForecastChart from '@/components/weather/DailyForecastChart.vue'

const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()

watch(
  () => route.params.cityId,
  (id) => {
    if (id === 'me' && !weatherStore.entries.me) {
      router.replace('/')
      return
    }
    weatherStore.fetchDetail(id)
  },
  { immediate: true },
)

const entry = computed(() => weatherStore.entries[route.params.cityId])
const isLoading = computed(() => !entry.value?.current)
const isMe = computed(() => route.params.cityId === 'me')

const activeTab = ref('hourly')

const displayTemp = computed(() => {
  if (!entry.value?.current) return null
  const t = entry.value.current.temp
  return configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t
})
const displayFeelsLike = computed(() => {
  if (!entry.value?.current) return null
  const t = entry.value.current.feelsLike
  return configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t
})
const displayWind = computed(() => {
  if (!entry.value?.current) return null
  const w = entry.value.current.windSpeed
  return configStore.windSpeedUnit === 'mph' ? msToMph(w) : w
})
const toDisplay = (t) => (configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t)

const gradientClass = computed(() => resolveGradientClass(entry.value?.current?.iconCode))
const particleType = computed(() => resolveParticleType(entry.value?.current?.conditionMain))

const todayKey = new Date().toISOString().slice(0, 10)
function formatDay(dateStr) {
  if (dateStr === todayKey) return '오늘'
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('ko-KR', { weekday: 'short' })
}
function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="page detail-page">
    <button v-if="!isMe" class="btn-glass back-btn" @click="goBack"><ArrowLeft :size="16" />뒤로가기</button>

    <div v-if="!entry" class="empty-message text-muted">해당 도시 정보를 찾을 수 없습니다.</div>

    <template v-else>
      <div class="section-title"><CalendarDays :size="20" />예보</div>

      <section class="hero glass-card" :class="gradientClass">
        <WeatherParticles :type="particleType" />

        <div v-if="isLoading" class="hero-loading">
          <div class="skeleton" style="height: 20px; width: 140px; margin-bottom: 18px; background: rgba(255, 255, 255, 0.25)" />
          <div class="skeleton" style="height: 54px; width: 160px; margin-bottom: 14px; background: rgba(255, 255, 255, 0.25)" />
          <div class="skeleton" style="height: 16px; width: 220px; background: rgba(255, 255, 255, 0.25)" />
        </div>

        <template v-else>
          <div class="hero-top">
            <span class="location">
              <MapPin :size="16" />
              {{ entry.name }}
              <small>{{ entry.region }}</small>
            </span>
            <div class="hero-actions">
              <FavoriteToggle :city-id="entry.id" />
              <WeatherIcon :code="entry.current.iconCode" :size="54" class="icon-float" />
            </div>
          </div>

          <div class="hero-temp">{{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span></div>
          <p class="hero-desc">
            {{ entry.current.description }} · 체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }}
          </p>

          <div class="hero-stats">
            <span><ThermometerSun :size="14" /> 최고 {{ entry.current.tempMax }}° / 최저 {{ entry.current.tempMin }}°</span>
            <span><Droplets :size="14" /> 습도 {{ entry.current.humidity }}%</span>
            <span><Wind :size="14" /> 풍속 {{ displayWind }}{{ configStore.windSpeedSymbol }}</span>
            <span><Gauge :size="14" /> 기압 {{ entry.current.pressure }}hPa</span>
            <span><Eye :size="14" /> 가시거리 {{ (entry.current.visibility / 1000).toFixed(1) }}km</span>
          </div>
        </template>
      </section>

      <template v-if="entry.forecast">
        <section class="forecast-section glass-card">
          <div class="segmented">
            <button class="segmented-btn" :class="{ active: activeTab === 'hourly' }" @click="activeTab = 'hourly'">
              시간별
            </button>
            <button class="segmented-btn" :class="{ active: activeTab === 'daily' }" @click="activeTab = 'daily'">
              일별 (5일)
            </button>
          </div>

          <div v-if="activeTab === 'hourly'" class="tab-panel">
            <HourlyForecastChart :hourly="entry.forecast.hourly" />
            <div class="hourly-row hscroll">
              <div v-for="(h, idx) in entry.forecast.hourly" :key="h.time" class="hour-pill" :class="{ now: idx === 0 }">
                <span class="hour-label">{{ idx === 0 ? '지금' : new Date(h.time).toLocaleTimeString('ko-KR', { hour: 'numeric' }) }}</span>
                <WeatherIcon :code="h.iconCode" :size="24" />
                <strong class="hour-temp">{{ toDisplay(h.temp) }}°</strong>
                <span v-if="h.pop > 0" class="hour-pop">💧{{ h.pop }}%</span>
              </div>
            </div>
          </div>

          <div v-else class="tab-panel">
            <DailyForecastChart :daily="entry.forecast.daily" />
            <div class="daily-list">
              <button
                v-for="day in entry.forecast.daily"
                :key="day.date"
                class="list-row daily-row"
                :class="{ 'is-today': day.date === todayKey }"
              >
                <span class="day-label">
                  <strong>{{ formatDay(day.date) }}</strong>
                  <small class="text-muted">{{ formatDate(day.date) }}</small>
                </span>
                <WeatherIcon :code="day.iconCode" :size="26" />
                <span class="day-desc">
                  {{ day.description }}
                  <span v-if="day.pop > 0" class="pop-badge">💧{{ day.pop }}%</span>
                </span>
                <span class="day-temps">
                  <strong>{{ toDisplay(day.max) }}°</strong>
                  <span class="text-muted">{{ toDisplay(day.min) }}°</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </template>

      <section v-if="entry.current" class="widget-grid">
        <AirQualityCard v-if="entry.airQuality" :aqi="entry.airQuality.aqi" :components="entry.airQuality.components" />
        <DiscomfortCard :temp="entry.current.temp" :humidity="entry.current.humidity" />
        <DaylightBar :sunrise="entry.current.sunrise" :sunset="entry.current.sunset" />
      </section>

      <p v-if="entry.error" class="empty-message text-muted">{{ entry.error }}</p>
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.back-btn {
  align-self: flex-start;
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 26px 30px 24px;
  color: #fff;
  min-height: 200px;
}
.hero-loading {
  padding: 20px 0;
  position: relative;
  z-index: 2;
}
.hero-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 1rem;
}
.location small {
  font-weight: 400;
  opacity: 0.85;
  font-size: 0.75rem;
}
.hero-actions {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
}
.hero-temp {
  position: relative;
  z-index: 2;
  font-size: 3.6rem;
  font-weight: 800;
  line-height: 1;
  margin-top: 6px;
}
.hero-temp .unit {
  font-size: 1.7rem;
  font-weight: 600;
  opacity: 0.85;
}
.hero-desc {
  position: relative;
  z-index: 2;
  font-size: 0.95rem;
  opacity: 0.92;
  margin: 6px 0 16px;
}
.hero-stats {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 0.8rem;
  opacity: 0.95;
}
.hero-stats span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.forecast-section {
  padding: 24px 26px 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hourly-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.hour-pill {
  flex-shrink: 0;
  width: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
}
.hour-pill.now {
  background: linear-gradient(160deg, var(--color-primary), var(--sky-3));
  border-color: transparent;
  color: #fff;
}
.hour-label {
  font-size: 0.74rem;
  font-weight: 700;
  opacity: 0.85;
}
.hour-pop {
  font-size: 0.68rem;
  opacity: 0.85;
}

.daily-list {
  display: flex;
  flex-direction: column;
}
.daily-row {
  grid-template-columns: 84px 32px 1fr auto;
}
.daily-row.is-today {
  background: rgba(52, 120, 246, 0.07);
  border-radius: var(--radius-sm);
}
.day-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.day-label strong {
  font-size: 0.88rem;
}
.day-label small {
  font-size: 0.7rem;
}
.day-desc {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--color-text-muted);
}
.pop-badge {
  font-size: 0.72rem;
  color: #3d84f5;
  font-weight: 700;
}
.day-temps {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.95rem;
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.empty-message {
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 900px) {
  .widget-grid {
    grid-template-columns: 1fr;
  }
  .hero-temp {
    font-size: 2.8rem;
  }
  .daily-row {
    grid-template-columns: 64px 26px 1fr auto;
  }
}
</style>
