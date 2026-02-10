<template>
  <section class="list d-flex f-d-column" v-if="show">
    <div class="header d-flex a-i-center">
      <span>선박 목록</span>
      <button @click="emit('list:close')"><f-a-icon icon="x" /></button>
    </div>

    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>IDX</th>
            <th>MMSI</th>
            <th>Ship Name</th>
            <th>Flag Country</th>
          </tr>
        </thead>
        <tbody>
          <tr class="data" v-for="s in currentPageContent" :key="s.vesselid" @click="currentVessel = s">
            <td class="d-flex j-c-center">{{ s.idx }}</td>
            <td>{{ s.mmsi }}</td>
            <td>{{ s.shipname }}</td>
            <td>{{ s.flagcountry }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination d-flex j-c-center">
      <button class="chevron" @click="decreasePageNum" :disabled="!decreasable"><f-a-icon
          icon="chevron-left" /></button>
      <button class="page" v-for="i in currentPageList" :key="i" @click="currentPage = i"
        :disabled="currentPage === i">{{ i }}</button>
      <button class="chevron" @click="increasePageNum" :disabled="!increasable"><f-a-icon
          icon="chevron-right" /></button>
    </div>
  </section>

  <VesselInformation style="bottom: 10px;" v-if="show && currentVessel" :vessel="currentVessel" @info:close="currentVessel = null"
    @info:trajectory="emit('info:trajectory', currentVessel.mmsi)"
  />
</template>

<script setup>
import { defineExpose, defineProps, defineEmits, computed, ref, watch } from 'vue'
import VesselInformation from '@/components/VesselInformation'
import { doubtApi } from '@/apis'

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
const dateByVessel = ref(null)

watch(() => props.list, () => {
  currentPageNum.value = 0
  currentPage.value = 1
  currentVessel.value = null
})

watch(currentVessel, async c => {
  if (c) {
    dateByVessel.value = await doubtApi.getMinMaxDateByVessel(c.mmsi)
    emit('info:show', currentVessel.value)
  } else {
    dateByVessel.value = null
    emit('info:hide')
  }
})

const totalPage = computed(() => {
  return Math.ceil(props.list.length / NUM_OF_DISPLAY)
})

const currentPageList = computed(() => {
  const arr = []
  for (let i = 1; i <= NUM_OF_PAGE && i + (currentPageNum.value * NUM_OF_PAGE) <= totalPage.value; i += 1) {
    arr.push(i + (currentPageNum.value * NUM_OF_PAGE))
  }
  return arr
})

const currentPageContent = computed(() => {
  const start = (currentPage.value - 1) * NUM_OF_DISPLAY
  const end = start + NUM_OF_DISPLAY
  return props.list.filter((s, i) => i >= start && i < end)
})

const decreasable = computed(() => currentPageNum.value > 0)
function decreasePageNum () {
  currentPageNum.value -= 1
  currentPage.value = currentPageList.value[currentPageList.value.length - 1]
}

const increasable = computed(() => totalPage.value / ((currentPageNum.value + 1) * NUM_OF_PAGE) > 1)
function increasePageNum () {
  currentPageNum.value += 1
  currentPage.value = currentPageList.value[0]
}

defineExpose({
  changeCurrentVessel: (c) => {
    currentVessel.value = props.list.find(v => v.vesselid === c.vesselid)
  }
})
</script>

<style scoped>
.list {
  position: absolute;
  width: 450px;
  height: 525px;
  background-color: #ffffff;
  /* border: 1px solid #444444; */
  border-radius: 10px;
  box-shadow: 0 0 5px #333333;
  overflow: hidden;
  bottom: 50px;
  left: 10px;
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

tr.data:hover {
  cursor: pointer;
  background: rgb(159, 201, 255, 0.3);
}

tbody tr:nth-child(odd) {
  background-color: #F8F8F8;
}

.pagination {
  gap: 3px;
  margin: 10px 0;
}
.pagination > button {
  border: none;
  border-radius: 5px;
  background: none;
  font: normal normal bold 15px/20px SUIT;
  width: 30px;
  height: 30px;
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
  color: #888888 !important;
}

.currentVessel {
  padding: 10px 15px;
  gap: 10px;
}
.currentVessel > .container {
  gap: 10px;
}
.currentVessel img {
  width: 15px;
  height: 15px;
}
.vessel-id, .date, .vessel-info {
  font: normal normal 800 16px/20px SUIT;
  letter-spacing: -0.4px;
  color: #444444;
  gap: 6px;
}
.vessel-id-value, .vessel-type, .nav-status-code,
.vessel-longitude, .country-flag, .vessel-latitude {
  background: #F8F8F8;
  border-radius: 5px;
  padding: 0 15px;
  height: 40px;
}
.vessel-id-value {
  font: normal normal 600 16px/20px SUIT;
  letter-spacing: -0.4px;
  color: #444444;
  margin-top: 10px;
}
.mmsi, .imo, .callsign {
  height: 70px;
  gap: 5px;
  border-radius: 5px;
}
.mmsi > .title, .imo > .title, .callsign > .title {
  font: normal normal 800 16px/20px SUIT;
  letter-spacing: -0.4px;
}
.mmsi > .value, .imo > .value, .callsign > .value {
  font: normal normal 600 16px/20px SUIT;
  letter-spacing: -0.4px;
}
.mmsi {
  background: #EAE4FF;
  color: #7D58FF;
}
.imo {
  background: #DBE5FB;
  color: #176AFF;
}
.callsign {
  background: #FCEEBD;
  color: #AE6E00;
}
.container-inline {
  height: 30px;
}
.container-inline .value {
  position: relative;
  font: normal normal 600 15px/20px SUIT;
  letter-spacing: -0.38px;
  color: #444444;
  border-radius: 5px;
  background: #F8F8F8;
  height: 30px;
}
.container-inline .addon::after {
  content: '-';
  position: absolute;
  right: -8.5px;
  top: 4px;
}

.vessel-type, .nav-status-code, .vessel-longitude, .country-flag, .vessel-latitude {
  justify-content: space-between;
}
.vessel-type > .name, .nav-status-code > .name, .vessel-longitude > .name,
.country-flag > .name, .vessel-latitude > .name {
  font: normal normal bold 14px/20px SUIT;
  letter-spacing: -0.35px;
  color: #777777;
}
.vessel-type > .value, .nav-status-code .value, .vessel-longitude > .value,
.country-flag > .value, .vessel-latitude > .value {
  font: normal normal 600 16px/20px SUIT;
  letter-spacing: -0.4px;
  color: #444444;
}

.popover {
  position: absolute;
  bottom: 30px;
  right: -10px;
  width: 200px;
  font: normal normal 500 12px/20px SUIT;
  color: #ffffff;
  background-color: #222222;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0px 5px rgba(0, 0, 0, 1);
}

.information-tools {
  justify-content: space-between;
  margin-top: 10px;
}
.information-tools > .tools {
  gap: 15px;
}
.information-tools > .tools > button {
  border: none;
  background: none;
  font-size: 21px;
  color: #444444;
}
.information-tools > .tools > button:hover {
  cursor: pointer;
  opacity: 0.7;
}
</style>
