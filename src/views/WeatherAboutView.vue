<script setup>
import { useRouter } from 'vue-router'
import { Info, MapPin, CloudSun, Wind, LineChart, Sparkles } from '@lucide/vue'

const router = useRouter()
const goHome = () => router.push('/')

const features = [
  { icon: MapPin, text: '브라우저 위치 권한으로 내 지역 날씨를 자동으로 보여줘요' },
  { icon: CloudSun, text: '6개 주요 도시 + 검색으로 추가한 도시를 자유롭게 둘러볼 수 있어요' },
  { icon: LineChart, text: '오늘 시간별 기온과 5일 예보를 애니메이션 차트로 확인해요' },
  { icon: Wind, text: '대기질(PM10/PM2.5/NO2)과 일출·일몰, 불쾌지수까지 한 번에' },
  { icon: Sparkles, text: '날씨에 맞춰 배경이 바뀌고, 비/눈이 오면 화면에 파티클이 내려요' },
]
</script>

<template>
  <div class="page about-page">
    <section class="about-card glass-card">
      <div class="section-title"><Info :size="20" />서비스 소개</div>
      <p class="lead">
        Vue 3 · Pinia · Vue Router로 만든 실습용 날씨 대시보드입니다. OpenWeatherMap API로 실시간 날씨·예보·대기질
        데이터를 가져와 화면을 구성했습니다.
      </p>

      <ul class="feature-list">
        <li v-for="feature in features" :key="feature.text">
          <component :is="feature.icon" :size="18" />
          <span>{{ feature.text }}</span>
        </li>
      </ul>

      <button class="btn-primary" @click="goHome">대시보드 홈으로 이동</button>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  padding-top: 6px;
  display: flex;
  justify-content: center;
}
.about-card {
  max-width: 560px;
  width: 100%;
  padding: 28px 30px;
}
.lead {
  color: var(--color-text-muted);
  font-size: 0.92rem;
  line-height: 1.7;
  margin-bottom: 20px;
}
.feature-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 26px;
}
.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
}
.feature-list svg {
  flex-shrink: 0;
  color: var(--color-primary);
  margin-top: 1px;
}
.btn-primary {
  width: 100%;
}
</style>
