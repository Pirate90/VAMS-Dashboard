<template>
  <div class="range-selector" ref="rangeSelector">
    <VueDatePicker v-model="startDate"
      time-picker-inline enable-seconds no-today
      :clearable="false"
      placeholder="Start Date Time"
      input-class-name="date-picker__custom"
      :min-date="minDate"
      :max-date="endDate"
      @update:model-value="onChangeDate"
    />

    <div class="histogram" ref="histogram">
      <div v-for="(h, i) in histogramArr" :key="h.year_month_day_hour" :style="{ height: `${getPercentage(h.count)}%`}"
        @mouseenter="e => showPopover(e, h)"
        @mouseleave="popoverVisible = false"
        @click="onClickHistogram(i)"
      ></div>
    </div>

    <VueDatePicker v-model="endDate"
      time-picker-inline enable-seconds no-today
      :clearable="false"
      placeholder="End Date Time"
      input-class-name="date-picker__custom"
      :min-date="startDate"
      :max-date="maxDate"
      @update:model-value="onChangeDate"
    />

    <div class="popover" v-if="popoverVisible" :style="{ left: `${popoverPos}px`}">
      {{ currentHistogram.year_month_day_hour }}
      {{ currentHistogram.count }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, defineEmits } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { dataApi } from '@/apis'

const emit = defineEmits(['change:date'])

function onClickHistogram (i) {
  emit('change:date', {
    start: histogramArr.value[i].year_month_day_hour,
    end: histogramArr.value[i + 1].year_month_day_hour
  })
}

// popover
const rangeSelector = ref()
const popoverVisible = ref(false)
const popoverPos = ref(0)
const currentHistogram = ref({})
function showPopover (e, h) {
  const { x, width } = e.target.getBoundingClientRect()
  popoverPos.value = x + width / 2 - (window.innerWidth - rangeSelector.value.clientWidth)
  currentHistogram.value = h

  popoverVisible.value = true
}

// manage date
const minDate = ref(new Date())
const maxDate = ref(new Date())
const startDate = ref(new Date())
const endDate = ref(new Date())

const histogramArr = ref([])
const maxCount = ref(0)
watch(histogramArr, (h) => {
  maxCount.value = findMaxCount(h)
})

function findMaxCount (arr) {
  let max = 0
  arr.forEach(h => {
    if (h.count > max) max = h.count
  })
  return max
}

function getPercentage (v) {
  return v / maxCount.value * 100
}

onMounted(async () => {
  const { min, max } = await dataApi.getMinMaxDate()
  minDate.value = new Date(min)
  maxDate.value = new Date(max)

  initDate(minDate.value, maxDate.value)
  // await onChangeDate()
})

function initDate (min, max) {
  const minTime = min.getTime()
  const maxTime = max.getTime()

  const avgTime = (minTime + maxTime) / 2
  const avgDate = new Date(avgTime)

  startDate.value = new Date(new Date(avgDate).setDate(avgDate.getDate() - 1))
  endDate.value = new Date(new Date(avgDate).setDate(avgDate.getDate() + 1))
}

async function onChangeDate () {
  const unit = getDiffUnit(startDate.value, endDate.value)
  const startDateString = getDateString(startDate.value)
  const endDateString = getDateString(endDate.value)

  histogramArr.value = await dataApi.getHistogram(startDateString, endDateString, unit)
  histogramArr.value.forEach(h => { h.count *= 1 })
}

function getDateString (date = new Date()) {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, 0)
  const d = date.getDate().toString().padStart(2, 0)
  const h = date.getHours().toString().padStart(2, 0)
  const mm = date.getMinutes().toString().padStart(2, 0)
  const s = date.getSeconds().toString().padStart(2, 0)
  return `${y}${m}${d}${h}${mm}${s}`
}

function getDiffUnit (s, e) {
  // 두 날짜를 밀리초로 변환
  const start = new Date(s).getTime()
  const end = new Date(e).getTime()

  // 두 날짜의 차이
  const difference = end - start

  // 밀리초 단위를 일, 시간, 분, 초 단위로 변환
  // const seconds = Math.floor((difference / 1000) % 60)
  // const minutes = Math.floor((difference / (1000 * 60)) % 60)
  // const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))

  if (days > 400) return 'year'
  else if (days > 40) return 'month'
  else if (days > 2) return 'day'
  else return 'hour'
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
  height: 50px;
}
.histogram {
  display: flex;
  flex: 1;
  border-radius: 0;
  background: #222222;
  /* opacity: 0.9; */
  align-items: center;
  padding: 5px 0;
}
.histogram > div {
  flex: 1;
  background: #00FFBC;
}
.histogram > div:hover {
  cursor: pointer;
  background: #00c792;
  border: 1px solid #222222;
}
.popover {
  position: absolute;
  top: -130%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>

<style>
.dp__main {
  width: 200px !important;
}
.dp__main,
.dp__input_wrap,
.date-picker__custom {
  height: 50px !important;
}
.date-picker__custom {
  border-radius: 0 !important;
  background: #222222 !important;
  /* opacity: 0.9; */
  border: none !important;
  color: #ffffff !important;
  padding-right: 10px !important;
}
.date-picker__custom::placeholder {
  color: #cccccc;
}
</style>
