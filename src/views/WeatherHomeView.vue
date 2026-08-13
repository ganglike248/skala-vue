<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import {
  MapPin,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Droplets,
  Wind,
  ThermometerSun,
  Star,
  LocateFixed,
} from '@lucide/vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { celsiusToFahrenheit, msToMph, buildAdvice, formatHourLabel } from '@/utils/weatherMath'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'
import DaylightBar from '@/components/weather/DaylightBar.vue'
import AirQualityCard from '@/components/weather/AirQualityCard.vue'
import DiscomfortCard from '@/components/weather/DiscomfortCard.vue'
import AdviceChips from '@/components/weather/AdviceChips.vue'
import SearchBox from '@/components/weather/SearchBox.vue'

// 배경 그라디언트/파티클은 App.vue가 app-body 전체에 이미 깔아주므로
// 이 화면은 그 위에 얹히는 콘텐츠(반투명 카드들)만 신경 쓰면 됨
const router = useRouter()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()
const selectionStore = useSelectionStore()

// 홈은 selectionStore가 가리키는 지역(기본 내 위치)을 그대로 보여줌 -> 예보/지도/즐겨찾기와 동기화됨
const active = computed(() => weatherStore.entries[selectionStore.selectedCityId])
watch(
  () => selectionStore.selectedCityId,
  (id) => weatherStore.fetchDetail(id),
  { immediate: true },
)

const isLoading = computed(() => !active.value?.current)
const isFallback = computed(
  () => selectionStore.selectedCityId === 'me' && weatherStore.myLocationStatus === 'denied',
)

const displayTemp = computed(() => {
  if (!active.value?.current) return null
  const t = active.value.current.temp
  return configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t
})
const displayFeelsLike = computed(() => {
  if (!active.value?.current) return null
  const t = active.value.current.feelsLike
  return configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t
})
const displayWind = computed(() => {
  if (!active.value?.current) return null
  const w = active.value.current.windSpeed
  return configStore.windSpeedUnit === 'mph' ? msToMph(w) : w
})

// 주의: OpenWeatherMap 현재 날씨 API의 temp_min/temp_max는 '오늘의 최고/최저'가 아니라
// 관측 지점 주변의 순간적인 온도 편차라서, 도시 데이터가 하나뿐이면 현재 기온과 항상 같게 나옴.
// 그래서 실제 오늘 최고/최저는 5일 예보 API를 오늘 날짜로 묶은 daily[0]에서 계산한 값을 씀
// (예보는 '지금 이후'만 있어서, 혹시 현재 기온이 그 범위를 벗어나면 현재 기온까지 포함해 보정)
const todayRange = computed(() => {
  if (!active.value?.current) return null
  const today = active.value.forecast?.daily?.[0]
  const current = active.value.current.temp
  if (!today) return { min: active.value.current.tempMin, max: active.value.current.tempMax }
  return { min: Math.min(today.min, current), max: Math.max(today.max, current) }
})

const advice = computed(() => {
  if (!active.value?.current) return []
  return buildAdvice({
    temp: active.value.current.temp,
    windSpeed: active.value.current.windSpeed,
    description: active.value.current.description,
    aqi: active.value.airQuality?.aqi,
  })
})

// '지금'을 포함해 10개만, 날짜가 바뀌는 지점은 두 줄(날짜/시간)로 표시
const hourly = computed(() => (active.value?.forecast?.hourly ?? []).slice(0, 10))
const hourlyTemp = (t) => (configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t)
const hourlyLabels = computed(() =>
  hourly.value.map((_, idx) => formatHourLabel(hourly.value, idx)),
)

// ---- 지역 변경 드롭다운 ----
const showSwitcher = ref(false)
const switcherRef = ref(null)
onClickOutside(switcherRef, () => (showSwitcher.value = false))

const cityOptions = computed(() => weatherStore.allCities)

