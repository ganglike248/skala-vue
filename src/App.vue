<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { CloudSun, Moon, SunMedium, MapPinned, BarChart3, Info } from '@lucide/vue'
import UnitToggler from './components/exercise/UnitToggler.vue'

// 다크모드: html 태그에 .dark 클래스를 붙였다 뗐다 하며 weather-theme.css의 토큰을 스위칭
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <div class="app-shell">
    <header class="top-nav">
      <RouterLink to="/" class="brand">
        <CloudSun :size="26" :stroke-width="2" />
        <span>SKALA 날씨</span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="/" class="nav-link">홈</RouterLink>
        <RouterLink to="/regions" class="nav-link">
          <MapPinned :size="15" />
          지역별 날씨
        </RouterLink>
        <RouterLink to="/stats" class="nav-link">
          <BarChart3 :size="15" />
          통계
        </RouterLink>
        <RouterLink to="/about" class="nav-link">
          <Info :size="15" />
          소개
        </RouterLink>
      </nav>

      <div class="nav-actions">
        <UnitToggler />
        <button class="theme-toggle" @click="toggleDark()" :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'">
          <SunMedium v-if="isDark" :size="18" />
          <Moon v-else :size="18" />
        </button>
      </div>
    </header>

    <main class="app-main">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>

    <footer class="app-footer">
      <span>날씨·대기질 데이터 제공: OpenWeatherMap</span>
      <span class="dot">·</span>
      <span>SK SKALA 4기 Vue 실습 — U123 손경락</span>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px clamp(16px, 4vw, 32px);
  background: var(--color-surface);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border-bottom: 1px solid var(--color-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--color-text);
  text-decoration: none;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.nav-link:hover {
  background: rgba(79, 124, 255, 0.1);
  color: var(--color-primary);
}

.nav-link.router-link-exact-active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-2));
  color: #fff;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface-solid);
  color: var(--color-text);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.theme-toggle:hover {
  transform: rotate(20deg);
}

.app-main {
  flex: 1;
}

.app-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px 40px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  flex-wrap: wrap;
  text-align: center;
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

@media (max-width: 720px) {
  .nav-link span {
    display: none;
  }
  .brand span {
    display: none;
  }
}
</style>
