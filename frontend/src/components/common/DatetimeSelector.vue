<template>
  <div class="range-selector">
    <VueDatePicker v-model="dateValue"
      no-today dark auto-apply year-first
      :enable-time-picker="false"
      week-start="0"
      :clearable="false"
      placeholder="Start Date Time"
      :ui="{ input: 'date-picker__custom', calendar: 'calendar__custom'}"
      :min-date="minDate"
      :max-date="maxDate"
      @update:model-value="onChangeDateTime"
    >
      <template #month="{ value }">
        {{ value + 1 }}
      </template>
      <template #month-overlay-value="{ value }">
        {{ value + 1 }}
      </template>
    </VueDatePicker>

    <div class="time-slider-wrap d-flex j-c-center a-i-center">
      <!-- <span class="min-value d-flex j-c-center">00 : 00</span> -->
      <input type="range" list="tick" ref="sliderInput" v-model="timeValue"
        :min="TIME_MIN" :max="TIME_MAX"
        @change="onChangeDateTime"
      >
      <span class="current">{{ timeConverted }}</span>
      <datalist id="tick">
        <option value="60">60</option>
      </datalist>
      <!-- <span class="max-value d-flex j-c-center">24 : 00</span> -->
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, defineEmits } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { doubtApi } from '@/apis'

const emit = defineEmits(['change:datetime'])

const TIME_MIN = 0
const TIME_MAX = 144

const sliderInput = ref()
const minDate = ref(new Date())
const maxDate = ref(new Date())
const dateValue = ref(new Date())
const timeValue = ref(10)

const timeConverted = computed(() => {
  const h = Math.floor(timeValue.value / 6).toString().padStart(2, 0)
  const m = timeValue.value % 6 + '0'
  return `${h} : ${m}`
})

onMounted(async () => {
  const { min, max } = await doubtApi.getMinMaxDate()
  minDate.value = new Date(min)
  maxDate.value = new Date(max)

  initDate(minDate.value, maxDate.value)
  onChangeDateTime()
})

function initDate (min, max) {
  // const minTime = min.getTime()
  // const maxTime = max.getTime()

  // const avgTime = (minTime + maxTime) / 2
  // const avgDate = new Date(avgTime)

  // dateValue.value = new Date(new Date(avgDate).setDate(avgDate.getDate() - 1))
  dateValue.value = new Date('2024-03-10')
}

function onChangeDateTime () {
  const y = dateValue.value.getFullYear()
  const m = (dateValue.value.getMonth() + 1).toString().padStart(2, 0)
  const d = dateValue.value.getDate().toString().padStart(2, 0)
  const dt = (dateValue.value.getDate() + 1).toString().padStart(2, 0)
  const h = Math.floor(timeValue.value / 6).toString().padStart(2, 0)
  const mmStart = timeValue.value % 6 + '0'
  const mmEnd = timeValue.value % 6 + 1 + '0'

  const s = `${y}${m}${d}${h}${mmStart}00`
  const e = `${y}${m}${d}${h}${mmEnd}00`
  const today = `${y}${m}${d}000000`
  const tomorrow = `${y}${m}${dt}000000`
  emit('change:datetime', s, e, today, tomorrow)
}
</script>

<style scoped>
.range-selector {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  z-index: 999;
  display: flex;
  height: 40px;
  gap: 10px;
  background: #222222;
}
.time-slider-wrap {
  flex: 1;
  background: #222222;
  height: 100%;
  position: relative;
}
.min-value, .max-value {
  color: #ffffff;
  width: 100px !important;
  font: normal normal 700 16px/20px SUIT;
}
.current {
  position: absolute;
  color: #ffffff;
}
input[type=range] {
  flex: 1;
  appearance: none;
  background: #6c6d70;
  height: 100%;
}
input[type=range]::-webkit-slider-thumb {
  appearance: none;
  width: 2px;
  height: 40px;
  border-radius: 25px;
  background: #cccccc;
  cursor: e-resize;
}
</style>

<style>
.dp--menu-wrapper {
  left: 10px !important;
}
.range-selector > .dp__main {
  width: 150px !important;
  height: 40px !important;
}
.dp__input_wrap,
.date-picker__custom {
  height: 40px !important;
}
.date-picker__custom {
  border-radius: 0 !important;
  background: #222222 !important;
  border: none !important;
  padding-right: 10px !important;
  color: #ffffff !important;
  font: normal normal 700 16px/20px SUIT !important;
}
.date-picker__custom::placeholder {
  color: #cccccc;
}
</style>
