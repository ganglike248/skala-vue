<script setup>
// ref 임포트
import { ref } from 'vue'

// 반응형 상태
const count = ref(0)
const name = ref('홍길동')
const isActive = ref(true)
const items = ref(['사과', '배'])
const user = ref({
  name: name.value,
  age: 30,
})

// .value로 접근
const increaseRef = () => {
  count.value++
}
const changeUserName = () => {
  user.value.name = '장보고'
}
const handleSearchEnter = () => {
  user.value.name = name.value
}
</script>

<template>
  <div
    class="practice-section"
    :style="{ backgroundColor: isActive ? '#e0f7fa' : '#fce4ec', padding: '10px' }"
  >
    <h2>반응형 상태 ref() 기초</h2>
    <p>
      Ref 카운트: <strong>{{ count }}</strong>
    </p>
    <p>이름: <input v-model="name" @keyup.enter="handleSearchEnter" />{{ name }}</p>
    <p>활성 상태: {{ isActive ? '활성' : '비활성' }}</p>
    <p>과일 목록: {{ items.join(', ') }}</p>
    <p>사용자 정보: 이름 - {{ user.name }}, 나이 - {{ user.age }}</p>
    <button @click="increaseRef">Ref 변수 증가</button>
    <button @click="isActive = !isActive">토글</button>
    <button @click="items.push('귤')">귤 추가</button>
    <button @click="items.push('수박')">수박 추가</button>
    <button @click="changeUserName">'장보고'로 이름 변경</button>
  </div>
</template>
