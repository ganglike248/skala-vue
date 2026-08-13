<script setup>
import { Umbrella, Snowflake, Shirt, GlassWater, Wind, Smile } from '@lucide/vue'

// buildAdvice()가 만들어주는 아이콘 이름 문자열 -> 실제 컴포넌트 매핑
// (번들 크기를 위해 실제 쓰는 아이콘만 import)
const ICON_COMPONENTS = { Umbrella, Snowflake, Shirt, GlassWater, Wind, Smile }

defineProps({
  tips: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="advice-row">
    <span v-for="tip in tips" :key="tip.text" class="chip advice-chip">
      <component :is="ICON_COMPONENTS[tip.icon] ?? Smile" :size="14" />
      {{ tip.text }}
    </span>
  </div>
</template>

<style scoped>
.advice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.advice-chip {
  cursor: default;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}
</style>
