<script setup>
import { useRouter } from 'vue-router'
import { CloudOff } from '@lucide/vue'

const router = useRouter()
const goHome = () => router.push('/')
</script>

<template>
  <div class="page not-found-page">
    <section class="not-found glass-card">
      <CloudOff :size="48" class="text-muted" />
      <h3>페이지를 찾을 수 없습니다</h3>
      <p class="text-muted">요청하신 주소가 존재하지 않거나, 아직 개발되지 않았습니다.</p>
      <button class="btn-primary" @click="goHome">날씨 메인으로 이동</button>
    </section>
  </div>
</template>

<style scoped>
.not-found-page {
  padding-top: 40px;
  display: flex;
  justify-content: center;
}
.not-found {
  max-width: 380px;
  width: 100%;
  padding: 40px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.not-found h3 {
  margin-top: 6px;
}
.not-found p {
  margin-bottom: 10px;
  font-size: 0.88rem;
}
.btn-primary {
  width: 100%;
}
</style>
