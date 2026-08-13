<script setup>
import { computed } from 'vue'
import { Gauge } from '@lucide/vue'
import { calcDiscomfortIndex, discomfortLevel } from '@/utils/weatherMath'

// 재미 + 실용 위젯: 온도/습도로 계산한 오늘의 불쾌지수
const props = defineProps({
  temp: { type: Number, required: true },
  humidity: { type: Number, required: true },
})

const di = computed(() => calcDiscomfortIndex(props.temp, props.humidity))
const level = computed(() => discomfortLevel(di.value))
const meterWidth = computed(() => Math.min(100, Math.max(4, (di.value / 90) * 100)))
</script>

<template>
  <div class="discomfort-card glass-card">
    <div class="card-head">
      <span class="card-icon" :style="{ color: level.color, background: level.color + '1a' }"
        ><Gauge :size="16"
      /></span>
      <div>
        <p class="card-title">오늘의 불쾌지수</p>
        <p class="card-value">
          {{ di }}<small class="text-muted"> · {{ level.grade }}</small>
        </p>
      </div>
    </div>
    <div class="meter-track">
      <div class="meter-thumb" :style="{ left: meterWidth + '%' }" />
    </div>
    <p class="message text-muted">{{ level.message }}</p>
  </div>
</template>

<style scoped>
.discomfort-card {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  /* 옆 카드(대기질)보다 내용이 짧아 늘어났을 때 아래가 비어 보이지 않도록 내용을 고르게 분산 */
  justify-content: space-between;
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
.message {
  font-size: 0.8rem;
  margin-top: -6px;
}
</style>
