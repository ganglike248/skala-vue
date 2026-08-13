<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGeolocation } from '@vueuse/core'
import { MapPin, LocateFixed, ChevronRight, AlertTriangle, Droplets, Wind, ThermometerSun } from '@lucide/vue'
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

const { coords, error: geoError } = useGeolocation({ enableHighAccuracy: false })
let fallbackTimer = null

watch(
  () => [coords.value.latitude, coords.value.longitude],
  ([lat, lon]) => {
    if (lat !== Infinity && lon !== Infinity && weatherStore.myLocationStatus === 'idle') {
      clearTimeout(fallbackTimer)
      weatherStore.fetchMyLocation(lat, lon)
    }
  },
  { immediate: true },
)

watch(geoError, (err) => {
  if (err && weatherStore.myLocationStatus === 'idle') {
    weatherStore.fetchFallbackLocation()
  }
})

onMounted(() => {
  // geolocation 권한 팝업을 무시하거나 응답이 지연되는 경우를 대비한 안전장치
  fallbackTimer = setTimeout(() => {
    if (weatherStore.myLocationStatus === 'idle') {
      weatherStore.fetchFallbackLocation()
    }
  }, 6000)

  // 즐겨찾기 미리보기용으로 전체 도시 현재 날씨도 백그라운드에서 로드
  weatherStore.loadAllCurrent()
})

onUnmounted(() => clearTimeout(fallbackTimer))

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

// 즐겨찾기 미리보기 (현재 날씨가 이미 로드된 것만)
const favoriteCities = computed(() =>
  weatherStore.allCities.filter((c) => favoriteStore.isFavorite(c.id) && c.current).slice(0, 4),
)

function retryLocation() {
  weatherStore.resetMyLocation()
  const { latitude, longitude } = coords.value
  if (latitude !== Infinity && longitude !== Infinity) {
    weatherStore.fetchMyLocation(latitude, longitude)
  }
}
</script>

<template>
  <div class="page home-page">
    <!-- 히어로: 내 위치 기반 현재 날씨 -->
    <section class="hero glass-card" :class="gradientClass">
      <WeatherParticles :type="particleType" />

      <div v-if="isLoading" class="hero-loading">
        <div class="skeleton" style="height: 20px; width: 140px; margin-bottom: 18px" />
        <div class="skeleton" style="height: 64px; width: 180px; margin-bottom: 14px" />
        <div class="skeleton" style="height: 16px; width: 220px" />
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
          <WeatherIcon :code="me.current.iconCode" :size="64" class="icon-float" />
        </div>

        <div
          class="hero-temp"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
        >
          {{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span>
        </div>
        <p class="hero-desc">{{ me.current.description }} · 체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }}</p>

        <div class="hero-stats">
          <span><ThermometerSun :size="14" /> 최고 {{ me.current.tempMax }}° / 최저 {{ me.current.tempMin }}°</span>
          <span><Droplets :size="14" /> 습도 {{ me.current.humidity }}%</span>
          <span><Wind :size="14" /> 풍속 {{ displayWind }}{{ configStore.windSpeedSymbol }}</span>
        </div>

        <AdviceChips :tips="advice" />
      </template>
    </section>

    <!-- 보조 위젯 -->
    <section v-if="me?.current" class="widget-grid">
      <DiscomfortCard :temp="me.current.temp" :humidity="me.current.humidity" />
      <AirQualityCard v-if="me.airQuality" :aqi="me.airQuality.aqi" :components="me.airQuality.components" />
      <DaylightBar :sunrise="me.current.sunrise" :sunset="me.current.sunset" />
    </section>

    <!-- 즐겨찾기 미리보기 -->
    <section v-if="favoriteCities.length > 0" class="favorites-preview">
      <div class="section-title">⭐ 즐겨찾는 도시</div>
      <div class="preview-row">
        <button
          v-for="city in favoriteCities"
          :key="city.id"
          class="preview-chip glass-card"
          @click="router.push(`/weather/${city.id}`)"
        >
          <WeatherIconComponent :code="city.iconCode" :size="20" />
          <span>{{ city.name }}</span>
          <strong>{{ city.temp }}°</strong>
        </button>
      </div>
    </section>

    <!-- 다른 지역 CTA -->
    <RouterLink to="/regions" class="regions-cta glass-card">
      <div>
        <p class="cta-title">다른 지역 날씨도 궁금하다면?</p>
        <p class="text-muted cta-sub">6개 주요 도시 + 원하는 도시를 검색해서 둘러보세요</p>
      </div>
      <ChevronRight :size="22" />
    </RouterLink>

    <button v-if="isFallback" class="btn-glass retry-btn" @click="retryLocation">
      <LocateFixed :size="16" />
      내 위치 다시 가져오기
    </button>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 28px;
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 28px 30px 26px;
  color: #fff;
  min-height: 260px;
}
.hero-loading {
  padding: 20px 0;
}

.location-banner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
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

.hero-temp {
  position: relative;
  z-index: 2;
  font-size: 4.2rem;
  font-weight: 800;
  line-height: 1;
  margin-top: 6px;
}
.hero-temp .unit {
  font-size: 2rem;
  font-weight: 600;
  opacity: 0.85;
}

.hero-desc {
  position: relative;
  z-index: 2;
  font-size: 0.95rem;
  opacity: 0.92;
  margin: 6px 0 18px;
}

.hero-stats {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.82rem;
  opacity: 0.95;
  margin-bottom: 16px;
}
.hero-stats span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.favorites-preview .preview-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.preview-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  cursor: pointer;
  color: var(--color-text);
}
.preview-chip strong {
  color: var(--color-primary);
}

.regions-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  cursor: pointer;
  text-decoration: none;
  color: var(--color-text);
}
.cta-title {
  font-weight: 700;
  margin-bottom: 4px;
}
.cta-sub {
  font-size: 0.8rem;
}

.retry-btn {
  align-self: center;
}

@media (max-width: 720px) {
  .widget-grid {
    grid-template-columns: 1fr;
  }
  .hero-temp {
    font-size: 3.2rem;
  }
}
</style>
