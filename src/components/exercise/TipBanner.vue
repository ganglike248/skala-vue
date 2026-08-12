<script setup>
import { ref } from 'vue'

// 최초 1회만 노출되는 안내 배너. 부모가 몰라도 되는 상태라 여기서 자체 관리
const showTip = ref(true)
</script>

<template>
  <section v-show="showTip" class="tip-banner">
    카드를 클릭하면 상세정보가 펼쳐지고, 검색 후 Enter를 누르면 결과 건수가 표시됩니다.
    <!-- 한 번만 표시 -->
    <button class="btn-close" @click.once="showTip = false">닫기</button>
  </section>
</template>

<style scoped>
.tip-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background-color: #fff8e1;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
}

.btn-close {
  border-radius: 6px;
  padding: 4px 8px;
  background: rgb(255, 217, 92);
  color: #8d6e00;
  font-weight: bold;
}
</style>
