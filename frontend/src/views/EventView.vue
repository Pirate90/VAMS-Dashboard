<template>
  <section>
    <div class="title">
      선박활동 사건 관리
    </div>

    <div class="filters d-flex">
      <button :disabled="true">진행중 사건</button>
      <button>확정된 사건</button>
      <button>완료사건 보관함</button>
      <button>관심사건 보관함</button>
    </div>

    <div class="tools d-flex">
      <div class="date">
        <div class="label">사건일자</div>
        <div class="d-flex" style="gap: 10px;">
          <VueDatePicker v-model="startDate"
          no-today dark auto-apply year-first
          :enable-time-picker="false"
          week-start="0"
          :clearable="false"
          placeholder="Start Date Time"
          @update:model-value="onChangeDate"
          :ui="{ input: 'date-picker__custom_event', calendar: 'calendar__custom' }"
          >
          <template #month="{ value }">
            {{ value + 1 }}
          </template>
          <template #month-overlay-value="{ value }">
            {{ value + 1 }}
          </template>
        </VueDatePicker>
        <VueDatePicker v-model="startDate"
          no-today dark auto-apply year-first
          :enable-time-picker="false"
          week-start="0"
          :clearable="false"
          placeholder="Start Date Time"
          @update:model-value="onChangeDate"
          :ui="{ input: 'date-picker__custom_event', calendar: 'calendar__custom'}"
          >
          <template #month="{ value }">
            {{ value + 1 }}
          </template>
          <template #month-overlay-value="{ value }">
            {{ value + 1 }}
          </template>
        </VueDatePicker>
        </div>
      </div>

      <div class="range d-flex">
        <button :disabled="true">오늘</button>
        <button>3일</button>
        <button>1주일</button>
        <button>1개월</button>
        <button>전체</button>
      </div>
      <div class="category">
        <div class="label">사건분류</div>
        <select name="" id="" placeholder="사건분류">
          <option value="doubt">의심선박</option>
        </select>
      </div>

      <div class="search d-flex">
        <input type="text" name="" id="" placeholder="검색어를 입력하세요.">
        <button>조회</button>
        <button @click="showReport = true">분석</button>
      </div>
    </div>

    <div style="width: 100%; height: 1px; background: #4e4e4e; margin: 30px 0;"></div>

    <div style="margin-bottom: 30px;">
      <table class="table" style="width: 100%;">
        <thead>
          <tr>
            <th>시간</th>
            <th>관심선박 ID</th>
            <th>MMSI</th>
            <th>Ship Name</th>
            <th>Country</th>
            <th>보고서 생성</th>
            <th>선박 확인 요청</th>
            <th>영상</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in 10" :key="n">
            <td>2024-09-05 09:11:53</td>
            <td>31</td>
            <td>413518720</td>
            <td>HE HAI LEI FU</td>
            <td>Unknown</td>
            <td>Complete</td>
            <td>Requested</td>
            <td>X</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page d-flex">
      <button :disabled="true">1</button>
      <button>2</button>
      <button>3</button>
      <button>4</button>
    </div>

    <EventReport v-if="showReport" @report:close="showReport = false"/>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import EventReport from '@/components/event/EventReport.vue'

const startDate = ref(new Date())
const showReport = ref(false)

function onChangeDate (e) {
  console.log(e)
  // const y = dateValue.value.getFullYear()
  // const m = (dateValue.value.getMonth() + 1).toString().padStart(2, 0)
  // const ds = dateValue.value.getDate().toString().padStart(2, 0)
  // const de = (dateValue.value.getDate() + 1).toString().padStart(2, 0)

  // const s = `${y}${m}${ds}000000`
  // const e = `${y}${m}${de}000000`
  // console.log(s, e)
}
</script>

