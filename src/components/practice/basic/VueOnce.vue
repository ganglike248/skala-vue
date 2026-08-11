<script setup>
import { ref } from 'vue'

const count = ref(1)
</script>

<template>
  <div class="practice-section">
    <h2>v-once 디렉티브 학습</h2>
    <p>일반 변수 (실시간): {{ count }}</p>
    <!-- 최초에 한 번만 렌더링, 이후에는 갱신 X -->
    <p v-once>v-once 변수 (최초 고정): {{ count }}</p>
    <button @click="count++">숫자 증가 버튼</button>
  </div>
</template>
