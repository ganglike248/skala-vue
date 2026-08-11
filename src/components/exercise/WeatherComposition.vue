<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 55, dust: '보통' },
  { id: 'city_02', name: '수원', temp: 19, status: '비', humidity: 80, dust: '좋음' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 62, dust: '좋음' },
  { id: 'city_04', name: '제주', temp: 22, status: '구름', humidity: 70, dust: '보통' },
  { id: 'city_05', name: '대전', temp: 30, status: '맑음', humidity: 45, dust: '나쁨' },
  { id: 'city_06', name: '광주', temp: 27, status: '비', humidity: 75, dust: '보통' },
])

const searchQuery = ref('')
const defaultCityInfo = '카드를 클릭하거나 검색해 보세요.'
const selectedCityInfo = ref(defaultCityInfo)

// 상세정보 펼쳐짐 상태
const expandedId = ref(null)

// 최초 1회만 노출되는 안내 배너
const showTip = ref(true)

// 검색어에 따른 필터링된 리스트를 computed로 계산
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return weatherList.value
  return weatherList.value.filter((item) => item.name.includes(keyword))
})

// computed: 검색 결과(filteredWeatherList)에 2차 계산 - 평균 기온
const averageTemp = computed(() => {
  if (filteredWeatherList.value.length === 0) return 0
  const total = filteredWeatherList.value.reduce((sum, item) => sum + item.temp, 0)
  return Math.round((total / filteredWeatherList.value.length) * 10) / 10
})

// 날씨 상태에 맞는 이모지
const weatherEmojiMap = {
  맑음: '☀️',
  비: '💧',
  구름: '☁️',
}

// 상태바 문구가 바뀔 때마다 콘솔에 기록
watch(selectedCityInfo, (newInfo) => {
  console.log(`👁️‍🗨️ [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newInfo}"`)
})

