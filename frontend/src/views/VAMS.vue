<template>
  <main>
    <LoadingSpinner v-if="isLoading"/>
    <div class="content">
      <DistrictmapConfig :show="showDistrictmapConfig"
        @districtmapconfig:change="onChangeDistrictmapConfig"
        @districtmapconfig:selectall="onSelectall"
        @districtmapconfig:unselectall="onUnselectall"
      ></DistrictmapConfig>
      <ImgList :show="showImgList"
        @img:display="displayImg"
      ></ImgList>
      <ToolBar @section:change="onChangeSection"
        @trenchmap:change="onChangeTrenchmap"
        @filter:change="onChangeFilter"
        @districtmapconfig:toggle="showDistrictmapConfig = !showDistrictmapConfig"
        @imglist:toggle="showImgList = !showImgList"
        @toolbar:draw="handleStartDraw" :selectedCoords="selectedCoords"
      ></ToolBar>
      <MainMap ref="map" @info:show="showVesselInfo" @data:load="isLoading = false" @draw:completed="onDrawCompleted"></MainMap>
      <VesselInformation ref="vesselInfo" v-if="show"
        :vessel="currentVessel"
        @info:close="closeVesselInfo"
        @info:highlight="map.highlight"
        @info:normalize="map.normalize"
        @info:trajectory="showTrajectory"
      ></VesselInformation>
      <DatetimeSelector @change:datetime="onChangeDatetime"></DatetimeSelector>
    </div>
    <div class="result-popup" v-if="displayResult">
      <button @click="displayResult = false"><f-a-icon icon="x" /></button>
      <img :src="`/tracing/img/${currentResult}/result.png`" alt="">
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import ToolBar from '@/components/vams/ToolBar'
import MainMap from '@/components/vams/MainMap'
import DatetimeSelector from '@/components/vams/DatetimeSelector'
import VesselInformation from '@/components/VesselInformation'
import LoadingSpinner from '@/components/LoadingSpinner'
// import DistrictmapConfigModal from '@/components/DistrictmapConfigModal'
import DistrictmapConfig from '@/components/DistrictmapConfig'
import ImgList from '@/components/vams/ImgList'

const map = ref()
const vesselInfo = ref()

const isLoading = ref(false)
const showDistrictmapConfig = ref(false)
const showImgList = ref(false)
const displayResult = ref(false)
const currentResult = ref('')
const vesselList = ref([])
const currentVessel = ref({})
const show = ref(false)
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
function onChangeFilter (f) {
  map.value.changeFilter(f)
}
function onChangeDatetime (start, end, today, tomorrow) {
  isLoading.value = true
  map.value.changeDatetime(start, end, today, tomorrow)
}
function onChangeDistrictmapConfig (e) {
  map.value.changeDistrictmapConfig(e)
}
function onSelectall () {
  map.value.onSelectAllDistrict()
}
function onUnselectall () {
  map.value.onUnselectAllDistrict()
}
function displayImg (info, type) {
  if (type === 'result') {
    currentResult.value = info.name
    displayResult.value = true
  } else {
    map.value.displayImg(info, type)
  }
}
function showVesselInfo (e) {
  currentVessel.value = e
  map.value.hideTrajectory()
  show.value = true
}
function closeVesselInfo (id) {
  show.value = false
  vesselList.value = []
  map.value.normalize(id)
}

function showTrajectory (mmsi) {
  isLoading.value = true
  map.value.showTrajectory(mmsi)
}
</script>

<style scoped>
main {
  display: flex;
}
.content {
  position: relative;
  flex: 1;
}
.result-popup {
  position: absolute;
  top: 50%;
  left: 65%;
  width: 50%;
  height: 80%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
  background: #fff;
}
.result-popup > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.result-popup > button {
  position: absolute;
  border: none;
  background: #F3463D;
  color: #ffffff;
  font-size: 15px;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  right: 10px;
  top: 10px;
}
.result-popup > button:hover {
  cursor: pointer;
  opacity: 0.7;
}
</style>
