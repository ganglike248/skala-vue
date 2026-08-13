<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDark, useToggle, useGeolocation } from '@vueuse/core'
import {
  CloudSun,
  Moon,
  SunMedium,
  LayoutDashboard,
  CalendarDays,
  MapPinned,
  Star,
  BarChart3,
  Info,
  Wind,
  LocateFixed,
} from '@lucide/vue'
import UnitToggler from './components/exercise/UnitToggler.vue'
import WeatherParticles from './components/weather/WeatherParticles.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { resolveGradientClass, resolveParticleType } from '@/utils/weatherIconMap'

// 다크모드: html 태그에 .dark 클래스를 붙였다 뗐다 하며 weather-theme.css의 토큰을 스위칭
const isDark = useDark()
const toggleDark = useToggle(isDark)

const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const route = useRoute()

// ---- 홈 화면일 때 app-body 전체를 날씨 그라디언트 배경으로 사용 ----
const isHome = computed(() => route.path === '/')
const homeCurrent = computed(() => weatherStore.entries.me?.current)
const homeGradientClass = computed(() => (isHome.value ? resolveGradientClass(homeCurrent.value?.iconCode) : null))
const homeParticleType = computed(() => (isHome.value ? resolveParticleType(homeCurrent.value?.conditionMain) : null))

// ---- 내 위치 부트스트랩: 앱 최상단에서 한 번만 실행해서
//      어떤 화면(홈/예보/지도)에서 시작하든 entries.me 를 쓸 수 있게 함 ----
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
  fallbackTimer = setTimeout(() => {
    if (weatherStore.myLocationStatus === 'idle') {
      weatherStore.fetchFallbackLocation()
    }
  }, 6000)
  weatherStore.loadAllCurrent()
})
onUnmounted(() => clearTimeout(fallbackTimer))

function retryLocation() {
  weatherStore.resetMyLocation()
  const { latitude, longitude } = coords.value
  if (latitude !== Infinity && longitude !== Infinity) {
    weatherStore.fetchMyLocation(latitude, longitude)
  }
}

// ---- 상단 실시간 날짜/시간 ----
const now = ref(new Date())
let clockTimer = null
onMounted(() => {
  clockTimer = setInterval(() => (now.value = new Date()), 1000 * 30)
})
onUnmounted(() => clearInterval(clockTimer))
const dateLabel = computed(() =>
  now.value.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }),
)
const timeLabel = computed(() => now.value.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))

const navItems = [
  { to: '/', label: '홈', icon: LayoutDashboard },
  { to: '/weather/me', label: '예보', icon: CalendarDays },
  { to: '/map', label: '지도', icon: MapPinned },
  { to: '/regions', label: '즐겨찾기', icon: Star },
  { to: '/stats', label: '통계', icon: BarChart3 },
  { to: '/about', label: '소개', icon: Info },
]
</script>

<template>
  <div class="app-shell">
    <!-- 좌측 사이드바 내비게이션 -->
    <aside class="sidebar">
      <RouterLink to="/" class="brand">
        <span class="brand-mark"><CloudSun :size="22" :stroke-width="2.2" /></span>
        <span class="brand-text">
          <strong>SKALA</strong>
          <small>날씨 대시보드</small>
        </span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ 'router-link-exact-active': item.to === '/weather/me' && $route.path.startsWith('/weather') }"
        >
          <component :is="item.icon" :size="19" :stroke-width="2" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-foot">
        <button
          v-if="weatherStore.myLocationStatus === 'denied'"
          class="mini-action"
          title="내 위치 다시 가져오기"
          @click="retryLocation"
        >
          <LocateFixed :size="16" />
        </button>
        <div class="sidebar-toggles">
          <UnitToggler />
          <button
            class="theme-toggle"
            @click="toggleDark()"
            :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
          >
            <SunMedium v-if="isDark" :size="17" />
            <Moon v-else :size="17" />
          </button>
        </div>
      </div>
    </aside>

    <div class="app-body" :class="homeGradientClass">
      <div v-if="homeGradientClass" class="app-body-glow" />
      <WeatherParticles v-if="homeGradientClass" :type="homeParticleType" />

      <!-- 상단 바: 날짜/시간 + 풍속 단위 -->
      <header class="top-bar" :class="{ 'on-gradient': homeGradientClass }">
        <div class="top-bar-date">
          <span class="date-text">{{ dateLabel }}</span>
          <span class="dot">·</span>
          <span class="time-text">{{ timeLabel }}</span>
        </div>
        <div class="top-bar-actions">
          <button class="wind-unit-pill" @click="configStore.toggleWindSpeedUnit">
            <Wind :size="14" />
            {{ configStore.windSpeedSymbol }}
          </button>
        </div>
      </header>

      <main class="app-main">
        <RouterView v-slot="{ Component, route: r }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="r.fullPath" />
          </Transition>
        </RouterView>
      </main>

      <footer class="app-footer" :class="{ 'on-gradient': homeGradientClass }">
        <span>날씨·대기질 데이터 제공: OpenWeatherMap</span>
        <span class="dot">·</span>
        <span>SK SKALA 4기 Vue 실습 — U123 손경락</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
  background-image:
    radial-gradient(900px 480px at 12% -8%, rgba(52, 120, 246, 0.12), transparent 60%),
    radial-gradient(700px 420px at 100% 0%, rgba(106, 123, 255, 0.1), transparent 55%);
}

