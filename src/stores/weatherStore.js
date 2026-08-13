import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import axios from 'axios'
import OPENWEATHER_API_KEY from '@/env.js'

const BASE_WEATHER_URL = 'https://api.openweathermap.org/data/2.5'
const BASE_GEO_URL = 'https://api.openweathermap.org/geo/1.0'

// API로는 가져올 수 없는 표시용 고정 정보(도시명, 전체 지역명, 좌표)
// 기존 6개 도시는 항상 지역별 날씨 화면에 고정 노출
export const CITY_META = [
  { id: 'city_01', name: '서울', region: '대한민국 서울특별시', lat: 37.5665, lon: 126.978 },
  { id: 'city_02', name: '수원', region: '대한민국 경기도 수원시', lat: 37.2636, lon: 127.0286 },
  { id: 'city_03', name: '부산', region: '대한민국 부산광역시', lat: 35.1796, lon: 129.0756 },
  { id: 'city_04', name: '제주', region: '대한민국 제주특별자치도', lat: 33.4996, lon: 126.5312 },
  { id: 'city_05', name: '대전', region: '대한민국 대전광역시', lat: 36.3504, lon: 127.3845 },
  { id: 'city_06', name: '광주', region: '대한민국 광주광역시', lat: 35.1595, lon: 126.8526 },
]

// geolocation 실패 시 홈 화면이 기본으로 보여줄 위치
const FALLBACK_LOCATION = { name: '서울', region: '대한민국 서울특별시', lat: 37.5665, lon: 126.978 }

function buildCustomId(lat, lon) {
  return `custom_${Math.round(lat * 100)}_${Math.round(lon * 100)}`
}

// 현재 날씨 원본 응답 -> 화면에서 바로 쓰기 좋은 형태로 정규화
function normalizeCurrent(data) {
  return {
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    visibility: data.visibility,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    iconCode: data.weather[0].icon,
    conditionMain: data.weather[0].main,
    description: data.weather[0].description,
    sunrise: data.sys.sunrise * 1000,
    sunset: data.sys.sunset * 1000,
    observedAt: data.dt * 1000,
  }
}

// 5일/3시간 예보 원본 -> 오늘 시간별 스트립 + 5일 요약으로 가공
function normalizeForecast(list) {
  const hourly = list.slice(0, 8).map((item) => ({
    time: item.dt * 1000,
    temp: Math.round(item.main.temp),
    iconCode: item.weather[0].icon,
    description: item.weather[0].description,
    pop: Math.round((item.pop ?? 0) * 100),
  }))

  const byDate = new Map()
  list.forEach((item) => {
    const date = item.dt_txt.slice(0, 10)
    if (!byDate.has(date)) byDate.set(date, [])
    byDate.get(date).push(item)
  })

  const daily = Array.from(byDate.entries())
    .slice(0, 5)
    .map(([date, items]) => {
      const temps = items.map((item) => item.main.temp)
      // 정오에 가까운 항목을 그날의 대표 날씨로 사용 (없으면 첫 항목)
      const noonItem = items.find((item) => item.dt_txt.includes('12:00:00')) ?? items[0]
      const pops = items.map((item) => item.pop ?? 0)
      return {
        date,
        min: Math.round(Math.min(...temps)),
        max: Math.round(Math.max(...temps)),
        iconCode: noonItem.weather[0].icon,
        description: noonItem.weather[0].description,
        pop: Math.round(Math.max(...pops) * 100),
      }
    })

  return { hourly, daily }
}

function normalizeAirQuality(data) {
  const item = data.list[0]
  return {
    aqi: item.main.aqi,
    components: item.components,
  }
}

// Geocoding 응답 항목 -> 검색 결과 후보로 가공 (아직 즐겨찾기/추가 전 상태)
function normalizeGeoResult(item) {
  const name = item.local_names?.ko ?? item.name
  const region = [item.state, item.country].filter(Boolean).join(' ')
  return { name, region, lat: item.lat, lon: item.lon }
}

