<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin, ChevronRight, AlertTriangle, Droplets, Wind, ThermometerSun, Star } from '@lucide/vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { celsiusToFahrenheit, msToMph, buildAdvice, formatHourLabel } from '@/utils/weatherMath'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'
import DaylightBar from '@/components/weather/DaylightBar.vue'
import AirQualityCard from '@/components/weather/AirQualityCard.vue'
import DiscomfortCard from '@/components/weather/DiscomfortCard.vue'
import AdviceChips from '@/components/weather/AdviceChips.vue'

// 배경 그라디언트/파티클은 App.vue가 app-body 전체에 이미 깔아주므로
// 이 화면은 그 위에 얹히는 콘텐츠(반투명 카드들)만 신경 쓰면 됨
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
const formatHour = (idx) => formatHourLabel(hourly.value, idx)

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
        <div class="hero-temp temp-float">{{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span></div>
        <p class="hero-desc">{{ me.current.description }} · 체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }}</p>

        <div class="hero-stats">
          <span><ThermometerSun :size="14" /> 최고 {{ me.current.tempMax }}° / 최저 {{ me.current.tempMin }}°</span>
          <span><Droplets :size="14" /> 습도 {{ me.current.humidity }}%</span>
          <span><Wind :size="14" /> 풍속 {{ displayWind }}{{ configStore.windSpeedSymbol }}</span>
        </div>

        <AdviceChips :tips="advice" />
      </div>

      <!-- 보조 위젯: 대기질/불쾌지수/일출일몰 (가로 배치) -->
      <section v-if="me?.current" class="widget-rail">
        <AirQualityCard v-if="me.airQuality" :aqi="me.airQuality.aqi" :components="me.airQuality.components" />
        <DiscomfortCard :temp="me.current.temp" :humidity="me.current.humidity" />
        <DaylightBar :sunrise="me.current.sunrise" :sunset="me.current.sunset" />
      </section>
    </template>

    <!-- 오늘 시간별 기온 -->
    <section v-if="hourly.length" class="hourly-section glass-card">
      <div class="section-title">오늘 시간별 기온</div>
      <p class="hourly-caption text-muted">3시간 간격 예보를 기반으로 1시간 단위로 추정한 값이에요</p>
      <div class="hourly-row hscroll">
        <div v-for="(h, idx) in hourly" :key="h.time" class="hour-pill" :class="{ now: idx === 0 }">
          <span class="hour-label">{{ formatHour(idx) }}</span>
          <WeatherIcon :code="h.iconCode" :size="26" />
          <strong class="hour-temp">{{ hourlyTemp(h.temp) }}°</strong>
          <span class="hour-pop">💧{{ h.pop }}%</span>
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
/* 배경은 App.vue의 app-body가 담당 (weather-gradient-*), 여기서는 그 위 콘텐츠만 배치 */
.home-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 22px;
  padding-bottom: 8px;
}

.hero-loading {
  padding: 20px 0;
}

.location-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.22);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
}

.hero-top {
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

/* ---------- 보조 위젯: 가로 배치 + 반투명 글래스 ---------- */
.widget-rail {
  display: flex;
  gap: 16px;
}
.widget-rail > :deep(*) {
  flex: 1;
}

/* 이 화면의 카드들은 컬러 배경(app-body) 위에 놓이므로 반투명 유리 느낌으로 오버라이드 */
.home-page :deep(.glass-card) {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border-color: rgba(255, 255, 255, 0.45);
  color: var(--color-text);
}
html.dark .home-page :deep(.glass-card) {
  background: rgba(19, 27, 46, 0.55);
  border-color: rgba(255, 255, 255, 0.14);
}

.hourly-section {
  padding: 22px 26px 24px;
}
.hourly-caption {
  font-size: 0.75rem;
  margin-top: -8px;
  margin-bottom: 12px;
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
  color: var(--color-text);
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

.favorites-preview .section-title {
  color: #fff;
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

@media (max-width: 900px) {
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