<style scoped>
section {
  background: #2A2A2A;
  width: 100%;
  height: 100%;
  padding: 50px;
  position: relative;
}
.title {
  font: normal normal 600 28px/20px SUIT;
  letter-spacing: -1.4px;
  color: #FFFFFF;
  margin-bottom: 30px;
}
.filters {
  width: 680px;
  height: 45px;
  border-radius: 5px;
  border: 1px solid #555555;
  margin-bottom: 25px;
}
.filters > button {
  flex: 1;
  border: none;
  background: none;
  font: normal normal 600 17px/11px SUIT;
  letter-spacing: 0px;
  color: #AAAAAB;
  cursor: pointer;
}
.filters > button:not(:last-child) {
  border-right: 1px solid #555555;
}
.filters > button:hover,
.filters > button:disabled {
  background: #444;
  color: #fff;
}
.filters > button:disabled {
  cursor: auto;
}
.date > .label, .category > .label {
  font: normal normal 600 16px/20px SUIT;
  letter-spacing: -0.8px;
  color: #FFFFFF;
  margin-bottom: 10px;
}
.range {
  margin-left: 15px;
  padding-top: 30px;
  gap: 5px;
}
.range > button {
  background: #2A2A2A;
  border: 1px solid #555555;
  border-radius: 5px;font: normal normal 600 16px/11px SUIT;
  letter-spacing: 0px;
  color: #999999;
  width: 70px;
  height: 40px;
  cursor: pointer;
}
.range > button:disabled,
.range > button:hover {
  background: #444444;
  color: #FFFFFF;
}
.range > button:disabled {
  cursor: auto;
}
.category {
  margin-left: 25px;
}
.category > select {
  width: 170px;
  height: 40px;
  background: #2A2A2A;
  border: 1px solid #555555;
  border-radius: 5px;
  font: normal normal 600 16px/11px SUIT;
  letter-spacing: 0px;
  color: #FFFFFF;
  padding: 0 15px;
}
.search {
  padding-top: 30px;
  margin-left: 30px;
  gap: 20px;
}
.search > input[type="text"] {
  background: #2A2A2A;
  border: 1px solid #555555;
  border-radius: 5px;
  width: 390px;
  height: 40px;
  padding: 0 20px;
  color: #ffffff;
  font: normal normal 600 16px/11px SUIT;
}
.search > button {
  width: 120px;
  height: 40px;
  background: #646BA1;
  border-radius: 5px;
  border: none;
  font: normal normal 600 16px/11px SUIT;
  letter-spacing: 0px;
  color: #FFFFFF;
  cursor: pointer;
}
table {
  font: normal normal medium 16px/20px SUIT;
  letter-spacing: -0.4px;
  color: #FFFFFF;
  border-collapse: collapse;
}
thead {
  height: 50px;
  background: #444;
}
tbody > tr {
  text-align: center;
  height: 50px;
}
tbody > tr:nth-child(even) {
  background: #333333;
  border: 1px solid #444 !important;
}
.page {
  gap: 5px;
}
.page button {
  width: 30px;
  height: 30px;
  background: #444444;
  border-radius: 5px;
  font: normal normal bold 15px/20px SUIT;
  letter-spacing: -0.38px;
  color: #999999;
  border: none;
}
.page button:disabled {
  background: #646BA1;
  color: #fff;
}
</style>

<style>
.dp--menu-wrapper {
  left: 10px !important;
}
.dp__main {
  width: 150px !important;
  height: 40px !important;
}
.dp__input_wrap,
.date-picker__custom_event {
  height: 40px !important;
}
.dp__input_icon {
  right: 0px !important;
  inset-inline-start: inherit;
}
.date-picker__custom_event {
  font: normal normal 600 16px/11px SUIT !important;
  letter-spacing: -0.4px !important;
  color: #FFFFFF !important;
  background: #2A2A2A;
  border: 1px solid #555555 !important;
  border-radius: 5px !important;
  text-align: left !important;
  padding: 6px 10px;
}
.date-picker__custom_event::placeholder {
  color: #cccccc;
}
</style>