/* ---------- 사이드바 ---------- */
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 236px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 26px 18px 22px;
  background: var(--color-surface-solid);
  border-right: 1px solid var(--color-border);
  z-index: 40;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
  margin-bottom: 30px;
  text-decoration: none;
  color: var(--color-text);
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, var(--sky-1), var(--sky-2) 60%, var(--sky-3));
  box-shadow: var(--shadow-pop);
  flex-shrink: 0;
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.brand-text strong {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.brand-text small {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}
.nav-link:hover {
  background: rgba(52, 120, 246, 0.08);
  color: var(--color-primary);
}
.nav-link.router-link-exact-active {
  background: linear-gradient(135deg, var(--color-primary), var(--sky-3));
  color: #fff;
  box-shadow: var(--shadow-pop);
  transform: translateX(2px);
}

.sidebar-foot {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}
.mini-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px dashed var(--color-primary);
  background: rgba(52, 120, 246, 0.08);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}
.sidebar-toggles {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.theme-toggle:hover {
  transform: rotate(20deg);
}

/* ---------- 본문 영역 ---------- */
/* 홈 화면일 때는 weather-gradient-* 클래스가 여기(app-body) 자체 배경이 되어
   상단 바 아래부터 푸터까지 화면 전체가 날씨 색으로 물듦 */
.app-body {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  transition: background-color 0.4s ease;
}
.app-body.weather-gradient-clear-day,
.app-body.weather-gradient-clear-night,
.app-body.weather-gradient-clouds,
.app-body.weather-gradient-rain,
.app-body.weather-gradient-thunder,
.app-body.weather-gradient-snow,
.app-body.weather-gradient-fog {
  color: #fff;
}
.app-body-glow {
  position: absolute;
  top: -140px;
  right: -60px;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.45), transparent 70%);
  animation: glow-pulse 5s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
.app-body :deep(.particles-canvas) {
  z-index: 0;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px clamp(20px, 3vw, 40px) 10px;
  background: linear-gradient(var(--color-bg) 70%, transparent);
}
.top-bar.on-gradient {
  background: linear-gradient(rgba(0, 0, 0, 0.14) 0%, transparent 100%);
}
.top-bar-date {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.top-bar-date .date-text {
  color: var(--color-text);
  font-weight: 700;
}
.top-bar.on-gradient .top-bar-date,
.top-bar.on-gradient .top-bar-date .date-text {
  color: #fff;
}
.top-bar .dot {
  opacity: 0.5;
}
.wind-unit-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-solid);
  color: var(--color-text);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.wind-unit-pill:hover {
  transform: translateY(-1px);
}
.top-bar.on-gradient .wind-unit-pill {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.35);
  color: #fff;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.app-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding-top: 6px;
}

.app-footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px 40px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  flex-wrap: wrap;
  text-align: center;
}
.app-footer.on-gradient {
  color: rgba(255, 255, 255, 0.85);
}
.dot {
  opacity: 0.5;
}

/* 라우트 전환 애니메이션 */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1080px) {
  .sidebar {
    width: 84px;
    padding: 22px 12px;
    align-items: center;
  }
  .brand {
    padding: 0;
    justify-content: center;
  }
  .brand-text {
    display: none;
  }
  .nav-link {
    justify-content: center;
    padding: 12px;
  }
  .nav-link span {
    display: none;
  }
  .sidebar-foot {
    align-items: center;
  }
  .sidebar-toggles {
    flex-direction: column;
  }
  .mini-action span {
    display: none;
  }
}

@media (max-width: 640px) {
  .top-bar-date {
    font-size: 0.75rem;
  }
}
</style>
