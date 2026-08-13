<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// 실제 날씨가 비/눈일 때만 히어로 카드 위에 가볍게 내리는 파티클 연출
// (의존성 없이 순수 Canvas 2D로 구현)
const props = defineProps({
  type: { type: String, default: null }, // 'rain' | 'snow' | null
})

const canvasRef = ref(null)
let ctx = null
let particles = []
let animationId = null
let resizeObserver = null

function createParticles(width, height) {
  const count = props.type === 'snow' ? 60 : 90
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    len: props.type === 'snow' ? Math.random() * 3 + 2 : Math.random() * 14 + 10,
    speed: props.type === 'snow' ? Math.random() * 1 + 0.6 : Math.random() * 5 + 8,
    drift: props.type === 'snow' ? Math.random() * 1 - 0.5 : Math.random() * 0.6 - 0.3,
    opacity: Math.random() * 0.5 + 0.3,
  }))
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  particles.forEach((p) => {
    if (props.type === 'snow') {
      ctx.beginPath()
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
      ctx.arc(p.x, p.y, p.len, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.strokeStyle = `rgba(190,220,255,${p.opacity})`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x, p.y + p.len)
      ctx.stroke()
    }

    p.y += p.speed
    p.x += p.drift
    if (p.y > height) {
      p.y = -p.len
      p.x = Math.random() * width
    }
  })

  animationId = requestAnimationFrame(draw)
}

function start() {
  stop()
  const canvas = canvasRef.value
  if (!canvas || !props.type) return
  ctx = canvas.getContext('2d')
  const resize = () => {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    createParticles(canvas.width, canvas.height)
  }
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  animationId = requestAnimationFrame(draw)
}

function stop() {
  if (animationId) cancelAnimationFrame(animationId)
  if (resizeObserver) resizeObserver.disconnect()
  animationId = null
  resizeObserver = null
}

onMounted(start)
onUnmounted(stop)
watch(() => props.type, start)
</script>

<template>
  <canvas v-if="type" ref="canvasRef" class="particles-canvas" aria-hidden="true" />
</template>

<style scoped>
.particles-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
