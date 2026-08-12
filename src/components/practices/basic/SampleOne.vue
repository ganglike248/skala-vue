<script setup>
import { ref } from 'vue'

// 일반 변수: 화면이 새로 렌더링 되야 값이 변경됨
let normalCount = 0
// 반응형 변수: 값이 변경되면 자동으로 새로 고침
const vueCount = ref(0)
</script>

<template>
  <div class="practice-section">
    <h2>Hello Skala-Vue</h2>
    <h3>일반 변수 클릭: {{ normalCount }}</h3>
    <button @click="normalCount++">일반 변수 증가</button>
    <br />
    <h3>Vue 반응성 변수 클릭: {{ vueCount }}</h3>
    <button @click="vueCount++">Vue 변수 증가</button>
  </div>
</template>
