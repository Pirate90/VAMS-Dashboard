import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: () => import('@/views/00-VAMS.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lvd',
    name: 'LoiteringVesselDetection',
    component: () => import('@/views/01-LVD.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tvd',
    name: 'TransshipmentVesselDetection',
    component: () => import('@/views/02-TVD.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/fac',
    name: 'FishingActivityClassification',
    component: () => import('@/views/03-FAC.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/fgvd',
    name: 'FishingGroundVesselDetection',
    component: () => import('@/views/04-FGVD.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/fpi',
    name: 'FishingPatternIdentification',
    component: () => import('@/views/05-FPI.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/svt',
    name: 'SuspiciousVesselTracing',
    component: () => import('@/views/06-SVT.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mvt',
    name: 'MultiVesselTracing',
    component: () => import('@/views/07-MVT.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lavt',
    name: 'LateArrivalVesselTracing',
    component: () => import('@/views/08-LAVT.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lgvd',
    name: 'LLMGroundVesselDescription',
    component: () => import('@/views/09-LGVD.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lvad',
    name: 'LLMVesselActivityDescription',
    component: () => import('@/views/10-LVAD.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/11-REPORT.vue'),
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
