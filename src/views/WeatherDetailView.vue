<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()

// 주소를 직접 입력해 들어와도 데이터가 없을 수 있으므로 이 화면에서도 로드 보장
onMounted(() => {
  weatherStore.ensureLoaded()
})

// Router 동적 경로(:cityId)로 넘어온 도시ID로 store에서 실시간 데이터 조회
// (fetch가 끝나기 전엔 null → v-else 안내 문구, 끝나면 자동으로 반응형 갱신)
const cityDetail = computed(() => weatherStore.cityDetailMap[route.params.cityId] ?? null)

// 스토어의 단위 설정이 'fahrenheit'일 때만 화씨로 변환해서 표시
const displayTemp = computed(() => {
  if (!cityDetail.value) return null
  const rawTemp = cityDetail.value.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})

// 스토어의 풍속 단위 설정이 'mph'일 때만 변환해서 표시 (원본은 m/s)
const displayWindSpeed = computed(() => {
  if (!cityDetail.value) return null
  const rawSpeed = cityDetail.value.windSpeed
  if (configStore.windSpeedUnit === 'mph') {
    return Math.round(rawSpeed * 2.237 * 10) / 10
  }
  return rawSpeed
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <section class="detail-card">
    <h3>🏙️ 지역별 상세 기상 관측 정보</h3>

    <div v-if="cityDetail" class="detail-info">
      <p>
        📍 지정 지역: <strong>{{ cityDetail.region }}</strong>
      </p>
      <p>실시간 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>
      <p>기상 현황: {{ cityDetail.description }}</p>
      <p>대기 습도: {{ cityDetail.humidity }}%</p>
      <p class="wind-row">
        현재 풍속: {{ displayWindSpeed }}{{ configStore.windSpeedSymbol }}
        <button class="btn-wind-toggle" @click="configStore.toggleWindSpeedUnit">단위변경</button>
      </p>
    </div>
    <p v-else-if="weatherStore.isLoading" class="empty-message">날씨 데이터를 불러오는 중...</p>
    <p v-else-if="weatherStore.error" class="empty-message">{{ weatherStore.error }}</p>
    <p v-else class="empty-message">
      해당 도시 코드({{ route.params.cityId }})를 찾을 수 없습니다.
    </p>

    <button class="btn-back" @click="goHome">대시보드 홈으로 이동</button>
  </section>
</template>

<style scoped>
.detail-card {
  max-width: 500px;
  margin: 0 auto;
}

.detail-info {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px 18px;
  margin-bottom: 16px;
}

.detail-info p {
  margin: 6px 0;
}

.wind-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-wind-toggle {
  padding: 3px 8px;
  border: 1px solid #ccc;
  border-radius: 12px;
  background-color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.empty-message {
  text-align: center;
  color: #e74c3c;
  padding: 20px 0;
}

.btn-back {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background-color: #42b883;
  color: #fff;
  cursor: pointer;
  width: 100%;
}
</style>
