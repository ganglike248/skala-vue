<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { useConfigStore } from '@/stores/configStore'
import { celsiusToFahrenheit } from '@/utils/weatherMath'

// 5일 최고/최저 기온 range 차트 - 최저~최고를 하나의 측정치(범위)로 보고
// sequential 블루 1색만 사용 (min/max를 서로 다른 카테고리로 취급하지 않음)
const props = defineProps({ daily: { type: Array, default: () => [] } })

const isDark = useDark()
const configStore = useConfigStore()
const toDisplay = (temp) => (configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(temp) : temp)

const BAR_LIGHT = '#2a78d6'
const BAR_DARK = '#3987e5'
const MUTED_LIGHT = '#5b6478'
const MUTED_DARK = '#93a0bd'
const GRID_LIGHT = '#e1e0d9'
const GRID_DARK = '#2c2c2a'

const formatDate = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('ko-KR', { weekday: 'short', day: 'numeric' })
}

const series = computed(() => [
  {
    name: `기온 범위(${configStore.unitSymbol})`,
    data: props.daily.map((day) => ({
      x: formatDate(day.date),
      y: [toDisplay(day.min), toDisplay(day.max)],
    })),
  },
])

// y축을 데이터 범위에 맞춰 직접 고정 - 자동 스케일링이 만드는 여백 때문에
// 막대 아래쪽이 축에서 붕 떠 보이는 문제를 해결 (가장 추운 날의 막대는 바닥에 붙게)
const yBounds = computed(() => {
  if (props.daily.length === 0) return { min: 0, max: 40 }
  const mins = props.daily.map((day) => toDisplay(day.min))
  const maxs = props.daily.map((day) => toDisplay(day.max))
  return { min: Math.min(...mins), max: Math.max(...maxs) + 2 }
})

const chartOptions = computed(() => {
  const dark = isDark.value
  const muted = dark ? MUTED_DARK : MUTED_LIGHT
  return {
    chart: {
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Pretendard, sans-serif',
      animations: { easing: 'easeinout', speed: 500 },
    },
    theme: { mode: dark ? 'dark' : 'light' },
    colors: [dark ? BAR_DARK : BAR_LIGHT],
    plotOptions: {
      bar: { horizontal: false, columnWidth: '42%', borderRadius: 6, borderRadiusApplication: 'end' },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}°`,
      style: { colors: [dark ? '#eef2fb' : '#10192b'], fontSize: '11px', fontWeight: 700 },
      offsetY: -2,
    },
    legend: { show: false },
    grid: {
      borderColor: dark ? GRID_DARK : GRID_LIGHT,
      xaxis: { lines: { show: false } },
      padding: { left: 8, right: 8 },
    },
    xaxis: {
      labels: { style: { colors: muted, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: yBounds.value.min,
      max: yBounds.value.max,
      forceNiceScale: false,
      labels: {
        formatter: (v) => `${Math.round(v)}°`,
        style: { colors: muted, fontSize: '11px' },
      },
    },
    tooltip: {
      theme: dark ? 'dark' : 'light',
      y: { formatter: (v) => `${v}${configStore.unitSymbol}` },
    },
  }
})
</script>

<template>
  <div class="daily-chart">
    <p class="chart-caption text-muted">5일 예보 (최저 ~ 최고)</p>
    <apexchart type="rangeBar" height="220" :options="chartOptions" :series="series" />
  </div>
</template>

<style scoped>
.chart-caption {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 4px;
}
</style>