function pickCity(id) {
  selectionStore.selectCity(id)
  showSwitcher.value = false
}

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
      <div
        class="skeleton"
        style="
          height: 20px;
          width: 140px;
          margin-bottom: 18px;
          background: rgba(255, 255, 255, 0.25);
        "
      />
      <div
        class="skeleton"
        style="
          height: 74px;
          width: 220px;
          margin-bottom: 14px;
          background: rgba(255, 255, 255, 0.25);
        "
      />
      <div
        class="skeleton"
        style="height: 16px; width: 260px; background: rgba(255, 255, 255, 0.25)"
      />
    </div>

    <template v-else>
      <p v-if="isFallback" class="location-banner">
        <AlertTriangle :size="14" />
        위치 권한이 없어 기본 지역을 표시했어요. 브라우저 위치 권한을 허용하면 내 지역 날씨를 볼 수
        있어요.
      </p>

      <div class="hero-top">
        <div ref="switcherRef" class="location-switcher">
          <button class="location" @click="showSwitcher = !showSwitcher">
            <MapPin :size="16" />
            {{ active.name }}
            <small>{{ active.region }}</small>
            <ChevronDown :size="14" class="caret" :class="{ open: showSwitcher }" />
          </button>

          <div v-if="showSwitcher" class="switcher-panel glass-card">
            <p class="switcher-heading text-muted">지역 변경</p>
            <button
              class="switcher-option"
              :class="{ active: selectionStore.selectedCityId === 'me' }"
              @click="pickCity('me')"
            >
              <LocateFixed :size="15" />
              <span>내 위치</span>
            </button>
            <div class="switcher-divider" />
            <div class="switcher-list">
              <button
                v-for="city in cityOptions"
                :key="city.id"
                class="switcher-option"
                :class="{ active: selectionStore.selectedCityId === city.id }"
                @click="pickCity(city.id)"
              >
                <WeatherIcon v-if="city.current" :code="city.current.iconCode" :size="15" />
                <span>{{ city.name }}</span>
                <strong v-if="city.current" class="switcher-temp">{{ city.current.temp }}°</strong>
              </button>
            </div>
            <div class="switcher-divider" />
            <SearchBox @added="pickCity" />
          </div>
        </div>

        <div class="hero-icon-badge icon-float">
          <WeatherIcon :code="active.current.iconCode" :size="44" />
        </div>
      </div>

      <div class="hero-body">
        <div class="hero-temp temp-float">
          {{ displayTemp }}<span class="unit">{{ configStore.unitSymbol }}</span>
        </div>
        <p class="hero-desc">
          {{ active.current.description }} · 체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }}
        </p>

        <div class="hero-stats">
          <span v-if="todayRange"
            ><ThermometerSun :size="14" /> 최고 {{ hourlyTemp(todayRange.max) }}° / 최저
            {{ hourlyTemp(todayRange.min) }}°</span
          >
          <span><Droplets :size="14" /> 습도 {{ active.current.humidity }}%</span>
          <span><Wind :size="14" /> 풍속 {{ displayWind }}{{ configStore.windSpeedSymbol }}</span>
        </div>

        <AdviceChips :tips="advice" />
      </div>
    </template>

    <!-- 오늘 시간별 기온 -->
    <section v-if="hourly.length" class="hourly-section glass-card">
      <div class="section-title">오늘 시간별 기온</div>
      <p class="hourly-caption text-muted">
        3시간 간격 예보를 기반으로 1시간 단위로 추정한 값이에요
      </p>
      <div class="hourly-row">
        <div v-for="(h, idx) in hourly" :key="h.time" class="hour-pill" :class="{ now: idx === 0 }">
          <span class="hour-label">
            <small v-if="hourlyLabels[idx].date">{{ hourlyLabels[idx].date }}</small>
            <span>{{ hourlyLabels[idx].hour }}</span>
          </span>
          <WeatherIcon :code="h.iconCode" :size="26" />
          <strong class="hour-temp">{{ hourlyTemp(h.temp) }}°</strong>
          <span class="hour-pop">💧{{ h.pop }}%</span>
        </div>
      </div>
    </section>
    <!-- 보조 위젯: 대기질/불쾌지수/일출일몰 (가로 배치) -->
    <section v-if="active?.current" class="widget-rail">
      <AirQualityCard
        v-if="active.airQuality"
        :aqi="active.airQuality.aqi"
        :components="active.airQuality.components"
      />
      <DiscomfortCard :temp="active.current.temp" :humidity="active.current.humidity" />
      <DaylightBar :sunrise="active.current.sunrise" :sunset="active.current.sunset" />
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
.hero-icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-surface-solid);
  box-shadow: var(--shadow-soft);
  flex-shrink: 0;
}

/* ---------- 지역 변경 드롭다운 ---------- */
.location-switcher {
  position: relative;
}
.location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 1.05rem;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 10px;
  transition: background-color 0.15s ease;
}
.location:hover {
  background: rgba(255, 255, 255, 0.14);
}
.location small {
  font-weight: 400;
  opacity: 0.85;
  font-size: 0.75rem;
}
.caret {
  transition: transform 0.2s ease;
  opacity: 0.85;
}
.caret.open {
  transform: rotate(180deg);
}

.switcher-panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  left: 0;
  width: 300px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--color-text);
  box-shadow: var(--shadow-strong);
}
.switcher-heading {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 6px 4px;
}
.switcher-divider {
  height: 1px;
  background: var(--color-border);
  margin: 6px 0;
}
.switcher-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 240px;
  overflow-y: auto;
}
.switcher-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
}
.switcher-option:hover {
  background: rgba(118, 159, 205, 0.1);
}
.switcher-option.active {
  background: rgba(118, 159, 205, 0.14);
  color: var(--color-primary);
}
.switcher-temp {
  margin-left: auto;
  font-weight: 700;
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
  background: rgba(255, 255, 255);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border-color: rgba(255, 255, 255, 0.45);
  color: var(--color-text);
}
html.dark .home-page :deep(.glass-card) {
  background: rgba(19, 27, 46, 0.55);
  border-color: rgba(255, 255, 255, 0.14);
}
/* 드롭다운은 글자가 많아 가독성이 더 중요 -> 불투명도를 높게 */
.switcher-panel.glass-card {
  background: rgba(255, 255, 255, 0.97);
}
html.dark .switcher-panel.glass-card {
  background: rgba(19, 27, 46, 0.97);
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
  color: var(--color-text);
}
.hour-pill.now {
  border: 2px solid var(--color-primary);
}
.hour-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.3;
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.85;
}
.hour-label small {
  font-size: 0.62rem;
  font-weight: 600;
}
.hour-temp {
  font-size: 1rem;
}
.hour-pop {
  font-size: 0.66rem;
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
  .hourly-row {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    row-gap: 10px;
  }
}
</style>
