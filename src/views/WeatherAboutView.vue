<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <section class="about-card">
    <h3>ℹ️ 서비스 소개</h3>
    <p>본 앱은 Vue 3 및 Vue Router 기반으로 제작된 실습용 가상 날씨 관측 대시보드입니다.</p>
    <ul>
      <li><code>components/exercise/</code> 폴더 내부의 독립 부품 컴포넌트로 화면을 조립</li>
      <li>클라이언트 사이드 라우팅을 통해 새로고침 없이 화면이 전환</li>
      <li>URL 동적 스트링 매칭을 활용한 도시별 상세 페이지를 실시간으로 보여줌</li>
    </ul>
    <button class="btn-home" @click="goHome">대시보드 홈으로 이동</button>
  </section>
</template>

<style scoped>
.about-card {
  max-width: 500px;
  margin: 0 auto;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px 18px;
}

.about-card ul {
  margin: 12px 0 20px;
  padding-left: 20px;
  line-height: 1.7;
}

.about-card code {
  background-color: #f1f3f5;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 13px;
}

.btn-home {
  padding: 8px 14px;
  width: 100%;
  border: none;
  border-radius: 6px;
  background-color: #3498db;
  color: #fff;
  cursor: pointer;
}
</style>
