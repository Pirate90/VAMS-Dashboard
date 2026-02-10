<template>
  <div class="explanation">
    <transition name="collapse"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <div class="collapse" v-if="!collapse">
        <div class="content">
          <div>과거 위치 기점</div>
          <VueDatePicker v-model="pastStartTIme" no-today auto-apply :max-date="pastEndTime" />
        </div>
        <div class="content">
          <div>과거 위치 종점</div>
          <VueDatePicker v-model="pastEndTime" no-today auto-apply :min-date="pastStartTIme" :max-date="predictEndTime" />
        </div>
        <div class="content">
          <div>예측 위치 종점</div>
          <VueDatePicker v-model="predictEndTime" no-today auto-apply :min-date="pastEndTime" />
        </div>
      </div>
    </transition>

    <div class="btns d-flex">
      <button @click="onClickRequest">요청</button>
      <button @click="collapse = !collapse">
        <f-a-icon icon="chevron-up" v-if="!collapse"/>
        <f-a-icon icon="chevron-down" v-else/>
      </button>
    </div>

    <div v-if="explResult?.answer">
      <img :src="require('@/assets/explanation.png')" alt="" width="400" style="border: 1px solid #bbbbbb; border-radius: 10px; padding: 10px; margin: 10px 0;">
      <div style="border: 1px solid #bbbbbb; border-radius: 10px; padding: 10px;">
        {{ explResult?.answer }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { requestApi } from '@/apis'

const today = new Date()
today.setHours(0)
today.setMinutes(0)
today.setSeconds(0)
const pastStartTIme = ref(new Date(new Date(today).setHours(today.getHours() - 3)))
const pastEndTime = ref(new Date(today))
const predictEndTime = ref(new Date(new Date(today).setHours(today.getHours() + 3)))

const collapse = ref(false)
const explResult = ref({})

async function onClickRequest () {
  explResult.value = await requestApi.getExplanation()
  collapse.value = true
}

// 슬라이드 다운/업을 위한 트랜지션 훅
function beforeEnter (el) {
  el.style.height = '0'
  el.style.opacity = '0'
  el.style.transition = 'height 0.3s ease, opacity 0.3s ease'
}

function enter (el) {
  const height = el.scrollHeight
  el.style.height = height + 'px'
  el.style.opacity = '1'
}

function leave (el) {
  el.style.height = el.scrollHeight + 'px'
  el.style.transition = 'height 0.3s ease, opacity 0.3s ease'
  el.style.height = '0'
  el.style.opacity = '0'
}
</script>

<style scoped>
.explanation {
  padding: 10px 15px;
  height: 475px;
  overflow: auto;
}
.collapse {
  overflow: hidden;
}
.content {
  margin-bottom: 10px;
  gap: 10px;
}
.btns {
  gap: 10px;
}
.btns > button:first-child {
  flex: 1;
}
.btns > button {
  padding: 10px;
  border: none;
  border: 1px solid #DDDDDD;
  background: none;
  cursor: pointer;
  border-radius: 10px;
  font: normal normal 600 16px / 20px SUIT;
}
.btns > button:hover {
  background: #f3f3f3;
}
</style>
