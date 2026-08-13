<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, MapPin, Droplets, Wind, Gauge, Eye, ThermometerSun } from '@lucide/vue'
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

const gradientClass = computed(() => resolveGradientClass(entry.value?.current?.iconCode))
const particleType = computed(() => resolveParticleType(entry.value?.current?.conditionMain))

function goBack() {
  router.back()
}
</script>

<template>
  <div class="page detail-page">
    <button class="btn-glass back-btn" @click="goBack"><ArrowLeft :size="16" />뒤로가기</button>

    <div v-if="!entry" class="empty-message text-muted">해당 도시 정보를 찾을 수 없습니다.</div>

    <template v-else>
      <section class="hero glass-card" :class="gradientClass">
        <WeatherParticles :type="particleType" />

        <div v-if="isLoading" class="hero-loading">
          <div class="skeleton" style="height: 20px; width: 140px; margin-bottom: 18px" />
          <div class="skeleton" style="height: 64px; width: 180px; margin-bottom: 14px" />
          <div class="skeleton" style="height: 16px; width: 220px" />
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
              <WeatherIcon :code="entry.current.iconCode" :size="60" class="icon-float" />
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
        <section class="chart-grid">
          <div class="glass-card chart-card">
            <HourlyForecastChart :hourly="entry.forecast.hourly" />
          </div>
          <div class="glass-card chart-card">
            <DailyForecastChart :daily="entry.forecast.daily" />
          </div>
        </section>
      </template>

      <section v-if="entry.current" class="widget-grid">
        <DiscomfortCard :temp="entry.current.temp" :humidity="entry.current.humidity" />
        <AirQualityCard v-if="entry.airQuality" :aqi="entry.airQuality.aqi" :components="entry.airQuality.components" />
        <DaylightBar :sunrise="entry.current.sunrise" :sunset="entry.current.sunset" />
      </section>

      <p v-if="entry.error" class="empty-message text-muted">{{ entry.error }}</p>
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  padding-top: 24px;
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
  padding: 28px 30px 26px;
  color: #fff;
  min-height: 220px;
}
.hero-loading {
  padding: 20px 0;
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

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.chart-card {
  padding: 18px 20px;
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

@media (max-width: 800px) {
  .chart-grid,
  .widget-grid {
    grid-template-columns: 1fr;
  }
  .hero-temp {
    font-size: 2.8rem;
  }
}
</style>
