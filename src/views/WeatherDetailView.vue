<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MapPin, Droplets, Wind, Gauge, Eye, ThermometerSun, CalendarDays } from '@lucide/vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { celsiusToFahrenheit, msToMph, formatHourLabel } from '@/utils/weatherMath'
import { resolveGradientClass, resolveParticleType, HERO_PHOTOS } from '@/utils/weatherIconMap'
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
const selectionStore = useSelectionStore()

watch(
  () => route.params.cityId,
  (id) => {
    if (id === 'me' && !weatherStore.entries.me) {
      router.replace('/')
      return
    }
    weatherStore.fetchDetail(id)
    // 이 도시를 봤다는 건 곧 '선택'한 것 -> 홈/지도/즐겨찾기도 같은 지역을 가리키게 동기화
    selectionStore.selectCity(id)
  },
  { immediate: true },
)

const entry = computed(() => weatherStore.entries[route.params.cityId])
const isLoading = computed(() => !entry.value?.current)

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

// 주의: OpenWeatherMap 현재 날씨 API의 temp_min/temp_max는 '오늘의 최고/최저'가 아니라
// 관측 지점 주변의 순간적인 온도 편차라서, 도시 데이터가 하나뿐이면 현재 기온과 항상 같게 나옴.
// 그래서 실제 오늘 최고/최저는 5일 예보 API를 오늘 날짜로 묶은 daily[0]에서 계산한 값을 씀
// (예보는 '지금 이후'만 있어서, 혹시 현재 기온이 그 범위를 벗어나면 현재 기온까지 포함해 보정)
const todayRange = computed(() => {
  if (!entry.value?.current) return null
  const today = entry.value.forecast?.daily?.[0]
  const current = entry.value.current.temp
  if (!today) return { min: entry.value.current.tempMin, max: entry.value.current.tempMax }
  return { min: Math.min(today.min, current), max: Math.max(today.max, current) }
})

const gradientClass = computed(() => resolveGradientClass(entry.value?.current?.iconCode))
const particleType = computed(() =>
  resolveParticleType(entry.value?.current?.iconCode, entry.value?.current?.conditionMain),
)
// 홈과 같은 사진을 이 히어로 카드 배경으로도 사용
const heroPhotoStyle = computed(() => {
  const photo = HERO_PHOTOS[gradientClass.value]
  return photo ? { '--hero-photo': `url(${photo})` } : {}
})
// '지금'을 포함해 10개만, 날짜가 바뀌는 지점은 두 줄(날짜/시간)로 표시
const hourly = computed(() => (entry.value?.forecast?.hourly ?? []).slice(0, 10))
const hourlyLabels = computed(() => hourly.value.map((_, idx) => formatHourLabel(hourly.value, idx)))

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

</script>

<template>
  <div class="page detail-page">
    <div v-if="!entry" class="empty-message text-muted">해당 도시 정보를 찾을 수 없습니다.</div>

    <template v-else>
      <div class="section-title"><CalendarDays :size="20" />예보</div>

      <section class="hero glass-card" :class="gradientClass">
        <div class="hero-photo" :style="heroPhotoStyle" />
        <div class="hero-overlay" />
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
            <span v-if="todayRange"><ThermometerSun :size="14" /> 최고 {{ toDisplay(todayRange.max) }}° / 최저 {{ toDisplay(todayRange.min) }}°</span>
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
            <HourlyForecastChart :hourly="hourly" />
            <p class="hourly-caption text-muted">3시간 간격 예보를 기반으로 1시간 단위로 추정한 값이에요</p>
            <div class="hourly-row">
              <div v-for="(h, idx) in hourly" :key="h.time" class="hour-pill" :class="{ now: idx === 0 }">
                <span class="hour-label">
                  <small v-if="hourlyLabels[idx].date">{{ hourlyLabels[idx].date }}</small>
                  <span>{{ hourlyLabels[idx].hour }}</span>
                </span>
                <WeatherIcon :code="h.iconCode" :size="24" />
                <strong class="hour-temp">{{ toDisplay(h.temp) }}°</strong>
                <span class="hour-pop">💧{{ h.pop }}%</span>
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
                  <span class="pop-badge">💧{{ day.pop }}%</span>
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
.hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: 26px 30px 24px;
  color: #fff;
  min-height: 200px;
}
/* weather-theme.css의 .weather-gradient-* 는 색상 배경만 쓰던 시절 것 - 이제 사진이 그 자리를
   대신하므로 여기서 배경을 없앰(살짝 비쳐서 테두리처럼 보이던 원인). 이 컴포넌트에선 그 클래스를
   오버레이 진하기(--overlay-*) 값을 고르는 용도로만 씀 */
