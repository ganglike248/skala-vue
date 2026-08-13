<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPinned, Droplets, Wind, Gauge, Eye, ChevronRight, LocateFixed } from '@lucide/vue'
import { useWeatherStore, CITY_META } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { celsiusToFahrenheit, msToMph } from '@/utils/weatherMath'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'

const router = useRouter()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()

const mapEl = ref(null)
let map = null
const markers = new Map()

// 지도 위에 표시할 대상: 내 위치 + 6개 주요 도시
const mapTargets = computed(() => {
  const list = []
  if (weatherStore.entries.me) list.push(weatherStore.entries.me)
  CITY_META.forEach((meta) => {
    const entry = weatherStore.entries[meta.id]
    if (entry) list.push(entry)
  })
  return list
})

const selectedId = ref('city_01')
const selected = computed(() => weatherStore.entries[selectedId.value])

function tempColor(t) {
  if (t === undefined || t === null) return '#8fa3b8'
  if (t < 0) return '#3d84f5'
  if (t < 10) return '#34c8e8'
  if (t < 20) return '#34d399'
  if (t < 27) return '#fbbf24'
  if (t < 33) return '#fb923c'
  return '#f43f5e'
}

function selectCity(id) {
  selectedId.value = id
  weatherStore.fetchDetail(id)
  const target = weatherStore.entries[id]
  if (map && target) {
    map.flyTo([target.lat, target.lon], Math.max(map.getZoom(), 9), { duration: 0.6 })
  }
  const marker = markers.get(id)
  if (marker) marker.openTooltip()
}

