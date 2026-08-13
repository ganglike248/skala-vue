<script setup>
import { computed } from 'vue'
import { Sunrise, Sunset } from '@lucide/vue'

const props = defineProps({
  sunrise: { type: Number, required: true }, // ms epoch
  sunset: { type: Number, required: true },
})

const progress = computed(() => {
  const now = Date.now()
  const ratio = (now - props.sunrise) / (props.sunset - props.sunrise)
  return Math.min(100, Math.max(0, ratio * 100))
})

const formatTime = (ms) => new Date(ms).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

const remainingLabel = computed(() => {
  const now = Date.now()
  if (now < props.sunrise) {
    return `일출까지 ${Math.round((props.sunrise - now) / 60000)}분 남았어요`
  }
  if (now < props.sunset) {
    return `일몰까지 ${Math.round((props.sunset - now) / 60000)}분 남았어요`
  }
  return '오늘 해가 이미 졌어요'
})
</script>

<template>
  <div class="daylight-card glass-card">
    <div class="card-head">
      <span class="card-icon"><Sunrise :size="16" /></span>
      <div>
        <p class="card-title">오늘의 햇빛</p>
        <p class="remaining">{{ remainingLabel }}</p>
      </div>
    </div>
    <div class="track">
      <div class="track-fill" :style="{ width: progress + '%' }" />
      <div class="track-dot" :style="{ left: `calc(${progress}% - 7px)` }" />
    </div>
    <div class="times">
      <span><Sunrise :size="14" /> {{ formatTime(sunrise) }}</span>
      <span><Sunset :size="14" /> {{ formatTime(sunset) }}</span>
    </div>
  </div>
</template>

<style scoped>
.daylight-card {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  color: var(--color-accent);
  background: rgba(255, 154, 61, 0.14);
  flex-shrink: 0;
}
.card-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted);
}
.remaining {
  font-size: 0.92rem;
  font-weight: 700;
}
.track {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #cde2fb, #f5a623 45%, #ff7a59 100%);
  opacity: 0.85;
}
.track-fill {
  position: absolute;
  inset: 0;
  right: auto;
  border-radius: 999px;
  background: transparent;
}
.track-dot {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #f5a623;
  transform: translateY(-50%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  transition: left 0.3s ease;
}
.times {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}
.times span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
