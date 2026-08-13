<script setup>
import { useRouter } from 'vue-router'
import {
  Info,
  MapPin,
  CloudSun,
  Wind,
  LineChart,
  Sparkles,
  Layers,
  Database,
  Route,
  MapPinned,
  Image,
  Palette,
  Wrench,
  Type,
} from '@lucide/vue'

const router = useRouter()
const goHome = () => router.push('/')

// 소제목 + 설명 형태로: 한눈에 훑어볼 수 있게 카드마다 짧은 이름을 먼저 붙임
const features = [
  {
    icon: MapPin,
    title: '내 위치 자동 인식',
    text: '브라우저 위치 권한으로 내 지역 날씨를 자동으로 보여줘요',
  },
  {
    icon: CloudSun,
    title: '다양한 지역 탐색',
    text: '6개 주요 도시 + 검색으로 추가한 도시를 자유롭게 둘러볼 수 있어요',
  },
  {
    icon: LineChart,
    title: '시간별·일별 예보',
    text: '오늘 시간별 기온과 5일 예보를 애니메이션 차트로 확인해요',
  },
  {
    icon: Wind,
    title: '대기질 · 일출일몰',
    text: '대기질(PM10/PM2.5/NO2)과 일출·일몰, 불쾌지수까지 한 번에',
  },
  {
    icon: MapPinned,
    title: '지도로 한눈에 비교',
    text: '지도 위 핀으로 여러 도시 날씨를 한눈에 비교해요',
  },
  {
    icon: Sparkles,
    title: '날씨 연동 배경',
    text: '날씨·시간에 맞춰 배경 사진과 파티클(비/눈/별빛 등)이 바뀌어요',
  },
]

// 이 프로젝트가 무엇으로 만들어졌는지 - 간단한 기술 스택 요약
const techStack = [
  { icon: Layers, label: '프레임워크', value: 'Vue 3 (Composition API) · Vite' },
  { icon: Database, label: '상태 관리', value: 'Pinia' },
  { icon: Route, label: '라우팅', value: 'Vue Router' },
  {
    icon: CloudSun,
    label: '날씨 데이터',
    value: 'OpenWeatherMap API (현재/5일 예보/대기질/지오코딩)',
  },
  { icon: LineChart, label: '차트', value: 'ApexCharts (vue3-apexcharts)' },
  { icon: MapPinned, label: '지도', value: 'Leaflet + OpenStreetMap' },
  {
    icon: Palette,
    label: '아이콘 · 스타일',
    value: 'lucide-vue · 자체 CSS 디자인 시스템(CSS 변수 기반)',
  },
  { icon: Image, label: '이미지', value: 'Pexels 무료 라이선스 사진(홈 배경)' },
  { icon: Wrench, label: '유틸리티', value: 'VueUse (geolocation, dark mode, storage 등) · axios' },
  { icon: Type, label: '폰트', value: 'Pretendard' },
]
</script>

<template>
  <div class="page about-page">
    <div class="about-inner">
      <div class="section-title"><Info :size="20" />소개</div>

      <section class="about-card glass-card">
        <div class="section-title"><Info :size="20" />서비스 소개</div>
        <p class="lead">
          Vue 3 · Pinia · Vue Router로 만든 실습용 날씨 대시보드입니다. OpenWeatherMap API로 실시간
          날씨·예보·대기질 데이터를 가져와 화면을 구성했습니다.
        </p>

        <div class="feature-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-tile">
            <span class="feature-icon"><component :is="feature.icon" :size="18" /></span>
            <div class="feature-text">
              <p class="feature-title">{{ feature.title }}</p>
              <p class="feature-desc text-muted">{{ feature.text }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="tech-card glass-card">
        <div class="section-title"><Layers :size="20" />이렇게 만들어졌어요</div>
        <p class="text-muted tech-lead">이 프로젝트에서 사용한 기술 스택을 간단히 정리했어요.</p>

        <div class="tech-grid">
          <div v-for="item in techStack" :key="item.label" class="tech-tile">
            <span class="tech-icon"><component :is="item.icon" :size="16" /></span>
            <div class="tech-text">
              <p class="tech-label">{{ item.label }}</p>
              <p class="tech-value text-muted">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </section>
      <button class="btn-primary" @click="goHome">대시보드 홈으로 이동</button>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  padding-top: 6px;
}
/* 카드 두 개를 좌우가 아니라 위아래로 쌓음 */
.about-inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.about-card,
.tech-card {
  padding: 30px 32px;
}
.lead {
  color: var(--color-text-muted);
  font-size: 0.92rem;
  line-height: 1.7;
  margin-bottom: 22px;
}
.btn-primary {
  width: 100%;
}

/* 서비스 소개: 소제목 + 설명이 있는 타일 그리드 (카드가 이제 전체 폭이라 여유 있게 배치)
   6개 항목이라 3열로 고정 - auto-fit은 창 너비에 따라 4+2처럼 마지막 줄이 듬성듬성 남아서
   대신 6의 약수(3, 2, 1)로만 줄어들게 해서 항상 줄이 꽉 차게 함 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 26px;
}
.feature-tile {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(118, 159, 205, 0.1);
  color: var(--color-primary);
  flex-shrink: 0;
}
.feature-text {
  min-width: 0;
}
.feature-title {
  font-size: 0.86rem;
  font-weight: 700;
}
.feature-desc {
  font-size: 0.78rem;
  line-height: 1.5;
  margin-top: 2px;
}

.tech-lead {
  font-size: 0.85rem;
  margin: -8px 0 18px;
}
/* 10개 항목이라 5열로 고정 - 10의 약수(5, 2, 1)로만 줄어들게 해서 항상 줄이 꽉 차게 함 */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.tech-tile {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.tech-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(118, 159, 205, 0.1);
  color: var(--color-primary);
  flex-shrink: 0;
}
.tech-text {
  min-width: 0;
}
.tech-label {
  font-size: 0.82rem;
  font-weight: 700;
}
.tech-value {
  font-size: 0.78rem;
  line-height: 1.5;
  margin-top: 1px;
}

/* 좁아져도 6과 10의 공통 약수(2, 1)로만 줄어들어서 마지막 줄이 비지 않게 유지 */
@media (max-width: 1100px) {
  .feature-grid,
  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .feature-grid,
  .tech-grid {
    grid-template-columns: 1fr;
  }
}
</style>
