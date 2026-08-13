// 날씨 원본 수치를 화면에 쓰기 좋은 형태로 가공하는 순수 함수 모음
// (컴포넌트/스토어 어디서든 재사용할 수 있도록 별도 유틸로 분리)

// 불쾌지수(DI) 계산 - 기상청 공식 기반
// DI = 0.81 * T + 0.01 * H * (0.99 * T - 14.3) + 46.3
export function calcDiscomfortIndex(tempC, humidityPct) {
  return Math.round(
    (0.81 * tempC + 0.01 * humidityPct * (0.99 * tempC - 14.3) + 46.3) * 10,
  ) / 10
}

// 불쾌지수 구간별 등급/문구/색상
export function discomfortLevel(di) {
  if (di >= 80) return { grade: '매우 높음', message: '대부분 불쾌감을 느껴요', color: '#e74c3c' }
  if (di >= 75) return { grade: '높음', message: '절반 정도가 불쾌감을 느껴요', color: '#e67e22' }
  if (di >= 68) return { grade: '보통', message: '일부가 불쾌감을 느껴요', color: '#f1c40f' }
  return { grade: '낮음', message: '대부분 쾌적하게 느껴요', color: '#2ecc71' }
}

// OpenWeatherMap Air Pollution API의 1~5 지수를 등급/색상으로 변환
const AQI_LEVELS = {
  1: { grade: '좋음', color: '#2ecc71' },
  2: { grade: '보통', color: '#a3d977' },
  3: { grade: '민감군 주의', color: '#f1c40f' },
  4: { grade: '나쁨', color: '#e67e22' },
  5: { grade: '매우 나쁨', color: '#e74c3c' },
}
export function aqiLevel(aqi) {
  return AQI_LEVELS[aqi] ?? { grade: '알 수 없음', color: '#95a5a6' }
}

// 현재 날씨/대기질을 바탕으로 한 줄 준비물 추천 (재미 + 실용 요소)
export function buildAdvice({ temp, windSpeed, description, aqi }) {
  const tips = []

  if (description?.includes('비') || description?.includes('소나기')) {
    tips.push({ icon: 'Umbrella', text: '우산을 챙기세요' })
  }
  if (description?.includes('눈')) {
    tips.push({ icon: 'Snowflake', text: '미끄럼 주의, 방한화를 신어보세요' })
  }
  if (temp !== undefined && temp <= 5) {
    tips.push({ icon: 'Shirt', text: '두꺼운 겉옷이 필요해요' })
  } else if (temp !== undefined && temp >= 28) {
    tips.push({ icon: 'GlassWater', text: '수분 섭취를 충분히 하세요' })
  }
  if (windSpeed !== undefined && windSpeed >= 8) {
    tips.push({ icon: 'Wind', text: '바람이 강해요, 소지품을 조심하세요' })
  }
  if (aqi !== undefined && aqi >= 4) {
    tips.push({ icon: 'Wind', text: '미세먼지가 나빠요, 마스크를 챙기세요' })
  }
  if (tips.length === 0) {
    tips.push({ icon: 'Smile', text: '외출하기 좋은 날씨예요' })
  }

  return tips.slice(0, 3)
}

// 섭씨 -> 화씨
export function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32)
}

// m/s -> mph
export function msToMph(ms) {
  return Math.round(ms * 2.237 * 10) / 10
}
