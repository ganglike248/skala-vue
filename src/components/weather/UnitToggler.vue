<script setup>
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()
</script>

<template>
  <button class="unit-toggle" @click="configStore.toggleUnit">
    {{ configStore.unit === 'celsius' ? '℃' : '℉' }}
  </button>
</template>

<style scoped>
.unit-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-solid);
  color: var(--color-text);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.unit-toggle:hover {
  transform: translateY(-1px);
}
</style>
