<template>
  <main>
    <div class="header d-flex a-i-center">
      <button class="tab" @click="currentTab = 'single'" :disabled="currentTab === 'single'">선박 이동경로 예측</button>
      <button class="tab" @click="currentTab = 'multi'" :disabled="currentTab === 'multi'">다중 선박 이동범위 추정</button>
    </div>

    <div class="container">
      <div class="content d-flex" v-if="currentTab === 'single'">
        <div class="v-info d-flex a-i-center" v-if="props.currentVessel?.shipname">
          <span>대상 선박</span>
          <span>{{ props.currentVessel.shipname }}</span>
        </div>

        <div class="v-info d-flex a-i-center" v-if="props.currentVessel?.shipname">
          <span>MMSI</span>
          <span>{{ props.currentVessel.mmsi }}</span>
        </div>

        <div class="v-info d-flex a-i-center" v-else>
          <span>선택된 선박이 없습니다.</span>
          <span></span>
        </div>
      </div>

      <div class="content" v-else></div>

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
    <button class="footer">Process</button>
  </main>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'

const props = defineProps({
  currentVessel: {
    type: Object,
    required: true
  }
})

const currentTab = ref('single')

const today = new Date()
today.setHours(0)
today.setMinutes(0)
today.setSeconds(0)
const pastStartTIme = ref(new Date(new Date(today).setHours(today.getHours() - 3)))
const pastEndTime = ref(new Date(today))
const predictEndTime = ref(new Date(new Date(today).setHours(today.getHours() + 3)))
</script>

<style scoped>
main {
  display: block !important;
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 450px;
  min-height: 300px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 5px #333333;
}
.header {
  height: 50px;
  width: 100%;
}
.header > button {
  height: 100%;
  border: none;
  background: none;
  border-bottom: 1px solid #DDDDDD;
}
.header > .tab {
  font: normal normal 800 18px/20px SUIT;
  letter-spacing: -0.45px;
  color: #bbbbbb;
  flex: 1;
  white-space: nowrap;
  cursor: pointer;
  padding: 0 20px;
  border-right: 1px solid #DDDDDD;
  border-bottom: 1px solid #DDDDDD;
}
.header > .tab:disabled {
  color: #444444;
  border-bottom: none;
  cursor: auto;
}
.container {
  padding: 20px;
}
.content {
  margin-bottom: 10px;
  gap: 10px;
}
.v-info {
  background: #F8F8F8;
  border-radius: 5px;
  padding: 0 15px;
  height: 40px;
  flex: 1;
  justify-content: space-between;
}
.v-info > span:first-child {
  font: normal normal bold 14px/20px SUIT;
  letter-spacing: -0.35px;
  color: #777777;
  white-space: nowrap;
}
.v-info > span:last-child {
  font: normal normal 600 15px/20px SUIT;
  letter-spacing: -0.4px;
  color: #444444;
  text-align: right;
}
.content:last-child {
  margin-bottom: 0;
}
.footer {
  width: 100%;
  padding: 10px;
  border: none;
  border-top: 1px solid #DDDDDD;
  background: none;
  cursor: pointer;
  border-radius: 0 0 10px 10px;
  font: normal normal 600 16px/20px SUIT;
}
.footer:hover {
  background: #f3f3f3;
}
</style>
