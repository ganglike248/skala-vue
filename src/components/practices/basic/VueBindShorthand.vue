<script setup>
const id = 'user-profile-card'
const src = 'https://vuejs.org/images/logo.png'
</script>

<template>
  <div class="practice-section">
    <h2>v-bind 디렉티브 고급 (단축 문법)</h2>
    <div :id>
      <!-- 같은 이름(src)로 할당해서 변수를 바로 사용 -->
      <img :src alt="Vue 로고" style="width: 50px" />
    </div>
  </div>
</template>