function buildIcon(entry, isActive) {
  const temp = entry.current?.temp
  const color = tempColor(temp)
  const label = entry.current ? `${temp}°` : '···'
  return L.divIcon({
    className: 'weather-pin-wrap',
    html: `<div class="weather-pin ${isActive ? 'is-active' : ''}" style="--pin-color:${color}">${label}</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  })
}

function renderMarkers() {
  if (!map) return
  mapTargets.value.forEach((entry) => {
    let marker = markers.get(entry.id)
    const icon = buildIcon(entry, entry.id === selectedId.value)
    if (!marker) {
      marker = L.marker([entry.lat, entry.lon], { icon })
        .addTo(map)
        .bindTooltip(entry.name, { direction: 'top', offset: [0, -20], className: 'weather-pin-tooltip' })
        .on('click', () => selectCity(entry.id))
      markers.set(entry.id, marker)
    } else {
      marker.setIcon(icon)
    }
  })
}

onMounted(async () => {
  await nextTick()
  map = L.map(mapEl.value, { zoomControl: true, attributionControl: false }).setView([36.4, 127.8], 6.6)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(map)
  renderMarkers()
  weatherStore.fetchDetail(selectedId.value)
})

onBeforeUnmount(() => {
  if (map) map.remove()
})

watch(mapTargets, renderMarkers, { deep: true })
watch(selectedId, () => renderMarkers())

const displayTemp = (t) => (t === undefined || t === null ? null : configStore.unit === 'fahrenheit' ? celsiusToFahrenheit(t) : t)
const displayWind = (w) => (w === undefined || w === null ? null : configStore.windSpeedUnit === 'mph' ? msToMph(w) : w)

const tempMeterPct = computed(() => {
  if (!selected.value?.current) return 0
  const t = selected.value.current.temp
  return Math.min(100, Math.max(0, ((t + 10) / 50) * 100))
})

const hourly = computed(() => selected.value?.forecast?.hourly ?? [])
const formatHour = (ms, idx) => (idx === 0 ? '지금' : new Date(ms).toLocaleTimeString('ko-KR', { hour: 'numeric' }))

function goDetail() {
  if (selected.value) router.push(`/weather/${selected.value.id}`)
}
</script>

<template>
  <div class="page map-page">
    <div class="section-title"><MapPinned :size="20" />지도로 보는 날씨</div>

    <div class="city-switch-row">
      <button
        v-if="weatherStore.entries.me"
        class="chip city-chip"
        :class="{ active: selectedId === 'me' }"
        @click="selectCity('me')"
      >
        <LocateFixed :size="13" />
        내 위치
      </button>
      <button
        v-for="meta in CITY_META"
        :key="meta.id"
        class="chip city-chip"
        :class="{ active: selectedId === meta.id }"
        @click="selectCity(meta.id)"
      >
        {{ meta.name }}
      </button>
    </div>

    <div class="map-layout">
      <div class="map-panel glass-card">
        <div ref="mapEl" class="leaflet-canvas" />
      </div>

      <aside class="map-info glass-card">
        <template v-if="selected?.current">
          <div class="info-top">
            <div>
              <p class="info-city">{{ selected.name }}</p>
              <p class="info-region text-muted">{{ selected.region }}</p>
            </div>
            <WeatherIcon :code="selected.current.iconCode" :size="48" class="icon-float" />
          </div>

          <div class="info-temp">{{ displayTemp(selected.current.temp) }}<span class="unit">{{ configStore.unitSymbol }}</span></div>
          <p class="info-desc text-muted">
            {{ selected.current.description }} · 체감 {{ displayTemp(selected.current.feelsLike) }}{{ configStore.unitSymbol }}
          </p>

          <div class="temp-meter">
            <div class="meter-track">
              <div class="meter-thumb" :style="{ left: tempMeterPct + '%' }" />
            </div>
            <div class="meter-scale text-muted">
              <span>-10°</span><span>10°</span><span>25°</span><span>40°+</span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-stat">
              <Droplets :size="15" />
              <span class="text-muted">습도</span>
              <strong>{{ selected.current.humidity }}%</strong>
            </div>
            <div class="info-stat">
              <Wind :size="15" />
              <span class="text-muted">풍속</span>
              <strong>{{ displayWind(selected.current.windSpeed) }}{{ configStore.windSpeedSymbol }}</strong>
            </div>
            <div class="info-stat">
              <Gauge :size="15" />
              <span class="text-muted">기압</span>
              <strong>{{ selected.current.pressure }}hPa</strong>
            </div>
            <div class="info-stat">
              <Eye :size="15" />
              <span class="text-muted">가시거리</span>
              <strong>{{ (selected.current.visibility / 1000).toFixed(1) }}km</strong>
            </div>
          </div>

          <div v-if="hourly.length" class="info-hourly hscroll">
            <div v-for="(h, idx) in hourly" :key="h.time" class="mini-hour">
              <span>{{ formatHour(h.time, idx) }}</span>
              <WeatherIcon :code="h.iconCode" :size="20" />
              <strong>{{ displayTemp(h.temp) }}°</strong>
            </div>
          </div>

          <button class="btn-primary detail-btn" @click="goDetail">
            상세 예보 보기 <ChevronRight :size="16" />
          </button>
        </template>
        <div v-else class="info-loading">
          <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 14px" />
          <div class="skeleton" style="height: 48px; width: 40%; margin-bottom: 14px" />
          <div class="skeleton" style="height: 14px; width: 80%" />
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-top: 6px;
}

.city-switch-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.city-chip.active {
  background: linear-gradient(135deg, var(--color-primary), var(--sky-3));
  color: #fff;
  box-shadow: var(--shadow-pop);
}

.map-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

.map-panel {
  overflow: hidden;
  height: 620px;
  padding: 0;
}
.leaflet-canvas {
  width: 100%;
  height: 100%;
}

.map-info {
  padding: 26px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 90px;
}
.info-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.info-city {
  font-size: 1.15rem;
  font-weight: 800;
}
.info-region {
  font-size: 0.76rem;
  margin-top: 2px;
}
.info-temp {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
}
.info-temp .unit {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-muted);
}
.info-desc {
  font-size: 0.85rem;
  margin-top: -6px;
}

.temp-meter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meter-scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.info-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  font-size: 0.72rem;
}
.info-stat strong {
  font-size: 0.98rem;
}

.info-hourly {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.mini-hour {
  flex-shrink: 0;
  width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  font-size: 0.72rem;
  font-weight: 700;
}

.detail-btn {
  width: 100%;
}

.info-loading {
  padding: 12px 0;
}

@media (max-width: 1180px) {
  .map-layout {
    grid-template-columns: 1fr;
  }
  .map-panel {
    height: 440px;
  }
  .map-info {
    position: static;
  }
}
</style>

<style>
/* Leaflet divIcon 마커는 Vue scoped 스타일을 타지 않으므로 전역 블록에서 정의 */
.weather-pin-wrap {
  background: transparent;
  border: none;
}
.weather-pin {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
  background: var(--pin-color, #3478f6);
  border: 3px solid #fff;
  box-shadow: 0 6px 16px rgba(16, 24, 40, 0.28);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.weather-pin:hover {
  transform: scale(1.08);
}
.weather-pin.is-active {
  outline: 3px solid rgba(52, 120, 246, 0.45);
  outline-offset: 2px;
}
.weather-pin-tooltip {
  font-weight: 700;
  border-radius: 8px;
  border: none;
  box-shadow: var(--shadow-soft, 0 6px 20px rgba(0, 0, 0, 0.18));
}
.leaflet-control-attribution {
  display: none;
}
</style>