// watchEffect: 검색어가 바뀔 때마다 자동으로 실행되는 API 로그 시뮬레이션
watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다.`,
  )
})

// deep watch 결과를 화면에 보여주기 위한 로그
const tempChangeLog = ref('아직 감지된 기온 변경이 없습니다.')

// weatherList(배열 안 객체)의 기온 값이 바뀌는 것까지 감지
watch(
  weatherList,
  (newList) => {
    tempChangeLog.value = `도시 데이터가 변경되었습니다. (감지 시각: ${new Date().toLocaleTimeString()})`
    console.log('weatherList 내부 값이 변경되었습니다.', newList)
  },
  { deep: true },
)

// 무작위 도시의 기온을 바꿔 위 deep watch를 실제로 발동시켜보는 트리거
const randomizeTemp = () => {
  const target = weatherList.value[Math.floor(Math.random() * weatherList.value.length)]
  target.temp = Math.floor(Math.random() * 15) + 20 // 20~34도 사이 무작위 기온
}

// 알림 대행 함수 (window 객체 격리 우회)
const showDetail = (cityName, temp, status) => {
  window.alert(`현재 ${cityName}의 날씨는 ${temp}°C이며 ${status} 상태입니다.`)
}

// 카드 클릭 시 하단 상태바 갱신 + 상세정보 패널 토글
const selectCity = (item) => {
  const isClosing = expandedId.value === item.id
  expandedId.value = isClosing ? null : item.id
  selectedCityInfo.value = isClosing ? defaultCityInfo : `${item.name}이(가) 선택되었습니다.`
}

// 검색창에서 Enter 입력 시(@keyup.enter) 검색 결과 건수를 상태바에 표기
const handleSearchEnter = () => {
  const count = filteredWeatherList.value.length
  selectedCityInfo.value = searchQuery.value
    ? `'${searchQuery.value}' 검색 결과: ${count}건`
    : '전체 도시가 표시 중입니다.'
}
</script>

<template>
  <div class="dashboard-wrapper">
    <section v-show="showTip" class="tip-banner">
      카드를 클릭하면 상세정보가 펼쳐지고, 검색 후 Enter를 누르면 결과 건수가 표시됩니다.
      <!-- 한 번만 표시 -->
      <button class="btn-close" @click.once="showTip = false">닫기</button>
    </section>

    <section class="search-box">
      <h3>🔍 도시 검색</h3>
      <!-- 엔터 누르면 handleSearchEnter() 실행 -->
      <input
        type="text"
        :value="searchQuery"
        @input="(e) => (searchQuery = e.target.value)"
        @keyup.enter="handleSearchEnter"
        placeholder="검색할 도시 이름 입력 후 Enter"
      />
      <p>
        검색 중인 도시: <strong>{{ searchQuery }}</strong>
      </p>
    </section>

    <!-- computed / deep watch를 눈으로 확인할 수 있는 섹션 -->
    <section class="composition-monitor">
      <h3>🛰️ 반응형 상태 모니터링</h3>
      <p>
        평균 기온 (computed): <strong>{{ averageTemp }}°C</strong>
      </p>
      <button @click="randomizeTemp">무작위 도시 기온 변경 (deep watch)</button>
      <p class="log-text">{{ tempChangeLog }}</p>
    </section>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>

    <section class="list-box">
      <h3>🏙️ 지역별 날씨 현황</h3>

      <!-- 검색 결과가 없을 때 -->
      <p v-if="filteredWeatherList.length === 0" class="empty-message">검색 결과가 없습니다.</p>

      <!-- 검색 결과 필터링, 카드 2열 그리드 -->
      <div class="card-grid">
        <div
          v-for="item in filteredWeatherList"
          :key="item.id"
          class="weather-card"
          :style="{ borderLeftColor: item.temp >= 27 ? '#e74c3c' : '#3498db' }"
          @click="selectCity(item)"
        >
          <h4>{{ item.name }} {{ weatherEmojiMap[item.status] }}</h4>
          <p>지역 코드: {{ item.id }}</p>
          <p>현재 기온: {{ item.temp }}°C</p>

          <!-- 기온을 3단계로 분류 -->
          <span v-if="item.temp >= 27" class="badge hot">🔥 더움 (27도 이상)</span>
          <span v-else-if="item.temp >= 20" class="badge mild">🙂 적당함 (20~26도)</span>
          <span v-else class="badge cool">🥶 추움 (20도 미만)</span>

          <!-- 클릭되어 상세정보가 펼쳐진(expandedId) 카드만 보이게 -->
          <div v-show="expandedId === item.id" class="extra-info">
            <p>습도: {{ item.humidity }}%</p>
            <p>미세먼지: {{ item.dust }}</p>
          </div>

          <button class="btn-detail" @click.stop="showDetail(item.name, item.temp, item.status)">
            상세보기
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  max-width: 860px;
  margin: 0 auto;
  padding: 20px;
}

.tip-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background-color: #fff8e1;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
}

.btn-close {
  border-radius: 6px;
  padding: 4px 8px;
  background: rgb(255, 217, 92);
  color: #8d6e00;
  font-weight: bold;
}

.search-box {
  margin-bottom: 16px;
}

.search-box input {
  width: 100%;
  padding: 8px 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.status-bar {
  margin-bottom: 20px;
  padding: 10px;
  text-align: center;
  border-radius: 6px;
  font-weight: bold;
}

.composition-monitor {
  margin-bottom: 20px;
  padding: 12px 14px;
  background-color: #eef7ff;
  border: 1px solid #cfe6ff;
  border-radius: 8px;
  font-size: 14px;
}

.composition-monitor button {
  margin: 6px 0;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background-color: #3498db;
  color: #fff;
  cursor: pointer;
}

.log-text {
  color: #2471a3;
  font-weight: bold;
}

.empty-message {
  text-align: center;
  color: #e74c3c;
  padding: 10px 0;
}

/* 카드를 2열로 배치 (좁은 화면에서는 1열로 자동 축소) */
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

@media (max-width: 560px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.weather-card {
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  background-color: #fff;
  border: 1px solid #eee;
  border-left: 4px solid #3498db;
  border-radius: 8px;
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.weather-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.weather-card .badge {
  align-self: flex-start;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-top: 6px;
}

.badge.hot {
  background-color: #ffe0e0;
  color: #c0392b;
}

.badge.mild {
  background-color: #fff3cd;
  color: #8a6d00;
}

.badge.cool {
  background-color: #e0f0ff;
  color: #2471a3;
}

.extra-info {
  margin-top: 10px;
  padding: 8px 10px;
  background-color: #f7f9fa;
  border-radius: 6px;
  font-size: 13px;
}

.btn-detail {
  display: block;
  margin-top: 10px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background-color: #42b883;
  color: #fff;
  cursor: pointer;
}
</style>
