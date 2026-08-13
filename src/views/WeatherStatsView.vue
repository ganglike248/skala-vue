<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWeatherStore } from '@/stores/weatherStore'

const router = useRouter()
const weatherStore = useWeatherStore()

// 주소를 직접 입력해 들어와도 데이터가 없을 수 있으므로 이 화면에서도 로드 보장
onMounted(() => {
  weatherStore.ensureLoaded()
})

const weatherList = computed(() => weatherStore.weatherList)

const averageTemp = computed(() => {
  if (weatherList.value.length === 0) return 0
  const total = weatherList.value.reduce((sum, city) => sum + city.temp, 0)
  return Math.round((total / weatherList.value.length) * 10) / 10
})

const hottest = computed(() => {
  if (weatherList.value.length === 0) return null
  return weatherList.value.reduce((a, b) => (a.temp > b.temp ? a : b))
})
const coldest = computed(() => {
  if (weatherList.value.length === 0) return null
  return weatherList.value.reduce((a, b) => (a.temp < b.temp ? a : b))
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <section class="stats-card">
    <h3>📊 날씨 통계</h3>

    <p v-if="weatherStore.error" class="empty-message">{{ weatherStore.error }}</p>
    <p v-else-if="weatherList.length === 0" class="empty-message">날씨 데이터를 불러오는 중...</p>

    <template v-else>
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
    </template>

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

.empty-message {
  text-align: center;
  color: #e74c3c;
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
