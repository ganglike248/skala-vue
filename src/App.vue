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
  ChevronLeft,
  ChevronRight,
} from '@lucide/vue'
import { useStorage } from '@vueuse/core'
import UnitToggler from './components/exercise/UnitToggler.vue'
import WeatherParticles from './components/weather/WeatherParticles.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { resolveGradientClass, resolveParticleType, HERO_PHOTOS } from '@/utils/weatherIconMap'

// 다크모드: html 태그에 .dark 클래스를 붙였다 뗐다 하며 weather-theme.css의 토큰을 스위칭
const isDark = useDark()
const toggleDark = useToggle(isDark)

// 사이드바 접기/펼치기 (수동 토글, 새로고침해도 유지. 처음엔 좁은 화면이면 기본 접힘)
const sidebarCollapsed = useStorage('sidebar-collapsed', window.innerWidth < 1080)

const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const selectionStore = useSelectionStore()
const route = useRoute()

// ---- 홈 화면일 때 app-body 전체를 날씨 그라디언트 배경으로 사용 ----
// 홈은 selectionStore가 가리키는 '현재 선택된 지역'(기본값 내 위치)을 그대로 반영
const isHome = computed(() => route.path === '/')
const homeCurrent = computed(() => weatherStore.entries[selectionStore.selectedCityId]?.current)
const homeGradientClass = computed(() => (isHome.value ? resolveGradientClass(homeCurrent.value?.iconCode) : null))
const homeParticleType = computed(() =>
  isHome.value ? resolveParticleType(homeCurrent.value?.iconCode, homeCurrent.value?.conditionMain) : null,
)
// 그라디언트 클래스에 대응하는 사진을 CSS 변수로 흘려보내 배경으로 사용 (파티클은 그 위에 그대로 유지)
const homeBodyStyle = computed(() => {
  const photo = homeGradientClass.value ? HERO_PHOTOS[homeGradientClass.value] : null
  return photo ? { '--hero-photo': `url(${photo})` } : {}
})

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

// '예보' 탭은 항상 현재 선택된 지역(selectionStore)의 예보로 이동
const navItems = computed(() => [
  { to: '/', label: '홈', icon: LayoutDashboard },
  { to: `/weather/${selectionStore.selectedCityId}`, label: '예보', icon: CalendarDays },
  { to: '/map', label: '지도', icon: MapPinned },
  { to: '/regions', label: '즐겨찾기', icon: Star },
  { to: '/stats', label: '통계', icon: BarChart3 },
  { to: '/about', label: '소개', icon: Info },
])
</script>

<template>
  <div class="app-shell">
    <!-- 좌측 사이드바 내비게이션 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <button
        class="sidebar-collapse-btn"
        @click="sidebarCollapsed = !sidebarCollapsed"
        :aria-label="sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'"
      >
        <ChevronRight v-if="sidebarCollapsed" :size="13" />
        <ChevronLeft v-else :size="13" />
      </button>

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
          :key="item.label"
          :to="item.to"
          class="nav-link"
          :class="{ 'router-link-exact-active': item.label === '예보' && $route.path.startsWith('/weather') }"
        >
          <component :is="item.icon" :size="19" :stroke-width="2" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-foot">
        <div class="sidebar-date">
          <span class="date-text">{{ dateLabel }}</span>
          <span class="time-text">{{ timeLabel }}</span>
        </div>
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
          <button class="wind-unit-pill" @click="configStore.toggleWindSpeedUnit" title="풍속 단위 전환">
            <Wind :size="14" />
            <span>{{ configStore.windSpeedSymbol }}</span>
          </button>
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
      <div v-if="homeGradientClass" class="app-body-photo" :style="homeBodyStyle" />
      <div v-if="homeGradientClass" class="app-body-overlay" />
      <div v-if="homeGradientClass" class="app-body-glow" />
      <WeatherParticles v-if="homeGradientClass" :type="homeParticleType" />

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
    radial-gradient(900px 480px at 12% -8%, rgba(118, 159, 205, 0.12), transparent 60%),
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
  transition: width 0.2s ease;
}

.sidebar-collapse-btn {
  position: absolute;
  top: 30px;
  right: -12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface-solid);
  color: var(--color-text-muted);
  cursor: pointer;
  box-shadow: var(--shadow-soft);
  z-index: 41;
  transition:
    color 0.15s ease,
    transform 0.15s ease;
}
.sidebar-collapse-btn:hover {
  color: var(--color-primary);
  transform: scale(1.08);
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
  /* 팔레트 4색이 전부 파스텔이라 로고 배지는 눈에 띄게 더 진한 톤으로 별도 지정 */
  background: linear-gradient(135deg, var(--color-primary), #1f4a73);
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
  background: rgba(118, 159, 205, 0.08);
  color: var(--color-primary);
}
.nav-link.router-link-exact-active {
  background: linear-gradient(135deg, var(--color-primary), var(--sky-3));
  color: #fff;
  transform: translateX(2px);
}

.sidebar-foot {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}
/* top-bar에 있던 날짜/시간을 사이드바 아래로 이식 */
.sidebar-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 6px;
}
.sidebar-date .date-text {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text);
}
.sidebar-date .time-text {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--color-text-muted);
}
.mini-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px dashed var(--color-primary);
  background: rgba(118, 159, 205, 0.08);
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

