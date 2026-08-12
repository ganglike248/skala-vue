<script setup>
// 상위로 검색어를 전달할 커스텀 이벤트 등록
defineEmits(['update-query', 'search-enter'])

// 상위로부터 현재 검색어를 전달받아 표시 (한글 동기화 상태 유지용)
defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="search-inner">
    <h3>🔍 도시 검색</h3>
    <!-- 엔터 누르면 search-enter emit -->
    <input
      type="text"
      :value="currentQuery"
      @input="$emit('update-query', $event.target.value)"
      @keyup.enter="$emit('search-enter')"
      placeholder="검색할 도시 이름 입력 후 Enter"
    />
    <p>
      검색 중인 도시: <strong>{{ currentQuery }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-inner input {
  width: 100%;
  padding: 8px 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 6px;
}
</style>