export const useWeatherStore = defineStore('weather', () => {
  // state: 도시 id -> { id, name, region, lat, lon, current, forecast, airQuality, isLoadingCurrent, isLoadingDetail, error }
  const entries = reactive({})

  // 사용자가 검색으로 추가한 도시 메타(좌표 등)는 새로고침해도 남도록 로컬 저장
  const customCities = useStorage('weather-custom-cities', [])

  const isSearching = ref(false)
  const searchResults = ref([])
  const searchError = ref(null)

  const myLocationStatus = ref('idle') // idle | loading | ready | denied | error

  function ensureEntry(meta) {
    if (!entries[meta.id]) {
      entries[meta.id] = {
        id: meta.id,
        name: meta.name,
        region: meta.region,
        lat: meta.lat,
        lon: meta.lon,
        current: null,
        forecast: null,
        airQuality: null,
        isLoadingCurrent: false,
        isLoadingDetail: false,
        error: null,
      }
    }
    return entries[meta.id]
  }

  // 초기 메타 등록 (6개 고정 도시 + 저장된 커스텀 도시)
  CITY_META.forEach((city) => ensureEntry({ ...city }))
  customCities.value.forEach((city) => ensureEntry({ ...city }))

  // actions: 카드 그리드용 - 현재 날씨만 가볍게 조회
  async function fetchCurrent(id) {
    const entry = entries[id]
    if (!entry || entry.isLoadingCurrent) return
    entry.isLoadingCurrent = true
    entry.error = null
    try {
      const response = await axios.get(`${BASE_WEATHER_URL}/weather`, {
        params: { lat: entry.lat, lon: entry.lon, appid: OPENWEATHER_API_KEY, units: 'metric', lang: 'kr' },
      })
      console.log(`✅ [${entry.name}] 현재 날씨 API 응답:`, response.data)
      entry.current = normalizeCurrent(response.data)
    } catch (err) {
      console.error(`날씨 조회 실패 (${entry.name}):`, err)
      entry.error = '날씨 정보를 불러오지 못했습니다.'
    } finally {
      entry.isLoadingCurrent = false
    }
  }

  // actions: 상세 페이지용 - 현재 + 예보 + 대기질을 한 번에 병렬 조회
  async function fetchDetail(id) {
    const entry = entries[id]
    if (!entry) return
    if (entry.current && entry.forecast && entry.airQuality) return // 이미 로드됨
    if (entry.isLoadingDetail) return

    entry.isLoadingDetail = true
    entry.error = null
    try {
      const params = { lat: entry.lat, lon: entry.lon, appid: OPENWEATHER_API_KEY, units: 'metric', lang: 'kr' }
      const [currentRes, forecastRes, airRes] = await Promise.all([
        axios.get(`${BASE_WEATHER_URL}/weather`, { params }),
        axios.get(`${BASE_WEATHER_URL}/forecast`, { params }),
        axios.get(`${BASE_WEATHER_URL}/air_pollution`, { params: { lat: entry.lat, lon: entry.lon, appid: OPENWEATHER_API_KEY } }),
      ])
      console.log(`🌤️ [${entry.name}] 상세 데이터 API 응답:`, {
        current: currentRes.data,
        forecast: forecastRes.data,
        air: airRes.data,
      })
      entry.current = normalizeCurrent(currentRes.data)
      entry.forecast = normalizeForecast(forecastRes.data.list)
      entry.airQuality = normalizeAirQuality(airRes.data)
    } catch (err) {
      console.error(`상세 날씨 조회 실패 (${entry.name}):`, err)
      entry.error = '상세 날씨 정보를 불러오지 못했습니다.'
    } finally {
      entry.isLoadingDetail = false
    }
  }

  // 6개 고정 도시 + 저장된 커스텀 도시의 현재 날씨를 한 번에 로드 (지역별 날씨 화면 진입 시)
  function loadAllCurrent() {
    const ids = [...CITY_META.map((c) => c.id), ...customCities.value.map((c) => c.id)]
    ids.forEach((id) => {
      const entry = entries[id]
      if (entry && !entry.current) fetchCurrent(id)
    })
  }

  // 도시 이름으로 검색 (Geocoding API) - 아직 추가/저장하지 않고 후보만 반환
  async function searchCity(query) {
    const keyword = query.trim()
    if (!keyword) {
      searchResults.value = []
      return
    }
    isSearching.value = true
    searchError.value = null
    try {
      const response = await axios.get(`${BASE_GEO_URL}/direct`, {
        params: { q: keyword, limit: 5, appid: OPENWEATHER_API_KEY },
      })
      searchResults.value = response.data.map(normalizeGeoResult)
    } catch (err) {
      console.error('도시 검색 실패:', err)
      searchError.value = '도시를 검색하지 못했습니다.'
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  // 검색 결과를 '지역별 날씨' 목록에 커스텀 도시로 추가
  function addCustomCity(candidate) {
    const id = buildCustomId(candidate.lat, candidate.lon)
    if (!customCities.value.some((c) => c.id === id)) {
      customCities.value.push({ id, ...candidate })
    }
    ensureEntry({ id, ...candidate })
    fetchCurrent(id)
    return id
  }

  function removeCustomCity(id) {
    customCities.value = customCities.value.filter((c) => c.id !== id)
    delete entries[id]
  }

  // '내 위치' 항목을 새 좌표/이름으로 (재)생성 - 기존 데이터가 있어도 완전히 새로 채워서
  // fetchDetail이 새 좌표 기준으로 다시 조회하도록 함
  function resetMyLocationEntry(meta) {
    entries.me = {
      id: 'me',
      name: meta.name,
      region: meta.region,
      lat: meta.lat,
      lon: meta.lon,
      current: null,
      forecast: null,
      airQuality: null,
      isLoadingCurrent: false,
      isLoadingDetail: false,
      error: null,
    }
  }

  // 브라우저 geolocation 좌표로 '내 위치' 항목을 채움 (id: 'me')
  async function fetchMyLocation(lat, lon) {
    myLocationStatus.value = 'loading'
    try {
      const geoRes = await axios.get(`${BASE_GEO_URL}/reverse`, {
        params: { lat, lon, limit: 1, appid: OPENWEATHER_API_KEY },
      })
      const place = geoRes.data[0]
      resetMyLocationEntry(
        place
          ? { name: place.local_names?.ko ?? place.name, region: [place.state, place.country].filter(Boolean).join(' '), lat, lon }
          : { name: '내 위치', region: '', lat, lon },
      )
      await fetchDetail('me')
      myLocationStatus.value = 'ready'
    } catch (err) {
      console.error('내 위치 날씨 조회 실패:', err)
      myLocationStatus.value = 'error'
    }
  }

  // geolocation 권한 거부/실패 시 기본 위치(서울)로 대체
  async function fetchFallbackLocation() {
    myLocationStatus.value = 'loading'
    resetMyLocationEntry(FALLBACK_LOCATION)
    await fetchDetail('me')
    myLocationStatus.value = 'denied'
  }

  // 위치 권한을 나중에 허용했을 때 다시 시도할 수 있도록 상태만 초기화
  function resetMyLocation() {
    myLocationStatus.value = 'idle'
  }

  // getters
  const coreCities = computed(() => CITY_META.map((c) => entries[c.id]).filter(Boolean))
  const customCityList = computed(() => customCities.value.map((c) => entries[c.id]).filter(Boolean))
  const allCities = computed(() => [...coreCities.value, ...customCityList.value])

  // 통계 페이지 등에서 쓰기 좋은 평탄화 배열 (현재 날씨가 로드된 도시만)
  const weatherList = computed(() =>
    allCities.value
      .filter((entry) => entry.current)
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        region: entry.region,
        temp: entry.current.temp,
        feelsLike: entry.current.feelsLike,
        humidity: entry.current.humidity,
        windSpeed: entry.current.windSpeed,
        iconCode: entry.current.iconCode,
        description: entry.current.description,
      })),
  )

  return {
    entries,
    customCities,
    isSearching,
    searchResults,
    searchError,
    myLocationStatus,
    coreCities,
    customCityList,
    allCities,
    weatherList,
    fetchCurrent,
    fetchDetail,
    loadAllCurrent,
    searchCity,
    addCustomCity,
    removeCustomCity,
    fetchMyLocation,
    fetchFallbackLocation,
    resetMyLocation,
  }
})
