<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin, ChevronRight, AlertTriangle, Droplets, Wind, ThermometerSun, Star } from '@lucide/vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { celsiusToFahrenheit, msToMph, buildAdvice } from '@/utils/weatherMath'
import { resolveGradientClass, resolveParticleType } from '@/utils/weatherIconMap'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'
import WeatherParticles from '@/components/weather/WeatherParticles.vue'
import DaylightBar from '@/components/weather/DaylightBar.vue'
import AirQualityCard from '@/components/weather/AirQualityCard.vue'
import DiscomfortCard from '@/components/weather/DiscomfortCard.vue'
import AdviceChips from '@/components/weather/AdviceChips.vue'

const router = useRouter()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()

const me = computed(() => weatherStore.entries.me)
const isLoading = computed(() => !me.value?.current)
const isFallback = computed(() => weatherStore.myLocationStatus === 'denied')

const displayTemp = computed(() => {
  if (!me.value?.current) return null
  const t = me.value.current.temp
  return configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t
})
const displayFeelsLike = computed(() => {
  if (!me.value?.current) return null
  const t = me.value.current.feelsLike
  return configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t
})
const displayWind = computed(() => {
  if (!me.value?.current) return null
  const w = me.value.current.windSpeed
  return configStore.windSpeedUnit === 'mph' ? msToMph(w) : w
})

const gradientClass = computed(() => resolveGradientClass(me.value?.current?.iconCode))
const particleType = computed(() => resolveParticleType(me.value?.current?.conditionMain))

const advice = computed(() => {
  if (!me.value?.current) return []
  return buildAdvice({
    temp: me.value.current.temp,
    windSpeed: me.value.current.windSpeed,
    description: me.value.current.description,
    aqi: me.value.airQuality?.aqi,
  })
})

const hourly = computed(() => me.value?.forecast?.hourly ?? [])
const hourlyTemp = (t) => (configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t)
const formatHour = (ms, idx) => (idx === 0 ? '지금' : new Date(ms).toLocaleTimeString('ko-KR', { hour: 'numeric' }))

// 즐겨찾기 미리보기 (현재 날씨가 이미 로드된 것만)
const favoriteCities = computed(() =>
  weatherStore.allCities.filter((c) => favoriteStore.isFavorite(c.id) && c.current).slice(0, 4),
)

function goDetail(id) {
  router.push(`/weather/${id}`)
}
</script>

<template>
  <div class="page home-page">
    <div class="dash-top">
      <!-- 히어로: 내 위치 기반 현재 날씨 -->
      <section class="hero glass-card" :class="gradientClass">
        <div class="hero-glow" />
        <WeatherParticles :type="particleType" />

        <div v-if="isLoading" class="hero-loading">
          <div class="skeleton" style="height: 20px; width: 140px; margin-bottom: 18px; background: rgba(255, 255, 255, 0.25)" />
          <div class="skeleton" style="height: 74px; width: 220px; margin-bottom: 14px; background: rgba(255, 255, 255, 0.25)" />
          <div class="skeleton" style="height: 16px; width: 260px; background: rgba(255, 255, 255, 0.25)" />
        </div>

        <template v-else>
          <p v-if="isFallback" class="location-banner">
            <AlertTriangle :size="14" />
            위치 권한이 없어 기본 지역을 표시했어요. 브라우저 위치 권한을 허용하면 내 지역 날씨를 볼 수 있어요.
          </p>

          <div class="hero-top">
            <span class="location">
              <MapPin :size="16" />
              {{ me.name }}
              <small>{{ me.region }}</small>
            </span>
            <WeatherIcon :code="me.current.iconCode" :size="72" class="icon-float" />
          </div>

          <div class="hero-body">
            <div class="hero-temp">{{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span></div>
            <p class="hero-desc">{{ me.current.description }} · 체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }}</p>

            <div class="hero-stats">
              <span><ThermometerSun :size="14" /> 최고 {{ me.current.tempMax }}° / 최저 {{ me.current.tempMin }}°</span>
              <span><Droplets :size="14" /> 습도 {{ me.current.humidity }}%</span>
              <span><Wind :size="14" /> 풍속 {{ displayWind }}{{ configStore.windSpeedSymbol }}</span>
            </div>

            <AdviceChips :tips="advice" />
          </div>
        </template>
      </section>

      <!-- 보조 위젯: 대기질/불쾌지수/일출일몰 -->
      <aside v-if="me?.current" class="widget-rail">
        <AirQualityCard v-if="me.airQuality" :aqi="me.airQuality.aqi" :components="me.airQuality.components" />
        <DiscomfortCard :temp="me.current.temp" :humidity="me.current.humidity" />
        <DaylightBar :sunrise="me.current.sunrise" :sunset="me.current.sunset" />
      </aside>
    </div>

    <!-- 오늘 시간별 기온 -->
    <section v-if="hourly.length" class="hourly-section glass-card">
      <div class="section-title">오늘 시간별 기온</div>
      <div class="hourly-row hscroll">
        <div v-for="(h, idx) in hourly" :key="h.time" class="hour-pill" :class="{ now: idx === 0 }">
          <span class="hour-label">{{ formatHour(h.time, idx) }}</span>
          <WeatherIcon :code="h.iconCode" :size="26" />
          <strong class="hour-temp">{{ hourlyTemp(h.temp) }}°</strong>
          <span v-if="h.pop > 0" class="hour-pop">💧{{ h.pop }}%</span>
        </div>
      </div>
    </section>

    <!-- 즐겨찾기 미리보기 -->
    <section v-if="favoriteCities.length > 0" class="favorites-preview">
      <div class="section-title"><Star :size="17" />즐겨찾는 도시</div>
      <div class="preview-row">
        <button
          v-for="city in favoriteCities"
          :key="city.id"
          class="preview-chip glass-card"
          @click="goDetail(city.id)"
        >
          <WeatherIcon :code="city.current.iconCode" :size="24" />
          <span class="preview-name">{{ city.name }}</span>
          <strong>{{ city.current.temp }}°</strong>
        </button>
      </div>
    </section>

    <!-- 다른 지역 CTA -->
    <div class="cta-row">
      <RouterLink to="/regions" class="regions-cta glass-card">
        <div>
          <p class="cta-title">다른 지역 날씨도 궁금하다면?</p>
          <p class="text-muted cta-sub">6개 주요 도시 + 원하는 도시를 검색해서 둘러보세요</p>
        </div>
        <ChevronRight :size="22" />
      </RouterLink>
      <RouterLink to="/map" class="regions-cta glass-card">
        <div>
          <p class="cta-title">지도로 한눈에 보기</p>
          <p class="text-muted cta-sub">전국 주요 도시의 날씨를 지도 위 핀으로 확인해보세요</p>
        </div>
        <ChevronRight :size="22" />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-top: 6px;
}

