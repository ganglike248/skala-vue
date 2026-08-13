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
    <div class="section-title"><Gauge :size="18" />오늘의 불쾌지수</div>
    <div class="value" :style="{ color: level.color }">{{ di }}</div>
    <p class="grade">
      <strong :style="{ color: level.color }">{{ level.grade }}</strong>
      <span class="text-muted"> · {{ level.message }}</span>
    </p>
    <div class="meter">
      <div class="meter-fill" :style="{ width: meterWidth + '%', backgroundColor: level.color }" />
    </div>
  </div>
</template>

<style scoped>
.discomfort-card {
  padding: 20px 22px;
}
.value {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 6px 0 4px;
}
.grade {
  font-size: 0.82rem;
  margin-bottom: 14px;
}
.meter {
  height: 8px;
  border-radius: 999px;
  background: rgba(127, 143, 164, 0.18);
  overflow: hidden;
}
.meter-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}
</style>
