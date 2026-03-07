<template>
  <main>
    <div class="header d-flex a-i-center">
      <button class="tab" @click="currentTab = 'req'" :disabled="currentTab === 'req'">작업 요청</button>
      <button class="tab" @click="currentTab = 'list'" :disabled="currentTab === 'list'">작업 목록</button>
      <button class="close" @click="emit('req:close')"><f-a-icon icon="x" /></button>
    </div>

    <div v-if="currentTab === 'req'" class="req-container">
      <div class="req-section">
        <div class="req-title">서비스 대분류</div>
        <div class="select-wrapper">
          <select v-model="selectedCategory" class="req-select">
            <option v-for="cat in serviceCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="req-section" v-if="selectedCategory">
        <div class="req-title">워크플로우 선택</div>
        <div class="req-options d-flex flex-column">
          <div v-for="wf in currentWorkflows" :key="wf.value" class="req-option d-flex a-i-center">
            <input type="radio" :id="wf.value" v-model="reqType" :value="wf.value">
            <label :for="wf.value">{{ wf.label }}</label>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="req-title">요청 타입</div>
      <div class="req-options d-flex">
        <div class="req-option d-flex j-c-center">
          <input type="radio" id="immediately" v-model="reqOption" value="immediately">
          <label for="immediately">즉시 요청</label>
        </div>
        <div class="req-option d-flex j-c-center">
          <input type="radio" id="schedule" v-model="reqOption" value="schedule">
          <label for="schedule">스케줄 등록</label>
        </div>
      </div>

      <div v-if="reqOption === 'immediately'">
        <div class="req-title">분석 기간 및 구역</div>
        <div class="immediately-props">
          <div class="d-flex a-i-center m-b-10">
            <span class="label-fixed">시작 시간</span>
            <VueDatePicker v-model="startTime" no-today auto-apply :max-date="endTime" />
          </div>
          <div class="d-flex a-i-center m-b-10">
            <span class="label-fixed">종료 시간</span>
            <VueDatePicker v-model="endTime" no-today auto-apply :min-date="startTime" />
          </div>
          <div class="d-flex a-i-center">
            <button class="draw-btn" @click="toggleDraw">구역 설정</button>
          </div>
          <div v-if="props.selectedCoords" class="coords-info">
            구역 설정 완료 ({{ props.selectedCoords.length }} points)
          </div>
        </div>
      </div>

      <div v-else class="schedule-props">
        <div>
          <div class="prop-label">스케줄 설정 (Cron)</div>
          <input type="text" v-model="schedule" placeholder="* * * * *">
        </div>
        <div>
          <div class="prop-label">분석 시간 간격</div>
          <input type="text" v-model="timeInterval" placeholder="예: 1h">
        </div>
      </div>

      <button class="footer" @click="handleProcess">워크플로우 등록</button>
    </div>

    <div v-else-if="currentTab === 'list'" class="list">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr :class="['data', j.status === 'FINISHED' ? 'data_f' : '']"
                v-for="j in jobList" :key="j.id" @click="onClickJob(j)">
              <td>{{ j.id }}</td>
              <td>{{ j.job_name }}</td>
              <td>{{ j.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, defineEmits, defineProps } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { requestApi } from '@/apis'

const props = defineProps({
  selectedCoords: Array
})
const emit = defineEmits(['req:close', 'req:draw'])

// 서비스 카테고리 데이터 정의
const serviceCategories = [
  {
    id: 'doubt',
    name: '관심지역 의심선박 분류 서비스',
    workflows: [
      { label: '배회 의심선박 탐지 워크플로우', value: '00' },
      { label: '환적 의심선박 분류 워크플로우', value: '01' }
    ]
  },
  {
    id: 'iuu',
    name: 'IUU 어업선박 감시 서비스',
    workflows: [
      { label: '선박 조업/비조업 자동식별 워크플로우', value: '02' },
      { label: '불법조업구역 추정 워크플로우', value: '03' },
      { label: 'IUU 어업패턴 감시 워크플로우', value: '04' }
    ]
  },
  {
    id: 'tracking',
    name: '의심선박 시공간 추적 서비스',
    workflows: [
      { label: '입항지연 선박 추정 워크플로우', value: '05' }
    ]
  }
]

const currentTab = ref('req')
const selectedCategory = ref('doubt')
const reqType = ref('00')
const reqOption = ref('immediately')

// 현재 대분류에 따른 소분류 목록 반환
const currentWorkflows = computed(() => {
  const cat = serviceCategories.find(c => c.id === selectedCategory.value)
  return cat ? cat.workflows : []
})

// 대분류 변경 시 소분류 첫 번째 아이템으로 자동 선택
watch(selectedCategory, (newVal) => {
  const cat = serviceCategories.find(c => c.id === newVal)
  if (cat && cat.workflows.length > 0) {
    reqType.value = cat.workflows[0].value
  }
})

// 시간 설정
const today = new Date()
const startTime = ref(new Date(new Date().setDate(today.getDate() - 3)))
const endTime = ref(new Date())

const schedule = ref('* /10 * * * * *')
const timeInterval = ref('')

// 구역 설정 버튼 핸들러
function toggleDraw () {
  emit('req:draw')
}

// 작업 실행
async function handleProcess () {
  console.log('Requesting Process:', {
    category: selectedCategory.value,
    type: reqType.value,
    option: reqOption.value,
    coords: props.selectedCoords,
    startTime: startTime.value,
    endTime: endTime.value
  })
  // API 호출 로직 추가
  console.log()
}

// 기존 목록 조회 로직 유지
const jobList = ref([])
watch(currentTab, async (v) => {
  if (v === 'list') {
    // API 구조에 맞게 selectedCategory.value 등을 활용하여 호출
    jobList.value = await requestApi.getDoubtList()
  }
})
</script>

<style scoped>
main {
  position: absolute;
  width: 460px;
  /* max-height: 500px; */
  background: #fff;
  top: 50px;
  right: 10px;
  border-radius: 10px;
  box-shadow: 0 0 5px #333333;
}
.header {
  min-height: 50px;
  justify-content: space-between;
}
.header > button {
  width: 50px;
  height: 50px;
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
.header > .tab:nth-child(2) {
  max-width: 150px;
}
.header > .tab:disabled {
  color: #444444;
  border-bottom: none;
  cursor: auto;
}
.header > .close {
  color: #000;
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header > .close:hover {
  cursor: pointer;
  opacity: 0.7;
}
.req-container {
  padding-bottom: 10px;
}
.req-section {
  margin-bottom: 5px;
}
.select-wrapper {
  padding: 0 20px;
}
.req-select {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #DDDDDD;
  border-radius: 5px;
  font: normal normal 600 15px/20px SUIT;
  outline: none;
  cursor: pointer;
}
.req-options.flex-column {
  flex-direction: column;
  gap: 10px;
}
.divider {
  height: 1px;
  background: #DDDDDD;
  margin: 15px 20px;
}
.label-fixed {
  width: 80px;
  font-size: 14px;
  font-weight: 600;
}
.m-b-10 { margin-bottom: 10px; }
.prop-label {
  font-weight: 800;
  margin-bottom: 5px;
}
.draw-btn {
  width: 100%;
  padding: 8px;
  background: #444;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
}
.coords-info {
  font-size: 12px;
  color: #2196F3;
  margin-top: 5px;
  text-align: center;
}
.req-title {
  padding: 10px 20px 5px 20px;
  font: normal normal 800 17px/20px SUIT;
}

.req-options {
  padding: 5px 10px 10px 10px;
  margin: 0 10px;
  gap: 20px;
  border-bottom: 1px solid #DDDDDD;
}

.req-option {
  position: relative;
  gap: 5px;
  font: normal normal 800 15px/20px SUIT;
}

.req-option > input[type=radio],
.req-option > label {
  cursor: pointer;
}

.immediately-props,
.schedule-props {
  padding: 5px 10px;
  margin: 0 10px;
}

.immediately-props > div,
.schedule-props > div {
  gap: 10px;
  margin-bottom: 10px;
}

.immediately-props > div > span,
.schedule-props > div > span {
  white-space: nowrap;
  font: normal normal 500 16px/20px SUIT;
}

.schedule-props > div > div {
  margin-bottom: 5px;
  font: normal normal 800 17px/20px SUIT;
  padding-top: 5px;
}

.schedule-props > div > input {
  width: 100%;
  padding: 5px 10px;
  background: #f3f3f3;
  border: none;
  font: normal normal 500 16px/20px SUIT;
}

.list {
  max-height: 400px;
  overflow-y: auto;
  /* padding: 10px 20px; */
  border-radius: 0 0 10px 10px;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  height: calc(100% - 80px);
}
table {
  font: normal normal bold 14px/20px SUIT;
  /* table-layout: fixed; */
  /* border-collapse: collapse; */
  border: none;
  width: 100%;
}

thead {
  text-transform: uppercase;
}

thead th {
  font: normal normal 800 15px/20px SUIT;
  letter-spacing: -0.75px;
  color: #444444;
  height: 40px;
}

th, td {
  padding: 8px;
  text-align: left;
  font: normal normal bold 14px/20px SUIT;
  letter-spacing: -0.7px;
  color: #444444;
  border: none;
}

tr.data_f:hover {
  cursor: pointer;
  background: rgb(159, 201, 255, 0.3);
}

tbody tr:nth-child(odd) {
  background-color: #F8F8F8;
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

<style>
</style>