.hero.weather-gradient-clear-day,
.hero.weather-gradient-clear-night,
.hero.weather-gradient-clouds,
.hero.weather-gradient-rain,
.hero.weather-gradient-thunder,
.hero.weather-gradient-snow,
.hero.weather-gradient-fog {
  background: none;
}
/* 오버레이 진하기는 홈(app-body)과 동일하게 날씨별로 다르게: 맑음은 거의 없고, 흐림/비/뇌우일수록 진해짐 */
.hero.weather-gradient-clear-day {
  --overlay-top: rgba(6, 12, 24, 0);
  --overlay-bottom: rgba(6, 12, 24, 0.2);
}
.hero.weather-gradient-clear-night {
  --overlay-top: rgba(6, 12, 24, 0.12);
  --overlay-bottom: rgba(6, 12, 24, 0.32);
}
.hero.weather-gradient-snow {
  --overlay-top: rgba(6, 12, 24, 0.14);
  --overlay-bottom: rgba(6, 12, 24, 0.32);
}
.hero.weather-gradient-fog {
  --overlay-top: rgba(6, 12, 24, 0.2);
  --overlay-bottom: rgba(6, 12, 24, 0.38);
}
.hero.weather-gradient-clouds {
  --overlay-top: rgba(6, 12, 24, 0.26);
  --overlay-bottom: rgba(6, 12, 24, 0.44);
}
.hero.weather-gradient-rain {
  --overlay-top: rgba(6, 12, 24, 0.34);
  --overlay-bottom: rgba(6, 12, 24, 0.52);
}
.hero.weather-gradient-thunder {
  --overlay-top: rgba(6, 12, 24, 0.4);
  --overlay-bottom: rgba(6, 12, 24, 0.58);
}
.hero-photo {
  position: absolute;
  inset: -20px;
  border-radius: inherit;
  background-image: var(--hero-photo, none);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -2;
  animation: ken-burns 28s ease-in-out infinite alternate;
  will-change: transform;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, var(--overlay-top, rgba(6, 12, 24, 0.32)) 0%, var(--overlay-bottom, rgba(6, 12, 24, 0.5)) 100%);
  z-index: -1;
  pointer-events: none;
}
@keyframes ken-burns {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.12) translate(-1.4%, -1%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero-photo {
    animation: none;
  }
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
.hourly-caption {
  font-size: 0.75rem;
  margin-top: -8px;
}

.hourly-row {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 8px;
}
.hour-pill {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 6px;
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
}
.hour-pill.now {
  border: 2px solid var(--color-primary);
}
.hour-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.3;
  font-size: 0.74rem;
  font-weight: 700;
  opacity: 0.85;
}
.hour-label small {
  font-size: 0.62rem;
  font-weight: 600;
}
.hour-pop {
  font-size: 0.66rem;
  opacity: 0.85;
}

@media (max-width: 900px) {
  .hourly-row {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    row-gap: 10px;
  }
}

.daily-list {
  display: flex;
  flex-direction: column;
}
.daily-row {
  grid-template-columns: 84px 32px 1fr auto;
}
.daily-row.is-today {
  background: rgba(118, 159, 205, 0.07);
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
  color: var(--color-primary);
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
