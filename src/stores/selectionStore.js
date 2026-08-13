import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

// 홈/예보/지도/즐겨찾기 화면이 공유하는 '현재 선택된 지역' 상태.
// 기본값은 'me'(내 위치), 다른 도시를 고르면 새로고침해도 유지되도록 저장.
export const useSelectionStore = defineStore('selection', () => {
  const selectedCityId = useStorage('weather-selected-city', 'me')

  function selectCity(id) {
    if (id) selectedCityId.value = id
  }

  return { selectedCityId, selectCity }
})
