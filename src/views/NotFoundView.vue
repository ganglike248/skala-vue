<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <section class="not-found">
    <p class="not-found-emoji">☀️❓</p>
    <h3>페이지를 찾을 수 없습니다.</h3>
    <p>요청하신 주소가 존재하지 않거나, 아직 개발되지 않았습니다.</p>
    <button class="btn-home" @click="goHome">날씨 메인으로 이동</button>
  </section>
</template>

<style scoped>
.not-found {
  max-width: 400px;
  margin: 40px auto;
  text-align: center;
}

.not-found-emoji {
  font-size: 40px;
  margin-bottom: 8px;
}

.btn-home {
  margin-top: 12px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background-color: #3498db;
  color: #fff;
  cursor: pointer;
}
</style>
