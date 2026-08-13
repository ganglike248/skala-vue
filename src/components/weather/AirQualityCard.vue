<script setup>
import { computed } from 'vue'
import { Wind } from '@lucide/vue'
import { aqiLevel } from '@/utils/weatherMath'

const props = defineProps({
  aqi: { type: Number, required: true },
  components: { type: Object, required: true },
})

const level = computed(() => aqiLevel(props.aqi))
</script>

<template>
  <div class="aqi-card glass-card">
    <div class="section-title">
      <Wind :size="18" />
      대기질
      <span class="badge" :style="{ backgroundColor: level.color }">{{ level.grade }}</span>
    </div>
    <div class="metrics">
      <div class="metric">
        <span class="label text-muted">미세먼지</span>
        <strong>{{ Math.round(components.pm10) }}</strong>
        <span class="unit text-muted">µg/m³</span>
      </div>
      <div class="metric">
        <span class="label text-muted">초미세먼지</span>
        <strong>{{ Math.round(components.pm2_5) }}</strong>
        <span class="unit text-muted">µg/m³</span>
      </div>
      <div class="metric">
        <span class="label text-muted">이산화질소</span>
        <strong>{{ Math.round(components.no2) }}</strong>
        <span class="unit text-muted">µg/m³</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aqi-card {
  padding: 20px 22px;
}
.badge {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: rgba(127, 143, 164, 0.08);
}
.metric .label {
  font-size: 0.7rem;
}
.metric strong {
  font-size: 1.15rem;
}
.metric .unit {
  font-size: 0.65rem;
}
</style>
