<script setup>
import { computed } from 'vue'

// 상위로부터 전달받을 도시 데이터, 상세정보 펼침 여부
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
})

// 상위로 송신할 커스텀 이벤트 등록
const emit = defineEmits(['select-card', 'click-detail'])

// 날씨 상태에 맞는 이모지
const weatherEmojiMap = {
  맑음: '☀️',
  비: '💧',
  구름: '☁️',
}

// 기온을 3단계로 분류 (뱃지 색상, 카드 테두리 색상에서 공통으로 재사용)
const tempLevel = computed(() => {
  if (props.cityItem.temp >= 27) return 'hot'
  if (props.cityItem.temp >= 20) return 'mild'
  return 'cool'
})

// 단계별 뱃지 문구
const badgeLabelMap = {
  hot: '🔥 더움 (27도 이상)',
  mild: '🙂 적당함 (20~26도)',
  cool: '🥶 추움 (20도 미만)',
}
</script>

<template>
  <div class="weather-card" :class="tempLevel" @click="emit('select-card', cityItem)">
    <h4>{{ cityItem.name }} {{ weatherEmojiMap[cityItem.status] }}</h4>
    <p>지역 코드: {{ cityItem.id }}</p>
    <p>현재 기온: {{ cityItem.temp }}°C</p>

    <!-- 뱃지 색상도 위와 같은 tempLevel을 그대로 재사용 -->
    <span class="badge" :class="tempLevel">{{ badgeLabelMap[tempLevel] }}</span>

    <!-- 부모가 내려준 isExpanded로 상세정보 패널 토글 -->
    <div v-show="isExpanded" class="extra-info">
      <p>습도: {{ cityItem.humidity }}%</p>
      <p>미세먼지: {{ cityItem.dust }}</p>
    </div>

    <button
      class="btn-detail"
      @click.stop="emit('click-detail', cityItem.name, cityItem.temp, cityItem.status)"
    >
      상세보기
    </button>
  </div>
</template>

<style scoped>
.weather-card {
  /* 뱃지와 카드 테두리가 공유하는 단계별 배경색/글자색 변수 */
  --tier-hot-bg: #ffe0e0;
  --tier-hot-text: #c0392b;
  --tier-mild-bg: #fff3cd;
  --tier-mild-text: #8a6d00;
  --tier-cool-bg: #e0f0ff;
  --tier-cool-text: #2471a3;

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

/* 카드 테두리 색도 뱃지의 배경색 변수를 그대로 재사용 */
.weather-card.hot {
  border-left-color: var(--tier-hot-bg);
}

.weather-card.mild {
  border-left-color: var(--tier-mild-bg);
}

.weather-card.cool {
  border-left-color: var(--tier-cool-bg);
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
  background-color: var(--tier-hot-bg);
  color: var(--tier-hot-text);
}

.badge.mild {
  background-color: var(--tier-mild-bg);
  color: var(--tier-mild-text);
}

.badge.cool {
  background-color: var(--tier-cool-bg);
  color: var(--tier-cool-text);
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
