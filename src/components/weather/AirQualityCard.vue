<script setup>
import { computed } from 'vue'
import { Wind } from '@lucide/vue'
import { aqiLevel } from '@/utils/weatherMath'

const props = defineProps({
  aqi: { type: Number, required: true },
  components: { type: Object, required: true },
})

const level = computed(() => aqiLevel(props.aqi))
// 대기질 1~5 지수를 0~100% 위치로 환산해 무지개 미터 위 썸을 배치
const meterPct = computed(() => Math.min(100, Math.max(4, ((props.aqi - 1) / 4) * 100)))
</script>

<template>
  <div class="aqi-card glass-card">
    <div class="card-head">
      <span class="card-icon"><Wind :size="16" /></span>
      <div>
        <p class="card-title">대기질 지수</p>
        <p class="card-value">
          {{ aqi }}<small class="text-muted"> · {{ level.grade }}</small>
        </p>
      </div>
    </div>

    <div class="meter-track">
      <div class="meter-thumb" :style="{ left: meterPct + '%' }" />
    </div>

    <div class="metrics">
      <div class="metric">
        <span class="label text-muted">PM10</span>
        <strong>{{ Math.round(components.pm10) }}</strong>
      </div>
      <div class="metric">
        <span class="label text-muted">PM2.5</span>
        <strong>{{ Math.round(components.pm2_5) }}</strong>
      </div>
      <div class="metric">
        <span class="label text-muted">NO₂</span>
        <strong>{{ Math.round(components.no2) }}</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aqi-card {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  color: var(--color-primary);
  background: rgba(52, 120, 246, 0.1);
  flex-shrink: 0;
}
.card-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted);
}
.card-value {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.3;
}
.card-value small {
  font-size: 0.78rem;
  font-weight: 600;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  text-align: center;
}
.metric .label {
  font-size: 0.65rem;
  font-weight: 700;
}
.metric strong {
  font-size: 0.95rem;
}
</style>
