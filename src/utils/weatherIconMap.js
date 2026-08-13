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

// 비/눈일 때만 파티클 연출 (WeatherParticles.vue)
export function resolveParticleType(conditionMain) {
  if (['Rain', 'Drizzle'].includes(conditionMain)) return 'rain'
  if (conditionMain === 'Snow') return 'snow'
  return null
}
