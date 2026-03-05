<template>
  <main>
    <LoadingSpinner v-if="isLoading"/>
    <div class="content">
      <ToolBar @section:change="onChangeSection" @trenchmap:change="onChangeTrenchmap"
        @list:show="showList"
      ></ToolBar>
      <MainMap ref="map" @data:load="isLoading = false" @data:loadstart="isLoading = true" @draw:completed="onDrawCompleted"></MainMap>
      <WorkflowPopup :selectedCoords="selectedCoords" @req:draw="handleStartDraw" @req:close="isRequestPopupShow = false"/>
      <DateSelector @date:change="onChangeDate"></DateSelector>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import ToolBar from '@/components/fishing/ToolBar'
import MainMap from '@/components/fishing/MainMap'
import WorkflowPopup from '@/components/fishing/WorkflowPopup'
import DateSelector from '@/components/fishing/DateSelector'
import LoadingSpinner from '@/components/LoadingSpinner'

const map = ref()
const isLoading = ref(false)

const selectedCoords = ref(null)

// 1. 팝업에서 "구역 설정" 클릭 시 호출
function handleStartDraw () {
  map.value.startDraw()
}

// 2. 지도에서 그리기 완료 시 호출되어 팝업으로 좌표 전달
function onDrawCompleted (coords) {
  selectedCoords.value = coords
  alert('구역 설정이 완료되었습니다.')
}

function onChangeSection (s) {
  map.value.changeCenter(s)
}
function onChangeTrenchmap (t) {
  map.value.changeTrenchmap(t)
}
function onChangeDate (start, end) {
  isLoading.value = true
  map.value.changeDate(start, end)
}
function showList () {
  map.value.showList()
}
</script>

<style scoped>
main {
  flex: 1;
  display: flex;
}
.content {
  position: relative;
  flex: 1;
}
</style>
