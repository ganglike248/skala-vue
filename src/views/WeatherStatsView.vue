<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 홈 화면과 동일한 도시 데이터를 재사용해 통계만 뽑아봄
const weatherList = [
  { id: 'city_01', name: '서울', temp: 24, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 19, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '제주', temp: 22, status: '구름' },
  { id: 'city_05', name: '대전', temp: 30, status: '맑음' },
  { id: 'city_06', name: '광주', temp: 27, status: '비' },
]

const averageTemp = computed(() => {
  const total = weatherList.reduce((sum, city) => sum + city.temp, 0)
  return Math.round((total / weatherList.length) * 10) / 10
})

const hottest = computed(() => weatherList.reduce((a, b) => (a.temp > b.temp ? a : b)))
const coldest = computed(() => weatherList.reduce((a, b) => (a.temp < b.temp ? a : b)))

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <section class="stats-card">
    <h3>📊 날씨 통계</h3>
    <p>
      등록된 도시 수: <strong>{{ weatherList.length }}개</strong>
    </p>
    <p>
      평균 기온: <strong>{{ averageTemp }}°C</strong>
    </p>
    <p>
      가장 더운 도시:
      <strong>{{ hottest.name }} ({{ hottest.temp }}°C) {{ hottest.status }}</strong>
    </p>
    <p>
      가장 추운 도시:
      <strong>{{ coldest.name }} ({{ coldest.temp }}°C) {{ coldest.status }}</strong>
    </p>
    <button class="btn-home" @click="goHome">대시보드 홈으로 이동</button>
  </section>
</template>

<style scoped>
.stats-card {
  max-width: 500px;
  margin: 0 auto;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px 18px;
}

.stats-card p {
  margin: 8px 0;
}

.btn-home {
  margin-top: 10px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background-color: #3498db;
  color: #fff;
  cursor: pointer;
  width: 100%;
}
</style>
