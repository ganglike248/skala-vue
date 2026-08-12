<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 도시 코드별 상세 기상관측 Mock Data (임시)
const cityDetailMock = {
  city_01: {
    region: '대한민국 서울특별시',
    temp: 24,
    status: '맑음',
    humidity: 55,
    windSpeed: 2.5,
  },
  city_02: {
    region: '대한민국 경기도 수원시',
    temp: 19,
    status: '비',
    humidity: 80,
    windSpeed: 3.1,
  },
  city_03: {
    region: '대한민국 부산광역시',
    temp: 26,
    status: '구름',
    humidity: 62,
    windSpeed: 4.0,
  },
  city_04: {
    region: '대한민국 제주특별자치도',
    temp: 22,
    status: '구름',
    humidity: 70,
    windSpeed: 5.2,
  },
  city_05: {
    region: '대한민국 대전광역시',
    temp: 30,
    status: '맑음',
    humidity: 45,
    windSpeed: 1.8,
  },
  city_06: { region: '대한민국 광주광역시', temp: 27, status: '비', humidity: 75, windSpeed: 2.9 },
}

const cityDetail = ref(null)

// Router 동적 경로(:cityId)로 넘어온 도시ID를 Mount 시점에 Mock Data에서 선택
onMounted(() => {
  cityDetail.value = cityDetailMock[route.params.cityId] ?? null
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
      <p>실시간 기온: {{ cityDetail.temp }}°C</p>
      <p>기상 현황: {{ cityDetail.status }}</p>
      <p>대기 습도: {{ cityDetail.humidity }}%</p>
      <p>현재 풍속: {{ cityDetail.windSpeed }}m/s</p>
    </div>
    <p v-else class="empty-message">
      해당 도시 코드({{ route.params.cityId }})를 찾을 수 없습니다.
    </p>

    <button class="btn-back" @click="goHome">메인 대시보드로 돌아가기</button>
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
