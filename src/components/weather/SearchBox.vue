<script setup>
import { ref, watch } from 'vue'
import { useDebounceFn, onClickOutside } from '@vueuse/core'
import { Search, Plus, Loader2 } from '@lucide/vue'
import { useWeatherStore } from '@/stores/weatherStore'

const weatherStore = useWeatherStore()
const query = ref('')
const isOpen = ref(false)
const boxRef = ref(null)

const runSearch = useDebounceFn(() => {
  weatherStore.searchCity(query.value)
}, 400)

watch(query, () => {
  isOpen.value = query.value.trim().length > 0
  runSearch()
})

onClickOutside(boxRef, () => {
  isOpen.value = false
})

const emit = defineEmits(['added'])

function handleAdd(candidate) {
  const id = weatherStore.addCustomCity(candidate)
  query.value = ''
  isOpen.value = false
  emit('added', id)
}
</script>

<template>
  <div ref="boxRef" class="search-box">
    <div class="search-input glass-card">
      <Search :size="16" class="search-icon" />
      <input
        v-model="query"
        type="text"
        placeholder="도시 이름으로 검색해서 추가해보세요 (예: 춘천, Tokyo, Paris)"
        @focus="isOpen = query.trim().length > 0"
      />
      <Loader2 v-if="weatherStore.isSearching" :size="16" class="spin" />
    </div>

    <div v-if="isOpen" class="search-dropdown glass-card">
      <p v-if="weatherStore.searchError" class="empty text-muted">{{ weatherStore.searchError }}</p>
      <p
        v-else-if="!weatherStore.isSearching && weatherStore.searchResults.length === 0"
        class="empty text-muted"
      >
        검색 결과가 없습니다.
      </p>
      <button
        v-for="result in weatherStore.searchResults"
        :key="`${result.name}-${result.lat}-${result.lon}`"
        class="search-result"
        @click="handleAdd(result)"
      >
        <span class="result-text">
          <strong>{{ result.name }}</strong>
          <small class="text-muted">{{ result.region }}</small>
        </span>
        <Plus :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
}
.search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}
.search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.search-input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
}
.spin {
  animation: spin 0.8s linear infinite;
  color: var(--color-primary);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 280px;
  overflow-y: auto;
  padding: 8px;
  box-shadow: var(--shadow-strong);
}
.empty {
  padding: 14px;
  text-align: center;
  font-size: 0.82rem;
}
.search-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
}
.search-result:hover {
  background: rgba(79, 124, 255, 0.1);
}
.result-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.result-text small {
  font-size: 0.72rem;
}
</style>
