<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { useConfigStore } from '@/stores/configStore'
import { celsiusToFahrenheit } from '@/utils/weatherMath'

// dataviz 스킬 가이드: 단일 시리즈(기온) → sequential 블루 1색, 범례 없음,
// 영역은 ~10~35% 워시 그라디언트, 선 2px, 그리드는 헤어라인
const props = defineProps({ hourly: { type: Array, default: () => [] } })

const isDark = useDark()
const configStore = useConfigStore()
const toDisplay = (temp) => (configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(temp) : temp)

const LINE_LIGHT = '#1591dc'
const LINE_DARK = '#4bb8fa'
const MUTED_LIGHT = '#5b6478'
const MUTED_DARK = '#93a0bd'
const GRID_LIGHT = '#e1e0d9'
const GRID_DARK = '#2c2c2a'

const categories = computed(() =>
  props.hourly.map((item) =>
    new Date(item.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  ),
)

const series = computed(() => [
  { name: `기온(${configStore.unitSymbol})`, data: props.hourly.map((item) => toDisplay(item.temp)) },
])

const chartOptions = computed(() => {
  const dark = isDark.value
  const muted = dark ? MUTED_DARK : MUTED_LIGHT
  return {
    chart: {
      id: 'hourly-forecast',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
      fontFamily: 'Pretendard, sans-serif',
      animations: { easing: 'easeinout', speed: 500 },
    },
    theme: { mode: dark ? 'dark' : 'light' },
    colors: [dark ? LINE_DARK : LINE_LIGHT],
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90, 100] },
    },
    markers: { size: 0, hover: { size: 6 }, strokeWidth: 2, strokeColors: dark ? '#131b2e' : '#ffffff' },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      borderColor: dark ? GRID_DARK : GRID_LIGHT,
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      padding: { left: 8, right: 8 },
    },
    xaxis: {
      categories: categories.value,
      labels: { style: { colors: muted, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
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
  <div class="hourly-chart">
    <p class="chart-caption text-muted">오늘 시간별 기온</p>
    <apexchart type="area" height="220" :options="chartOptions" :series="series" />
  </div>
</template>

<style scoped>
.chart-caption {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 4px;
}
</style>
