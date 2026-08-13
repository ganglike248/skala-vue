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

// OpenWeatherMap이 주는 한국어 설명은 조건 코드(id)별로 어색한 직역이 많음
// (예: '온흐림'=overcast clouds, '튼구름'=broken clouds, '실 비'=drizzle).
// id(숫자, 로케일과 무관하게 항상 동일)를 기준으로 자연스러운 한국어 표현으로 바꿔줌
const DESCRIPTION_MAP = {
  200: '비를 동반한 천둥번개',
  201: '비를 동반한 천둥번개',
  202: '강한 비를 동반한 천둥번개',
  210: '약한 천둥번개',
  211: '천둥번개',
  212: '강한 천둥번개',
  221: '천둥번개',
  230: '이슬비를 동반한 천둥번개',
  231: '이슬비를 동반한 천둥번개',
  232: '강한 이슬비를 동반한 천둥번개',
  300: '약한 이슬비',
  301: '이슬비',
  302: '강한 이슬비',
  310: '약한 이슬비',
  311: '이슬비',
  312: '강한 이슬비',
  313: '소나기와 이슬비',
  314: '강한 소나기와 이슬비',
  321: '소나기성 이슬비',
  500: '약한 비',
  501: '비',
  502: '강한 비',
  503: '매우 강한 비',
  504: '폭우',
  511: '어는 비',
  520: '약한 소나기',
  521: '소나기',
  522: '강한 소나기',
  531: '소나기',
  600: '약한 눈',
  601: '눈',
  602: '폭설',
  611: '진눈깨비',
  612: '약한 진눈깨비',
  613: '진눈깨비',
  615: '비와 눈',
  616: '비와 눈',
  620: '약한 소나기눈',
  621: '소나기눈',
  622: '강한 소나기눈',
  701: '옅은 안개',
  711: '연무',
  721: '실안개',
  731: '흙먼지',
  741: '안개',
  751: '모래바람',
  761: '흙먼지',
  762: '화산재',
  771: '돌풍',
  781: '토네이도',
  800: '맑음',
  801: '구름 조금',
  802: '구름 많음',
  803: '구름 많음',
  804: '흐림',
}
export function friendlyDescription(id, fallback) {
  return DESCRIPTION_MAP[id] ?? fallback
}

// 시간별 예보 스트립의 라벨을 만듦: 첫 항목은 '지금', 그 외엔 'N시',
// 자정을 넘어 날짜가 바뀌는 지점에는 'M/D N시'로 날짜를 함께 표시
export function formatHourLabel(hourly, idx) {
  if (idx === 0) return '지금'
  const current = new Date(hourly[idx].time)
  const previous = new Date(hourly[idx - 1].time)
  const hourLabel = current.toLocaleTimeString('ko-KR', { hour: 'numeric' })
  const crossedDay = current.toDateString() !== previous.toDateString()
  if (!crossedDay) return hourLabel
  const dateLabel = current.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
  return `${dateLabel} ${hourLabel}`
}

// 섭씨 -> 화씨
export function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32)
}

// m/s -> mph
export function msToMph(ms) {
  return Math.round(ms * 2.237 * 10) / 10
}
