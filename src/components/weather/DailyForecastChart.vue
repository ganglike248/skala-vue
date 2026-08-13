<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { useConfigStore } from '@/stores/configStore'
import { celsiusToFahrenheit } from '@/utils/weatherMath'

// 5일 최저~최고 기온을 '바닥에서부터의 막대'가 아니라 '두 선 사이를 채운 밴드'로 표현.
// 막대 방식은 축 최솟값과 정확히 같은 날만 바닥에 닿고 나머지는 상대적으로 떠 보여서
// 계속 '깨진 것 같다'는 오해를 샀기 때문에, 애초에 '바닥에 닿아야 한다'는 기준 자체가
// 없는 밴드 차트로 바꿔서 그 오해를 원천적으로 없앰
const props = defineProps({ daily: { type: Array, default: () => [] } })

const isDark = useDark()
const configStore = useConfigStore()
const toDisplay = (temp) => (configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(temp) : temp)

const LINE_LIGHT = '#769fcd'
const LINE_DARK = '#d6e6f2'
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

// 밴드가 축 위아래로 여유 있게 숨 쉬도록 데이터 범위보다 살짝 넉넉하게
const yBounds = computed(() => {
  if (props.daily.length === 0) return { min: 0, max: 40 }
  const mins = props.daily.map((day) => toDisplay(day.min))
  const maxs = props.daily.map((day) => toDisplay(day.max))
  return { min: Math.min(...mins) - 2, max: Math.max(...maxs) + 2 }
})

const chartOptions = computed(() => {
  const dark = isDark.value
  const line = dark ? LINE_DARK : LINE_LIGHT
  const muted = dark ? MUTED_DARK : MUTED_LIGHT
  return {
    chart: {
      type: 'rangeArea',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Pretendard, sans-serif',
      animations: { easing: 'easeinout', speed: 500 },
    },
    theme: { mode: dark ? 'dark' : 'light' },
    colors: [line],
    fill: { opacity: 0.28 },
    stroke: { curve: 'straight', width: 2 },
    markers: { size: 4, strokeWidth: 2, strokeColors: dark ? '#131b2e' : '#ffffff', hover: { size: 6 } },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}°`,
      style: { colors: [dark ? '#eef2fb' : '#10192b'], fontSize: '11px', fontWeight: 700 },
      offsetY: -6,
      background: { enabled: false },
    },
    legend: { show: false },
    grid: {
      borderColor: dark ? GRID_DARK : GRID_LIGHT,
      xaxis: { lines: { show: false } },
      padding: { left: 8, right: 8, top: 10 },
    },
    xaxis: {
      labels: { style: { colors: muted, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: yBounds.value.min,
      max: yBounds.value.max,
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
    <apexchart type="rangeArea" height="220" :options="chartOptions" :series="series" />
  </div>
</template>

<style scoped>
.chart-caption {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 4px;
}
</style>
