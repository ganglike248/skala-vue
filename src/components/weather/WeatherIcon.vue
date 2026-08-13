<script setup>
import { computed } from 'vue'
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  Cloudy,
  CloudDrizzle,
  CloudSunRain,
  CloudMoonRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
} from '@lucide/vue'
import { resolveWeatherIcon } from '@/utils/weatherIconMap'

// 번들 크기를 위해 실제 쓰는 아이콘만 이름으로 import (import * 금지)
const ICON_COMPONENTS = {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  Cloudy,
  CloudDrizzle,
  CloudSunRain,
  CloudMoonRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
}

// 이모지(☀️💧☁️) 대신 실제 날씨 상태(맑음/구름/비/눈/뇌우/안개 + 낮/밤)에 맞는
// lucide 아이콘을 하나의 컴포넌트로 통일해서 렌더링
const props = defineProps({
  code: {
    type: String,
    default: '01d',
  },
  size: {
    type: [Number, String],
    default: 28,
  },
  // true면 날씨별 고유 색상 대신 currentColor(부모 글자색)를 그대로 사용
  monochrome: {
    type: Boolean,
    default: false,
  },
})

const resolved = computed(() => resolveWeatherIcon(props.code))
const iconComponent = computed(() => ICON_COMPONENTS[resolved.value.icon] ?? Cloud)
</script>

<template>
  <component
    :is="iconComponent"
    :size="size"
    :stroke-width="1.8"
    :color="monochrome ? 'currentColor' : resolved.color"
  />
</template>
