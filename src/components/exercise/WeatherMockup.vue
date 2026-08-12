<script setup>
import { ref } from 'vue'

// 제주, 대전, 광주 + 습도(humidity), 미세먼지(dust) 필드 추가
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 24, status: '맑음', humidity: 55, dust: '보통' },
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

// 검색어에 따른 필터링된 리스트 반환
const filteredList = () => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return weatherList.value
  return weatherList.value.filter((item) => item.name.includes(keyword))
}

// 날씨 상태에 맞는 이모지
const weatherEmojiMap = {
  맑음: '☀️',
  비: '💧',
  구름: '☁️',
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
  const count = filteredList().length
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

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>

    <section class="list-box">
      <h3>🏙️ 지역별 날씨 현황</h3>

      <!-- 검색 결과가 없을 때 -->
      <p v-if="filteredList().length === 0" class="empty-message">검색 결과가 없습니다.</p>

      <!-- 검색 결과 필터링 -->
      <div
        v-for="item in filteredList()"
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
    </section>
  </div>
</template>

<style scoped>
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

.badge.hot {
  background-color: #ffe0e0;
  color: red;
}

.badge.mild {
  background-color: #fff3cd;
  color: #8a6d00;
}

.badge.cool {
  background-color: #e0f0ff;
  color: blue;
}

.extra-info {
  margin-top: 10px;
  padding: 8px 10px;
  background-color: #f7f9fa;
  border-radius: 6px;
  font-size: 13px;
}

.btn-detail {
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.status-bar {
  margin-bottom: 10px;
}
</style>
