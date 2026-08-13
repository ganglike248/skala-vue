<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// 히어로/홈 배경 위에 날씨에 맞춰 가볍게 그려주는 연출 (의존성 없이 순수 Canvas 2D)
// rain/snow/thunder: 아래로 떨어짐, stars/sparkle: 제자리에서 반짝임, clouds/mist: 옆으로 천천히 흐름
const props = defineProps({
  type: { type: String, default: null }, // 'rain' | 'snow' | 'thunder' | 'stars' | 'sparkle' | 'clouds' | 'mist' | null
})

const canvasRef = ref(null)
let ctx = null
let particles = []
let animationId = null
let resizeObserver = null
let flashTimer = 0
let flashAlpha = 0
let frame = 0

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function createParticles(width, height) {
  switch (props.type) {
    case 'snow':
      particles = Array.from({ length: 60 }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        len: rand(2, 5),
        speed: rand(0.6, 1.6),
        drift: rand(-0.5, 0.5),
        opacity: rand(0.3, 0.8),
      }))
      break
    case 'rain':
    case 'thunder':
      particles = Array.from({ length: props.type === 'thunder' ? 110 : 90 }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        len: rand(10, 24),
        speed: rand(8, 13),
        drift: rand(-0.3, 0.3),
        opacity: rand(0.3, 0.8),
      }))
      break
    case 'stars':
      particles = Array.from({ length: 90 }, () => ({
        x: rand(0, width),
        y: rand(0, height * 0.75),
        r: rand(0.6, 2),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.6, 1.6),
      }))
      break
    case 'sparkle':
      particles = Array.from({ length: 34 }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(1, 2.6),
        speed: rand(0.15, 0.4),
        drift: rand(-0.25, 0.25),
        phase: rand(0, Math.PI * 2),
      }))
      break
    case 'clouds':
      particles = Array.from({ length: 5 }, () => ({
        x: rand(0, width),
        y: rand(0, height * 0.55),
        w: rand(120, 240),
        h: rand(28, 46),
        speed: rand(0.08, 0.2),
        opacity: rand(0.06, 0.14),
      }))
      break
    case 'mist':
      particles = Array.from({ length: 6 }, () => ({
        x: rand(0, width),
        y: rand(height * 0.2, height),
        w: rand(180, 320),
        h: rand(36, 60),
        speed: rand(0.05, 0.12),
        opacity: rand(0.05, 0.1),
      }))
      break
    default:
      particles = []
  }
}

function drawFallingLine(p, height, width) {
  ctx.strokeStyle = `rgba(190,220,255,${p.opacity})`
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(p.x, p.y)
  ctx.lineTo(p.x, p.y + p.len)
  ctx.stroke()
  p.y += p.speed
  p.x += p.drift
  if (p.y > height) {
    p.y = -p.len
    p.x = rand(0, width)
  }
}

function drawFallingSnow(p, height, width) {
  ctx.beginPath()
  ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
  ctx.arc(p.x, p.y, p.len, 0, Math.PI * 2)
  ctx.fill()
  p.y += p.speed
  p.x += p.drift
  if (p.y > height) {
    p.y = -p.len
    p.x = rand(0, width)
  }
}

function drawSoftBlob(p, width) {
  const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.w / 2)
  grad.addColorStop(0, `rgba(255,255,255,${p.opacity})`)
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(p.x, p.y, p.w / 2, p.h / 2, 0, 0, Math.PI * 2)
  ctx.fill()
  p.x += p.speed
  if (p.x - p.w / 2 > width) p.x = -p.w / 2
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)
  frame++

  particles.forEach((p) => {
    if (props.type === 'snow') drawFallingSnow(p, height, width)
    else if (props.type === 'rain' || props.type === 'thunder') drawFallingLine(p, height, width)
    else if (props.type === 'stars') {
      const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.02 * p.speed + p.phase))
      ctx.beginPath()
      ctx.fillStyle = `rgba(255,255,255,${twinkle})`
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    } else if (props.type === 'sparkle') {
      const twinkle = 0.25 + 0.6 * Math.abs(Math.sin(frame * 0.03 + p.phase))
      ctx.beginPath()
      ctx.fillStyle = `rgba(255,244,214,${twinkle})`
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
      p.y -= p.speed
      p.x += p.drift
      if (p.y < -10) {
        p.y = height + 10
        p.x = rand(0, width)
      }
    } else if (props.type === 'clouds' || props.type === 'mist') {
      drawSoftBlob(p, width)
    }
  })

  // 뇌우: 가끔 화면 전체가 번쩍이는 번개 연출
  if (props.type === 'thunder') {
    if (flashTimer <= 0 && Math.random() < 0.0035) {
      flashTimer = 7
      flashAlpha = 0.85
    }
    if (flashTimer > 0) {
      flashTimer--
      ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`
      ctx.fillRect(0, 0, width, height)
      flashAlpha *= 0.72
    }
  }

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
  flashTimer = 0
  flashAlpha = 0
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
