<script setup>
// 부모로부터 표시할 문구만 전달받는 단순 표시 컴포넌트
defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="status-bar">
    {{ message }}
  </div>
</template>

<style scoped>
.status-bar {
  margin-bottom: 10px;
}
</style>
