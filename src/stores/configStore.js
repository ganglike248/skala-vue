import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  // 1. state: 단위를 저장하는 변수 (초기값은 'celsius')
  // 값은 오직 'celsius' 또는 'fahrenheit' 두 가지만 가집니다.
  const unit = ref('celsius')

  // 2. getters: 현재 단위 상태에 맞춰 화면에 뿌릴 기호(℃ / ℉)를 실시간 리턴
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉'
  })

  // 3. actions: 버튼 클릭 시 'celsius'와 'fahrenheit'를 토글(스위칭)하는 함수
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  // 4. state: 풍속 단위를 저장하는 변수 (초기값은 'ms')
  // 값은 오직 'ms'(m/s) 또는 'mph' 두 가지만 가집니다.
  const windSpeedUnit = ref('ms')

  // 5. getters: 현재 풍속 단위 상태에 맞춰 화면에 뿌릴 기호를 실시간 리턴
  const windSpeedSymbol = computed(() => {
    return windSpeedUnit.value === 'ms' ? 'm/s' : 'mph'
  })

  // 6. actions: 버튼 클릭 시 'ms'와 'mph'를 토글(스위칭)하는 함수
  function toggleWindSpeedUnit() {
    windSpeedUnit.value = windSpeedUnit.value === 'ms' ? 'mph' : 'ms'
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
    windSpeedUnit,
    windSpeedSymbol,
    toggleWindSpeedUnit,
  }
})