.dash-top {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr);
  gap: 22px;
  align-items: stretch;
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 34px 36px 32px;
  color: #fff;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.hero-glow {
  position: absolute;
  top: -120px;
  right: -80px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 70%);
  animation: glow-pulse 5s ease-in-out infinite;
  pointer-events: none;
}
.hero-loading {
  padding: 20px 0;
  position: relative;
  z-index: 2;
}

.location-banner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.22);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
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
  font-size: 1.05rem;
}
.location small {
  font-weight: 400;
  opacity: 0.85;
  font-size: 0.75rem;
}

.hero-body {
  position: relative;
  z-index: 2;
}
.hero-temp {
  font-size: 5.2rem;
  font-weight: 800;
  line-height: 1;
  margin-top: 10px;
  letter-spacing: -0.02em;
}
.hero-temp .unit {
  font-size: 2.3rem;
  font-weight: 600;
  opacity: 0.85;
}

.hero-desc {
  font-size: 1rem;
  opacity: 0.94;
  margin: 8px 0 22px;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-size: 0.85rem;
  opacity: 0.96;
  margin-bottom: 18px;
}
.hero-stats span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.widget-rail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.widget-rail > :deep(*) {
  flex: 1;
}

.hourly-section {
  padding: 22px 26px 24px;
}
.hourly-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.hour-pill {
  flex-shrink: 0;
  width: 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px;
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
}
.hour-pill.now {
  background: linear-gradient(160deg, var(--color-primary), var(--sky-3));
  border-color: transparent;
  color: #fff;
  box-shadow: var(--shadow-pop);
}
.hour-label {
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.85;
}
.hour-temp {
  font-size: 1.05rem;
}
.hour-pop {
  font-size: 0.68rem;
  opacity: 0.85;
}

.favorites-preview .preview-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.preview-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  transition: transform 0.15s ease;
}
.preview-chip:hover {
  transform: translateY(-3px);
}
.preview-chip strong {
  color: var(--color-primary);
}

.cta-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.regions-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 26px;
  cursor: pointer;
  text-decoration: none;
  color: var(--color-text);
  transition: transform 0.15s ease;
}
.regions-cta:hover {
  transform: translateY(-3px);
}
.cta-title {
  font-weight: 800;
  margin-bottom: 4px;
}
.cta-sub {
  font-size: 0.8rem;
}

@media (max-width: 1100px) {
  .dash-top {
    grid-template-columns: 1fr;
  }
  .widget-rail {
    flex-direction: row;
  }
  .widget-rail > :deep(*) {
    flex: 1;
  }
}

@media (max-width: 720px) {
  .widget-rail {
    flex-direction: column;
  }
  .hero-temp {
    font-size: 3.6rem;
  }
  .cta-row {
    grid-template-columns: 1fr;
  }
}
</style>
