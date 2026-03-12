<template>
  <section class="report-management">
    <header class="title-area d-flex j-c-between a-i-center">
      <div class="title">선박활동 사건 및 보고서 관리</div>
      <div class="export-tools">
        <button class="btn-export">엑셀 다운로드</button>
      </div>
    </header>

    <div class="tabs d-flex">
      <button :class="{ active: currentTab === 'progress' }" @click="currentTab = 'progress'">진행중 사건</button>
      <button :class="{ active: currentTab === 'confirmed' }" @click="currentTab = 'confirmed'">확정된 사건</button>
      <button :class="{ active: currentTab === 'completed' }" @click="currentTab = 'completed'">완료/보고서 보관함</button>
      <button :class="{ active: currentTab === 'bookmarked' }" @click="currentTab = 'bookmarked'">관심사건 보관함</button>
    </div>

    <div class="tools-bar d-flex">
      <div class="form-group">
        <label class="label">발생 일자</label>
        <div class="date-picker-group d-flex a-i-center">
          <VueDatePicker v-model="startDate"
            no-today dark auto-apply year-first
            :enable-time-picker="false" week-start="0" :clearable="false"
            placeholder="시작일" @update:model-value="onChangeDate"
            :ui="{ input: 'date-picker__custom_event', calendar: 'calendar__custom' }"
          >
            <template #month="{ value }">{{ value + 1 }}</template>
            <template #month-overlay-value="{ value }">{{ value + 1 }}</template>
          </VueDatePicker>
          <span class="date-tilde">~</span>
          <VueDatePicker v-model="endDate"
            no-today dark auto-apply year-first
            :enable-time-picker="false" week-start="0" :clearable="false"
            placeholder="종료일" @update:model-value="onChangeDate"
            :ui="{ input: 'date-picker__custom_event', calendar: 'calendar__custom'}"
          >
            <template #month="{ value }">{{ value + 1 }}</template>
            <template #month-overlay-value="{ value }">{{ value + 1 }}</template>
          </VueDatePicker>
        </div>
      </div>

      <div class="form-group">
        <label class="label">빠른 설정</label>
        <div class="range-group d-flex">
          <button :class="{ active: currentRange === 'today' }" @click="setRange('today')">오늘</button>
          <button :class="{ active: currentRange === '3days' }" @click="setRange('3days')">3일</button>
          <button :class="{ active: currentRange === '1week' }" @click="setRange('1week')">1주일</button>
          <button :class="{ active: currentRange === '1month' }" @click="setRange('1month')">1개월</button>
          <button :class="{ active: currentRange === 'all' }" @click="setRange('all')">전체</button>
        </div>
      </div>

      <div class="form-group">
        <label class="label">사건 유형</label>
        <select class="custom-select" v-model="selectedCategory">
          <option value="all">전체보기</option>
          <option value="loitering">배회의심</option>
          <option value="transshipment">환적의심</option>
          <option value="illegal">불법어업</option>
          <option value="delayed">입항지연</option>
        </select>
      </div>

      <div class="form-group search-group">
        <label class="label">검색어</label>
        <div class="search-input-wrapper d-flex">
          <input type="text" v-model="searchQuery" placeholder="MMSI, 선박명, 사건번호 입력">
          <button class="btn-search" @click="fetchData">조회</button>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>사건번호</th>
            <th>발생 일시</th>
            <th>유형</th>
            <th>MMSI / 선박명</th>
            <th>발생 구역</th>
            <th>위험도</th>
            <th>보고서</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(event, idx) in filteredEventList" :key="idx">
            <td class="event-id">{{ event.eventId }}</td>
            <td>{{ event.timestamp }}</td>
            <td>
              <span class="badge" :class="event.type">{{ event.typeLabel }}</span>
            </td>
            <td>
              <div class="vessel-info">
                <span class="mmsi">{{ event.mmsi }}</span>
                <span class="name">{{ event.shipName }}</span>
              </div>
            </td>
            <td>{{ event.zone }}</td>
            <td>
              <span class="risk-level" :class="event.risk">{{ event.riskLabel }}</span>
            </td>
            <td>
              <button class="btn-report" :class="{ 'has-report': event.hasReport }" @click="openReport(event)">
                {{ event.hasReport ? '보고서 보기' : '보고서 생성' }}
              </button>
            </td>
            <td>
              <button class="btn-action" @click="showReport = true">상세/분석</button>
            </td>
          </tr>
          <tr v-if="filteredEventList.length === 0">
            <td colspan="8" class="empty-row">선택한 조건에 일치하는 사건이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page d-flex j-c-center">
      <button :disabled="true">1</button>
      <button>2</button>
      <button>3</button>
      <button>4</button>
    </div>

    <EventReport v-if="showReport" @report:close="showReport = false"/>
  </section>
