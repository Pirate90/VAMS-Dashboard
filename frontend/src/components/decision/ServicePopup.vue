<template>
  <section class="information d-flex f-d-column">
    <div class="header d-flex a-i-center">
      <span>{{ props.vessel.shipname }}</span>
      <button @click="emit('info:close', props.vessel.vesselid)"><f-a-icon icon="x" /></button>
    </div>

    <div class="tabs d-flex a-i-center">
      <button class="tab" @click="currentTab = { name: 'information', component: InformationTab }" :disabled="currentTab.name === 'information'">선박 정보</button>
      <button class="tab" @click="currentTab = { name: 'explanation', component: ExplanationTab }" :disabled="currentTab.name === 'explanation'">선박활동 설명</button>
      <button class="tab" @click="currentTab = { name: 'reason', component: ReasonTab }" :disabled="currentTab.name === 'reason'">불법근거 제시</button>
    </div>

    <component :is="currentTab.component" :vessel="props.vessel"
      @info:trajectory="emit('info:trajectory', props.vessel.mmsi)"
      @info:normalize="vesselId => emit('info:normalize', vesselId)"
    />
  </section>
</template>

<script setup>
import { defineExpose, defineProps, defineEmits, shallowRef } from 'vue'
import InformationTab from './tabs/InformationTab.vue'
import ExplanationTab from './tabs/ExplanationTab.vue'
import ReasonTab from './tabs/ReasonTab.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  vessel: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['info:close', 'info:normalize', 'info:trajectory'])

const currentTab = shallowRef({ name: 'information', component: InformationTab })

defineExpose({
})
</script>

<style scoped>
.information {
  position: absolute;
  width: 450px;
  height: 575px;
  background-color: #ffffff;
  /* border: 1px solid #444444; */
  border-radius: 10px;
  box-shadow: 0 0 5px #333333;
  overflow: hidden;
  bottom: 50px;
  right: 10px;
  justify-content: space-between;
}
.header {
  font: normal normal 800 18px/20px SUIT;
  letter-spacing: -0.45px;
  color: #444444;
  min-height: 50px;
  justify-content: space-between;
  padding: 0px 20px;
  border-bottom: 1px solid #DDDDDD;
}
.header > span > button{
  border: none;
  background: none;
  font-size: 20px;
  margin-right: 20px;
}
.header > button {
  border: none;
  background: none;
  color: #000;
  width: 18px;
  height: 18px;
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header > span > button:hover,
.header > button:hover {
  cursor: pointer;
  opacity: 0.7;
}

.tabs {
}

.tabs > button {
  width: 50px;
  height: 50px;
  border: none;
  background: none;
  border-bottom: 1px solid #DDDDDD;
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

.tabs > button:disabled {
  color: #444444;
  border-bottom: none;
  cursor: auto;
}
</style>
