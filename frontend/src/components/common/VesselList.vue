<template>
  <section class="list d-flex f-d-column" v-if="show">
    <div class="header">
      <span>선박 목록</span>
      <button class="close-btn" @click="emit('list:close')"><f-a-icon icon="x" /></button>
    </div>

    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>IDX</th>
            <th>MMSI</th>
            <th>Ship Name</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          <tr class="data" v-for="s in currentPageContent" :key="s.vesselid || s.mmsi" @click="currentVessel = s">
            <td class="d-flex j-c-center">{{ s.idx || '-' }}</td>
            <td>{{ s.mmsi }}</td>
            <td class="ship-name">{{ s.shipname }}</td>
            <td>{{ s.flagcountry }}</td>
          </tr>
          <tr v-if="currentPageContent.length === 0">
            <td colspan="4" class="empty-data">조회된 선박이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination d-flex j-c-center">
      <button class="chevron" @click="decreasePageNum" :disabled="!decreasable">
        <f-a-icon icon="chevron-left" />
      </button>
      <button class="page" v-for="i in currentPageList" :key="i" @click="currentPage = i"
        :disabled="currentPage === i">{{ i }}</button>
      <button class="chevron" @click="increasePageNum" :disabled="!increasable">
        <f-a-icon icon="chevron-right" />
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { vesselApi } from '@/apis'
// 💡 VesselInformation 임포트 삭제 완료

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  list: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['list:close', 'info:show', 'info:hide', 'info:trajectory'])

const NUM_OF_DISPLAY = 10
const NUM_OF_PAGE = 10

const currentPageNum = ref(0)
const currentPage = ref(1)
const currentVessel = ref(null)

watch(() => props.list, () => {
  currentPageNum.value = 0
  currentPage.value = 1
  currentVessel.value = null
})

watch(currentVessel, async (vessel) => {
  if (vessel) {
    await vesselApi.getMinMaxDateByVessel(vessel.mmsi)
    emit('info:show', vessel)
  } else {
    emit('info:hide')
  }
})

const totalPage = computed(() => Math.ceil(props.list.length / NUM_OF_DISPLAY) || 1)

const currentPageList = computed(() => {
  const startPage = currentPageNum.value * NUM_OF_PAGE + 1
  const endPage = Math.min(startPage + NUM_OF_PAGE - 1, totalPage.value)
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
})

const currentPageContent = computed(() => {
  const start = (currentPage.value - 1) * NUM_OF_DISPLAY
  return props.list.slice(start, start + NUM_OF_DISPLAY)
})

const decreasable = computed(() => currentPageNum.value > 0)
const increasable = computed(() => (currentPageNum.value + 1) * NUM_OF_PAGE < totalPage.value)

function decreasePageNum () {
  if (decreasable.value) {
    currentPageNum.value -= 1
    currentPage.value = currentPageList.value[currentPageList.value.length - 1]
  }
}

function increasePageNum () {
  if (increasable.value) {
    currentPageNum.value += 1
    currentPage.value = currentPageList.value[0]
  }
}

defineExpose({
  changeCurrentVessel: (c) => {
    currentVessel.value = props.list.find(v => v.vesselid === c.vesselid || v.mmsi === c.mmsi) || null
  }
})
</script>

<style scoped>
/* 1. 전체 리스트 크기 및 여백 대폭 축소 */
.list {
  width: 360px; /* 기존 450px -> 360px */
  height: auto;
  max-height: 480px; /* 내용이 적을 땐 줄어들고, 많으면 최대 높이 제한 */
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  justify-content: space-between;
}

.header {
  display: flex; /* 추가: Flexbox 명시 */
  align-items: center; /* 추가: 수직 중앙 정렬 */
  justify-content: space-between; /* 추가: 양끝 배치 */
  width: 100%;
  box-sizing: border-box;
  font: normal normal 700 15px/20px SUIT;
  color: #333333;
  min-height: 40px;
  padding: 0px 15px;
  border-bottom: 1px solid #DDDDDD;
}

.close-btn {
  margin-left: auto; /* 핵심: 오른쪽 끝으로 밀어냅니다 */
  border: none;
  background: none;
  color: #555;
  width: 16px;
  height: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-btn:hover {
  opacity: 0.6;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 5px;
}

table {
  width: 100%;
  border-collapse: collapse; /* 테이블 셀 사이 간격 제거 */
}

/* 2. 테이블 내 글씨 크기 및 패딩 축소 */
thead th {
  font: normal normal 700 12px/16px SUIT; /* 15px -> 12px */
  color: #666;
  height: 32px; /* 40px -> 32px */
  border-bottom: 1px solid #EEEEEE;
  text-transform: uppercase;
  padding: 4px 8px;
  text-align: left;
}

th, td {
  padding: 6px 8px; /* 8px -> 6px 8px */
  font: normal normal 500 12px/16px SUIT; /* 14px -> 12px */
  color: #444444;
  border: none;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
}

/* 텍스트가 너무 길면 말줄임표 처리 */
.ship-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-data {
  text-align: center;
  padding: 20px;
  color: #999;
}

tr.data:hover {
  cursor: pointer;
  background: rgba(77, 97, 255, 0.1);
}

tbody tr:nth-child(odd) {
  background-color: #FBFBFB;
}

/* 3. 페이지네이션 버튼 크기 축소 */
.pagination {
  gap: 3px;
  margin: 10px 0;
}

.pagination > button {
  border: none;
  border-radius: 4px;
  background: none;
  font: normal normal 600 12px/20px SUIT; /* 15px -> 12px */
  width: 24px; /* 30px -> 24px */
  height: 24px;
  color: #444;
  transition: all 0.2s;
}

.pagination > button:hover {
  cursor: pointer;
  background: #4D61FF;
  color: #ffffff;
}

.page:disabled {
  cursor: default !important;
  background: #4D61FF;
  color: #ffffff;
}

.chevron:disabled {
  cursor: default !important;
  background: none !important;
  color: #cccccc !important;
}

/* 4. 불필요한 죽은 코드(Dead Code) CSS 전면 삭제 완료 */
</style>
