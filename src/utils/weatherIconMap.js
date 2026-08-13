import photoClearDay from '@/assets/hero-photos/clear-day.jpg'
import photoClearNight from '@/assets/hero-photos/clear-night.jpg'
import photoClouds from '@/assets/hero-photos/clouds.jpg'
import photoRain from '@/assets/hero-photos/rain.jpg'
import photoThunder from '@/assets/hero-photos/thunder.jpg'
import photoSnow from '@/assets/hero-photos/snow.jpg'
import photoFog from '@/assets/hero-photos/fog.jpg'

// 날씨 조건별 무료 라이선스 사진 (Pexels, 출처 표기 불필요 라이선스) - 히어로 배경용
// App.vue(홈 전체 배경)와 WeatherDetailView.vue(예보 히어로 카드)가 함께 사용
export const HERO_PHOTOS = {
  'weather-gradient-clear-day': photoClearDay,
  'weather-gradient-clear-night': photoClearNight,
  'weather-gradient-clouds': photoClouds,
  'weather-gradient-rain': photoRain,
  'weather-gradient-thunder': photoThunder,
  'weather-gradient-snow': photoSnow,
  'weather-gradient-fog': photoFog,
}

// OpenWeatherMap 아이콘 코드(예: '10d') -> lucide 아이콘 이름 + 색상 매핑
// 앞 2자리: 날씨 종류, 마지막 글자: d(낮)/n(밤)
const ICON_MAP = {
  '01d': { icon: 'Sun', color: '#f5a623' },
  '01n': { icon: 'Moon', color: '#b8c6db' },
  '02d': { icon: 'CloudSun', color: '#f5a623' },
  '02n': { icon: 'CloudMoon', color: '#b8c6db' },
  '03d': { icon: 'Cloud', color: '#8fa3b8' },
  '03n': { icon: 'Cloud', color: '#8fa3b8' },
  '04d': { icon: 'Cloudy', color: '#7f8fa4' },
  '04n': { icon: 'Cloudy', color: '#7f8fa4' },
  '09d': { icon: 'CloudDrizzle', color: '#4a90d9' },
  '09n': { icon: 'CloudDrizzle', color: '#4a90d9' },
  '10d': { icon: 'CloudSunRain', color: '#4a90d9' },
  '10n': { icon: 'CloudMoonRain', color: '#4a90d9' },
  '11d': { icon: 'CloudLightning', color: '#8e44ad' },
  '11n': { icon: 'CloudLightning', color: '#8e44ad' },
  '13d': { icon: 'CloudSnow', color: '#5dade2' },
  '13n': { icon: 'CloudSnow', color: '#5dade2' },
  '50d': { icon: 'CloudFog', color: '#95a5a6' },
  '50n': { icon: 'CloudFog', color: '#95a5a6' },
}

const FALLBACK = { icon: 'Cloud', color: '#8fa3b8' }

export function resolveWeatherIcon(iconCode) {
  return ICON_MAP[iconCode] ?? FALLBACK
}

export function isDayIcon(iconCode) {
  return iconCode?.endsWith('d') ?? true
}

// 아이콘 코드 -> 히어로/배경에 쓰는 날씨별 그라디언트 클래스 (weather-theme.css)
export function resolveGradientClass(iconCode) {
  if (!iconCode) return 'weather-gradient-clouds'
  const group = iconCode.slice(0, 2)
  const isDay = isDayIcon(iconCode)
  if (group === '01') return isDay ? 'weather-gradient-clear-day' : 'weather-gradient-clear-night'
  if (['02', '03', '04'].includes(group)) return 'weather-gradient-clouds'
  if (['09', '10'].includes(group)) return 'weather-gradient-rain'
  if (group === '11') return 'weather-gradient-thunder'
  if (group === '13') return 'weather-gradient-snow'
  if (group === '50') return 'weather-gradient-fog'
  return 'weather-gradient-clouds'
}

// 날씨 상태에 맞는 파티클 연출 종류 결정 (WeatherParticles.vue)
// iconCode로 낮/밤을 구분해서 맑음일 때도 낮엔 반짝임, 밤엔 별빛을 다르게 보여줌
export function resolveParticleType(iconCode, conditionMain) {
  if (conditionMain === 'Thunderstorm') return 'thunder'
  if (['Rain', 'Drizzle'].includes(conditionMain)) return 'rain'
  if (conditionMain === 'Snow') return 'snow'
  if (conditionMain === 'Clear') return isDayIcon(iconCode) ? 'sparkle' : 'stars'
  if (conditionMain === 'Clouds') return 'clouds'
  if (['Mist', 'Fog', 'Haze', 'Smoke', 'Dust', 'Sand'].includes(conditionMain)) return 'mist'
  return null
}
