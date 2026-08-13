import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import OPENWEATHER_API_KEY from '@/env.js'

// API로는 가져올 수 없는 표시용 고정 정보(도시명, 전체 지역명, 좌표)
// OpenWeatherMap Current Weather API는 위도/경도 기준으로 호출
const CITY_META = [
  { id: 'city_01', name: '서울', region: '대한민국 서울특별시', lat: 37.5665, lon: 126.978 },
  { id: 'city_02', name: '수원', region: '대한민국 경기도 수원시', lat: 37.2636, lon: 127.0286 },
  { id: 'city_03', name: '부산', region: '대한민국 부산광역시', lat: 35.1796, lon: 129.0756 },
  { id: 'city_04', name: '제주', region: '대한민국 제주특별자치도', lat: 33.4996, lon: 126.5312 },
  { id: 'city_05', name: '대전', region: '대한민국 대전광역시', lat: 36.3504, lon: 127.3845 },
  { id: 'city_06', name: '광주', region: '대한민국 광주광역시', lat: 35.1595, lon: 126.8526 },
]

// OpenWeatherMap의 영문 날씨 대분류(weather[0].main)를 기존 화면이 쓰던 3단계로 정규화
// (WeatherCard의 이모지 맵이 '맑음'/'비'/'구름' 키만 갖고 있어서 그대로 맞춰줌)
function normalizeStatus(mainCondition) {
  if (mainCondition === 'Clear') return '맑음'
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(mainCondition)) return '비'
  return '구름' // Clouds, Snow, Mist, Fog, Haze 등은 모두 '구름'으로 묶음
}

export const useWeatherStore = defineStore('weather', () => {
  // state: 도시별 실시간 날씨 (id, name, region, temp, feelsLike, humidity, windSpeed, status, description)
  const weatherList = ref([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref(null)

  // getters: 도시 코드로 바로 찾기 위한 맵 (상세 페이지용)
  const cityDetailMap = computed(() => {
    const map = {}
    weatherList.value.forEach((city) => {
      map[city.id] = city
    })
    return map
  })

  // actions: 등록된 6개 도시의 날씨를 한 번에 병렬로 호출
  async function fetchAll() {
    console.log(`🌐 OpenWeatherMap API 통신 시작 (${CITY_META.length}개 도시)`)
    isLoading.value = true
    error.value = null

    try {
      const responses = await Promise.all(
        CITY_META.map((city) =>
          axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
              lat: city.lat,
              lon: city.lon,
              appid: OPENWEATHER_API_KEY,
              units: 'metric',
              lang: 'kr',
            },
          }),
        ),
      )

      weatherList.value = responses.map((response, index) => {
        const city = CITY_META[index]
        const data = response.data
        // 도시별 API 원본 응답을 그대로 확인 (실제 서버 통신 결과임을 검증)
        console.log(`✅ [${city.name}] API 응답:`, data)
        return {
          id: city.id,
          name: city.name,
          region: city.region,
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          status: normalizeStatus(data.weather[0].main),
          description: data.weather[0].description,
        }
      })
      isLoaded.value = true
      console.log('🌤️ 전체 도시 날씨 데이터 갱신 완료:', weatherList.value)
    } catch (err) {
      console.error('날씨 데이터를 가져오지 못했습니다:', err)
      error.value = '날씨 정보를 불러오지 못했습니다. API 키와 네트워크 상태를 확인해주세요.'
    } finally {
      isLoading.value = false
    }
  }

  // 이미 불러온 상태거나 로딩 중이면 재요청하지 않음
  // (Home/Detail/Stats 화면이 각자 onMounted에서 호출해도 중복 API 호출 방지)
  function ensureLoaded() {
    if (!isLoaded.value && !isLoading.value) {
      fetchAll()
    }
  }

  return {
    weatherList,
    cityDetailMap,
    isLoading,
    isLoaded,
    error,
    fetchAll,
    ensureLoaded,
  }
})
