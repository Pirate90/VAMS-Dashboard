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
      @update:model-value="onChangeDate"
    >
      <template #month="{ value }">
        {{ value + 1 }}
      </template>
      <template #month-overlay-value="{ value }">
        {{ value + 1 }}
      </template>
    </VueDatePicker>
  </div>
</template>

<script setup>
import { onMounted, ref, defineEmits } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { iuuApi } from '@/apis'

const emit = defineEmits(['date:change'])

const minDate = ref(new Date())
const maxDate = ref(new Date())
const dateValue = ref(new Date())

onMounted(async () => {
  const { min, max } = await iuuApi.getMinMaxDate()
  dateValue.value = new Date(min)
  minDate.value = new Date(min)
  maxDate.value = new Date(max)

  onChangeDate()
})

function onChangeDate () {
  const y = dateValue.value.getFullYear()
  const m = (dateValue.value.getMonth() + 1).toString().padStart(2, 0)
  const ds = dateValue.value.getDate().toString().padStart(2, 0)
  const de = (dateValue.value.getDate() + 1).toString().padStart(2, 0)

  const s = `${y}${m}${ds}000000`
  const e = `${y}${m}${de}000000`
  emit('date:change', s, e)
}
</script>

<style scoped>
.range-selector {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  height: 40px;
}
</style>

<style>
.dp--menu-wrapper {
  left: 10px !important;
}
range-selector > .dp__main {
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
