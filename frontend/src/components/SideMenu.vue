<template>
  <section id="menu" :style="{ width: sectionWidth }">
    <a href="/">
      <img v-if="expand" :src="require('@/assets/logo-full.png')" alt="logo" class="logo">
      <img v-else :src="require('@/assets/logo-icon.png')" alt="logo-only" class="logo-icon">
    </a>
    <div style="flex: 1;">
      <button v-for="s in serviceList" :key="s.name"
        :class="['service', isSelectedService(s.key) ? 'selected-service' : '']"
        @click="onClickMenu(s.key)"
        :disabled="isSelectedService(s.key)"
      >
        <img :src="require(`@/assets/service/${s.icon}.png`)" :alt="s.name">
        <span v-if="displayName">{{ s.name }}</span>
      </button>
    </div>

    <button class="expand" @click="expand = !expand" :style="{ transform: expand ? '' : 'rotate(180deg)' }">
      <f-a-icon icon="chevron-left"/>
    </button>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// const emit = defineEmits(['menu:change'])

const serviceList = [
  { key: '/doubt', name: '관심지역\n의심선박 분류', icon: 'warning' },
  { key: '/fishing', name: '환적 의심선박 분류', icon: 'point' },
  { key: '/tracking', name: '조업/비조업\n자동식별', icon: 'search' },
  { key: '/decision', name: '불법조업구역 추정', icon: 'check' },
  { key: '/event', name: 'IUU 어업패턴 감시', icon: 'event' },
  { key: '/doubt', name: '의심선박\n시공간 추적', icon: 'warning' },
  { key: '/fishing', name: '다중선박\n이동범위 추정', icon: 'point' },
  { key: '/tracking', name: '입항지연 선박 추적', icon: 'search' },
  { key: '/decision', name: 'VLM 기반\n선박활동 설명', icon: 'check' },
  { key: '/event', name: 'LLM 기반\n불법어업 근거', icon: 'event' },
  { key: '/event', name: '선박활동 사건 관리', icon: 'event' }
]

const expand = ref(true)
const sectionWidth = ref('250px')
const displayName = ref(true)

watch(expand, (e) => {
  if (e) {
    sectionWidth.value = '250px'
    setTimeout(() => {
      displayName.value = e
    }, 150)
  } else {
    sectionWidth.value = '80px'
    displayName.value = e
  }
})

function isSelectedService (k) {
  return router.currentRoute.value.fullPath === k
}

function onClickMenu (m) {
  router.replace(m)
}
</script>

<style scoped>
section {
  width: 250px;
  height: 100%;
  /* background-color: #1447AB; */
  background: #222222;
  padding: 30px;
  box-shadow: 0px 0px 2px #fff;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all .2s ease;
}
.logo {
  width: 100%;
  margin-bottom: 40px;
}
.logo-icon {
  margin-bottom: 40px;
  width: 30px;
  height: 30px;
}
.service {
  width: 181px;
  height: 50px;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  gap: 10px;
  margin-bottom: 5px;
  font: normal normal 600 16px/20px SUIT;
  letter-spacing: -0.9px;
  transition: all .2s;
  position: relative;
}
.service:hover,
.selected-service {
  cursor: pointer;
  background-color: #FFFFFF4D;
  color: rgba(255, 255, 255, 1);
}
.service:disabled {
  cursor: auto;
}
.service img {
  height: 20px;
  position: absolute;
  left: 10px;
}
.service span {
  white-space: pre;
  margin-left: 20px;
}
.expand {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 25px;
  transition: all .2s ease;
  width: 40px;
  height: 40px;
}
.expand:hover {
  cursor: pointer;
  background-color: #FFFFFF4D;
  color: rgba(255, 255, 255, 1);
}
</style>