/* top-bar에 있던 풍속 단위 토글도 여기로 - ℃/℉ 토글 옆에 나란히 */
.wind-unit-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 10px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-solid);
  color: var(--color-text);
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.15s ease;
}
.wind-unit-pill:hover {
  transform: translateY(-1px);
}

/* ---------- 본문 영역 ---------- */
/* 홈 화면일 때는 weather-gradient-* 클래스가 여기(app-body) 자체 배경이 되어
   상단 바 아래부터 푸터까지 화면 전체가 날씨 색으로 물듦 */
.app-body {
  position: relative;
  /* 별도 스태킹 컨텍스트를 만들어야 아래 음수 z-index 사진/오버레이 레이어가
     .app-shell의 배경 뒤로 새 나가지 않고 이 안에서만 맨 뒤에 깔림 (사진 안 보이던 버그 원인) */
  isolation: isolate;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  transition: background-color 0.4s ease;
}
/* 날씨별 CSS 그라디언트 대신, App.vue가 골라준 실제 사진(--hero-photo)을 배경 레이어로 사용.
   그 위에 어두운 그라디언트를 얹어 흰 글자/카드 대비를 확보. 둘 다 음수 z-index로
   app-body 콘텐츠 뒤에 깔림. 오버레이 진하기는 날씨별로 달라짐(맑음은 거의 없음, 흐림/비/뇌우일수록 진해짐) */
.app-body.weather-gradient-clear-day,
.app-body.weather-gradient-clear-night,
.app-body.weather-gradient-clouds,
.app-body.weather-gradient-rain,
.app-body.weather-gradient-thunder,
.app-body.weather-gradient-snow,
.app-body.weather-gradient-fog {
  color: #fff;
}
.app-body.weather-gradient-clear-day {
  --overlay-top: rgba(6, 12, 24, 0);
  --overlay-bottom: rgba(6, 12, 24, 0.2);
}
.app-body.weather-gradient-clear-night {
  --overlay-top: rgba(6, 12, 24, 0.12);
  --overlay-bottom: rgba(6, 12, 24, 0.32);
}
.app-body.weather-gradient-snow {
  --overlay-top: rgba(6, 12, 24, 0.14);
  --overlay-bottom: rgba(6, 12, 24, 0.32);
}
.app-body.weather-gradient-fog {
  --overlay-top: rgba(6, 12, 24, 0.2);
  --overlay-bottom: rgba(6, 12, 24, 0.38);
}
.app-body.weather-gradient-clouds {
  --overlay-top: rgba(6, 12, 24, 0.26);
  --overlay-bottom: rgba(6, 12, 24, 0.44);
}
.app-body.weather-gradient-rain {
  --overlay-top: rgba(6, 12, 24, 0.34);
  --overlay-bottom: rgba(6, 12, 24, 0.52);
}
.app-body.weather-gradient-thunder {
  --overlay-top: rgba(6, 12, 24, 0.4);
  --overlay-bottom: rgba(6, 12, 24, 0.58);
}
.app-body-photo {
  position: absolute;
  inset: 0;
  background-image: var(--hero-photo, none);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -2;
}
.app-body-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--overlay-top, rgba(6, 12, 24, 0.32)) 0%, var(--overlay-bottom, rgba(6, 12, 24, 0.5)) 100%);
  z-index: -1;
  pointer-events: none;
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

.app-main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding-top: 28px;
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

/* 접힘 상태: 수동 토글(.collapsed) + 좁은 화면 자동 대응(media query) 둘 다 같은 모양으로 */
.sidebar.collapsed {
  width: 84px;
  padding: 22px 12px;
  align-items: center;
}
.sidebar.collapsed .brand {
  padding: 0;
  justify-content: center;
}
.sidebar.collapsed .brand-text {
  display: none;
}
.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px;
}
.sidebar.collapsed .nav-link span {
  display: none;
}
.sidebar.collapsed .sidebar-foot {
  align-items: center;
}
.sidebar.collapsed .sidebar-toggles {
  flex-direction: column;
}
.sidebar.collapsed .mini-action span {
  display: none;
}
.sidebar.collapsed .sidebar-collapse-btn {
  right: -12px;
}

.sidebar.collapsed .sidebar-date {
  display: none;
}
.sidebar.collapsed .wind-unit-pill {
  width: 36px;
  padding: 0;
}
.sidebar.collapsed .wind-unit-pill span {
  display: none;
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
  .sidebar-date {
    display: none;
  }
  .sidebar-toggles {
    flex-direction: column;
  }
  .mini-action span {
    display: none;
  }
  .wind-unit-pill {
    width: 36px;
    padding: 0;
  }
  .wind-unit-pill span {
    display: none;
  }
}
</style>
