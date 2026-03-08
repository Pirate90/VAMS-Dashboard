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
import { vesselApi } from '@/apis'

const emit = defineEmits(['change:datetime'])

// 💡 슬라이더 단위를 10분에서 1분으로 변경 (0 ~ 1439분 = 24시간)
const TIME_MIN = 0
const TIME_MAX = 1439

const sliderInput = ref()
const minDate = ref(new Date())
const maxDate = ref(new Date())
const dateValue = ref(new Date())
const timeValue = ref(10)

// 💡 1분 단위 시간에 맞게 시/분 포맷 계산 로직 수정
const timeConverted = computed(() => {
  const h = String(Math.floor(timeValue.value / 60)).padStart(2, '0')
  const m = String(timeValue.value % 60).padStart(2, '0')
  return `${h} : ${m}`
})

onMounted(async () => {
  const { min, max } = await vesselApi.getMinMaxDate()
  minDate.value = new Date(min)
  maxDate.value = new Date(max)

  initDate(minDate.value, maxDate.value)
  onChangeDateTime()
})

function initDate (min, max) {
  dateValue.value = new Date('2024-03-10')
}

// 💡 날짜 변환 헬퍼 함수
function formatToUtcmin (d) {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dt = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return { full: `${y}${mo}${dt}${h}${m}00`, dateOnly: `${y}${mo}${dt}000000` }
}

function onChangeDateTime () {
  // 1. 선택된 기준 날짜 (자정 기준)
  const baseDate = new Date(dateValue.value)
  baseDate.setHours(0, 0, 0, 0)

  // 2. 타겟 시간(종료 시간): 기준 날짜 + 슬라이더 분(Minute)
  const targetTime = new Date(baseDate.getTime() + timeValue.value * 60 * 1000)

  // 3. 검색 시작 시간: 타겟 시간으로부터 10분 전 (AIS 데이터 공백 방지용 Look-back Window)
  const startTime = new Date(targetTime.getTime() - (10 * 60 * 1000))

  // 4. 내일 날짜 계산
  const tomorrowDate = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)

  const s = formatToUtcmin(startTime).full
  const e = formatToUtcmin(targetTime).full // 💡 이게 정확한 현재 슬라이더 시간입니다
  const today = formatToUtcmin(targetTime).dateOnly
  const tomorrow = formatToUtcmin(tomorrowDate).dateOnly

  // 부모 컴포넌트로 데이터 전송
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
