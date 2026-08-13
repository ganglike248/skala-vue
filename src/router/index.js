import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/WeatherHomeView.vue'),
  },
  {
    // 6개 고정 도시 + 검색으로 추가한 도시를 둘러보는 화면
    path: '/regions',
    name: 'regions',
    component: () => import('../views/WeatherRegionsView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  {
    // :cityId 동적 세그먼트로 도시별 상세 페이지 매칭
    path: '/weather/:cityId',
    name: 'WeatherDetail',
    component: () => import('../views/WeatherDetailView.vue'),
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('../views/WeatherStatsView.vue'),
  },
  {
    // 지도 위 핀으로 주요 도시 날씨를 한눈에 보는 화면
    path: '/map',
    name: 'map',
    component: () => import('../views/WeatherMapView.vue'),
  },
  {
    // 위 라우트와 매칭되지 않는 모든 경로를 404 페이지로 (Catch-all Route)
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
