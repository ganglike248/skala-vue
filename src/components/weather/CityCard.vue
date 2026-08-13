<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { X } from '@lucide/vue'
import { useConfigStore } from '@/stores/configStore'
import { celsiusToFahrenheit } from '@/utils/weatherMath'
import WeatherIcon from './WeatherIcon.vue'
import FavoriteToggle from './FavoriteToggle.vue'

const props = defineProps({
  city: { type: Object, required: true },
  removable: { type: Boolean, default: false },
})
const emit = defineEmits(['remove'])

const router = useRouter()
const configStore = useConfigStore()

const displayTemp = computed(() => {
  if (!props.city.current) return null
  const temp = props.city.current.temp
  return configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(temp) : temp
})

function goDetail() {
  router.push(`/weather/${props.city.id}`)
}
</script>

<template>
  <div
    class="city-card glass-card"
    @click="goDetail"
    v-motion
    :initial="{ opacity: 0, y: 18 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 320 } }"
  >
    <div class="card-actions">
      <button v-if="removable" class="remove-btn" @click.stop="emit('remove', city.id)" aria-label="목록에서 제거">
        <X :size="14" />
      </button>
      <FavoriteToggle :city-id="city.id" />
    </div>

    <template v-if="city.current">
      <WeatherIcon :code="city.current.iconCode" :size="42" class="icon-float" />
      <h3>{{ city.name }}</h3>
      <p class="region text-muted">{{ city.region }}</p>
      <p class="temp">{{ displayTemp }}{{ configStore.unitSymbol }}</p>
      <p class="desc text-muted">{{ city.current.description }}</p>
    </template>
    <template v-else-if="city.error">
      <p class="error-msg">{{ city.error }}</p>
    </template>
    <template v-else>
      <div class="skeleton" style="height: 18px; width: 60%; margin-bottom: 10px" />
      <div class="skeleton" style="height: 32px; width: 40%; margin-bottom: 10px" />
      <div class="skeleton" style="height: 14px; width: 80%" />
    </template>
  </div>
</template>

<style scoped>
.city-card {
  position: relative;
  padding: 20px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.city-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-strong);
}
.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(231, 76, 60, 0.12);
  color: #e74c3c;
  cursor: pointer;
}
h3 {
  margin: 6px 0 2px;
  font-size: 1.1rem;
}
.region {
  font-size: 0.75rem;
  margin-bottom: 10px;
}
.temp {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}
.desc {
  font-size: 0.8rem;
}
.error-msg {
  color: #e74c3c;
  font-size: 0.82rem;
}
</style>