</template>

<script setup>
// 💡 computed를 import 합니다.
import { ref, computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import EventReport from '@/components/11-REPORT/EventReport.vue'

const currentTab = ref('progress')
const currentRange = ref('today')
const selectedCategory = ref('all') // 기본값: 전체보기
const searchQuery = ref('')
const showReport = ref(false)

const startDate = ref(new Date())
const endDate = ref(new Date())

function onChangeDate (e) {
  console.log('선택된 날짜:', e)
}

function setRange (range) {
  currentRange.value = range
}

function fetchData () {
  console.log(`데이터 조회 요청: 탭=${currentTab.value}, 유형=${selectedCategory.value}, 검색어=${searchQuery.value}`)
}

function openReport (event) {
  if (event.hasReport) {
    alert(`${event.eventId} 보고서를 엽니다.`)
  } else {
    alert(`${event.eventId} 보고서 생성 창을 띄웁니다.`)
  }
}

const mockEventList = ref([
  { eventId: 'EVT-260312-001', timestamp: '2026-03-12 14:30:22', type: 'illegal', typeLabel: '불법어업', mmsi: '412000333', shipName: 'SUSPECT_C', zone: '동해북방어장', risk: 'high', riskLabel: '심각', hasReport: false },
  { eventId: 'EVT-260312-002', timestamp: '2026-03-12 11:15:00', type: 'loitering', typeLabel: '배회의심', mmsi: '412000111', shipName: 'UNKNOWN_A', zone: '가상EEZ', risk: 'medium', riskLabel: '주의', hasReport: true },
  { eventId: 'EVT-260311-003', timestamp: '2026-03-11 19:40:12', type: 'transshipment', typeLabel: '환적의심', mmsi: '412000222', shipName: 'SUSPECT_B', zone: '인천해양경찰서 관할', risk: 'high', riskLabel: '심각', hasReport: true },
  { eventId: 'EVT-260310-004', timestamp: '2026-03-10 08:05:45', type: 'delayed', typeLabel: '입항지연', mmsi: '440555666', shipName: 'SLOW_D', zone: '857 해구', risk: 'low', riskLabel: '관찰', hasReport: false },
  { eventId: 'EVT-260309-005', timestamp: '2026-03-09 23:50:11', type: 'loitering', typeLabel: '배회의심', mmsi: '440111222', shipName: 'FISHING_V', zone: '11-1 해구', risk: 'medium', riskLabel: '주의', hasReport: true }
])

// 💡 [핵심] 선택된 사건 유형에 따라 리스트를 즉각적으로 걸러내는 computed 속성
const filteredEventList = computed(() => {
  if (selectedCategory.value === 'all') {
    return mockEventList.value
  }
  return mockEventList.value.filter(event => event.type === selectedCategory.value)
})

</script>

<style scoped>
/* 기존 스타일 그대로 유지 (이전 답변과 동일) */
.report-management { background: #1e1e1e; width: 100%; height: 100%; padding: 40px 50px; position: relative; overflow-y: auto; }
.title-area { margin-bottom: 25px; }
.title { font: normal normal 600 28px/30px SUIT; letter-spacing: -1.4px; color: #FFFFFF; }

.btn-export {
  background: transparent; border: 1px solid #646BA1; color: #646BA1;
  padding: 8px 20px; border-radius: 6px; font-family: 'SUIT', sans-serif;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-export:hover { background: #646BA1; color: #fff; }

.tabs {
  background: #2A2A2A; width: fit-content; height: 45px;
  border-radius: 6px; border: 1px solid #444; margin-bottom: 25px; overflow: hidden;
}
.tabs > button {
  padding: 0 25px; border: none; background: none;
  font: normal normal 600 15px/45px SUIT; color: #888;
  cursor: pointer; transition: 0.2s;
}
.tabs > button:not(:last-child) { border-right: 1px solid #444; }
.tabs > button:hover { background: #333; }
.tabs > button.active { background: #646BA1; color: #fff; }

.tools-bar { display: flex; gap: 20px; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.label { font: normal normal 600 13px/1 SUIT; color: #aaa; margin: 0; padding-left: 2px; }

.date-picker-group, .range-group, .custom-select, .search-input-wrapper { height: 40px; }

.date-picker-group { gap: 10px; }
.date-tilde { color: #aaa; font-weight: bold; }

.range-group { gap: 6px; }
.range-group > button {
  background: #2A2A2A; border: 1px solid #555; border-radius: 5px;
  font: normal normal 600 14px/1 SUIT; color: #999;
  width: 65px; height: 100%; cursor: pointer; transition: 0.2s;
}
.range-group > button.active, .range-group > button:hover {
  background: #646BA1; border-color: #646BA1; color: #FFFFFF;
}

.custom-select {
  background: #2A2A2A; border: 1px solid #555; border-radius: 5px;
  font: normal normal 500 14px/1 SUIT; color: #FFFFFF;
  padding: 0 15px; width: 160px; outline: none;
}

.search-group { flex: 1; min-width: 300px; }
.search-input-wrapper { display: flex; width: 100%; }
.search-input-wrapper > input {
  flex: 1; height: 100%; background: #2A2A2A;
  border: 1px solid #555; border-right: none;
  border-radius: 5px 0 0 5px; padding: 0 15px;
  font: normal normal 500 14px/1 SUIT; color: #FFFFFF; outline: none;
}
.btn-search {
  width: 90px; height: 100%; background: #646BA1;
  border: none; border-radius: 0 5px 5px 0;
  font: normal normal 600 15px/1 SUIT; color: #FFFFFF;
  cursor: pointer; transition: 0.2s;
}
.btn-search:hover { background: #535985; }

.divider { width: 100%; height: 1px; background: #444; margin: 0 0 30px 0; }

.table-container { background: #2A2A2A; border-radius: 8px; border: 1px solid #444; overflow: hidden; margin-bottom: 30px; }
table { width: 100%; font: normal normal 500 14px/20px SUIT; color: #eee; border-collapse: collapse; }
thead { background: #1a1a1a; border-bottom: 1px solid #444; }
th { padding: 15px; color: #aaa; font-weight: 600; text-align: center; }
tbody > tr { text-align: center; border-bottom: 1px solid #333; transition: background 0.2s; }
tbody > tr:hover { background: #333; }
tbody > tr:last-child { border-bottom: none; }
td { padding: 12px 15px; vertical-align: middle; }

.event-id { font-family: monospace; color: #888; }
.vessel-info { display: flex; flex-direction: column; line-height: 1.4; }
.vessel-info .mmsi { font-size: 12px; color: #aaa; }
.vessel-info .name { font-weight: 600; color: #fff; }

.empty-row { padding: 40px; color: #888; font-size: 15px; }

.badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; color: #fff; }
.badge.loitering { background: #d97706; }
.badge.transshipment { background: #ea580c; }
.badge.illegal { background: #dc2626; }
.badge.delayed { background: #4b5563; }

.risk-level { padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.risk-level.high { background: rgba(220, 38, 38, 0.2); color: #ef4444; border: 1px solid #ef4444; }
.risk-level.medium { background: rgba(217, 119, 6, 0.2); color: #f59e0b; border: 1px solid #f59e0b; }
.risk-level.low { background: rgba(75, 85, 99, 0.2); color: #9ca3af; border: 1px solid #9ca3af; }

.btn-report { background: transparent; border: 1px solid #555; color: #aaa; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-report.has-report { background: #166534; border-color: #166534; color: #fff; }
.btn-report:hover { background: #444; color: #fff; }
.btn-report.has-report:hover { background: #15803d; }

.btn-action { background: #3b82f6; border: none; color: #fff; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-action:hover { background: #2563eb; }

.page { gap: 8px; }
.page button { width: 32px; height: 32px; background: #2A2A2A; border: 1px solid #444; border-radius: 4px; font-weight: bold; color: #888; cursor: pointer; transition: 0.2s; }
.page button:hover { background: #444; color: #fff; }
.page button:disabled { background: #646BA1; border-color: #646BA1; color: #fff; }
</style>

<style>
.dp--menu-wrapper { left: 0px !important; }
.dp__main { width: 140px !important; height: 40px !important; }
.dp__input_wrap, .date-picker__custom_event { height: 40px !important; }
.dp__input_icon { right: 0px !important; inset-inline-start: inherit; }
.date-picker__custom_event {
  font: normal normal 500 14px/11px SUIT !important;
  color: #FFFFFF !important;
  background: #2A2A2A;
  border: 1px solid #555 !important;
  border-radius: 5px !important;
  text-align: left !important;
  padding: 6px 10px;
}
.date-picker__custom_event::placeholder { color: #888; }
</style>
