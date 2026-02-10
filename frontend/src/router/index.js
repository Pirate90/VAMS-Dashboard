import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: () => import('@/views/VAMS.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doubt',
    name: 'Doubt',
    component: () => import('@/views/DoubtView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/fishing',
    name: 'Fishing',
    component: () => import('@/views/FishingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/decision',
    name: 'Decision',
    component: () => import('@/views/DecisionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tracking',
    name: 'Tracking',
    component: () => import('@/views/TracingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/event',
    name: 'Event',
    component: () => import('@/views/EventView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

function getCookie (name) {
  const cookie = document.cookie.split('; ').find(row => row.startsWith(name + '='))
  return cookie ? cookie.split('=')[1] : null
}

router.beforeEach((to, from, next) => {
  const token = getCookie('token')

  if (token) {
    // 토큰이 있으면 만료 시간 연장 (예: 10분)
    document.cookie = `token=${token}; max-age=60000; path=/`
  }

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    // 로그인 했는데 로그인 페이지 접근 시 홈으로 이동
    next('/')
  } else {
    next()
  }
})

export default router
