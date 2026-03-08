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
      <ToolBar ref="toolbar"
        @section:change="onChangeSection"
        @trenchmap:change="onChangeTrenchmap"
        @filter:change="onChangeFilter"
        @districtmapconfig:toggle="onToggleDistrictmap"
        @imglist:toggle="onToggleImgList"
        @close:popups="onToolbarPopupsOpened"
        @toolbar:draw="handleStartDraw" :selectedCoords="selectedCoords"
      ></ToolBar>
      <MainMap ref="map"
        @info:show="showVesselInfo"
        @data:load="isLoading = false"
        @draw:completed="onDrawCompleted"
        @popup:open="onMainMapPopupOpened"
      ></MainMap>
      <VesselInformation ref="vesselInfo" v-if="show"
        :vessel="currentVessel"
        :dashboard-time="currentDashboardTime"
        @info:close="closeVesselInfo"
        @info:highlight="map.highlight"
        @info:normalize="map.normalize"
        @info:trajectory="showTrajectory"
        @info:predict="onShowPredictedTrajectory"
      ></VesselInformation>
      <DatetimeSelector @change:datetime="onChangeDatetime"></DatetimeSelector>
    </div>
    <div class="result-popup" v-if="displayResult">
      <button @click="displayResult = false"><f-a-icon icon="x" /></button>
      <img :src="`/services/06-svt/img/${currentResult}/result.png`" alt="">
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import ToolBar from '@/components/common/ToolBar'
import MainMap from '@/components/common/MainMap'
import DatetimeSelector from '@/components/common/DatetimeSelector'
import ImgList from '@/components/common/ImgList'
import VesselInformation from '@/components/common/VesselInformation'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DistrictmapConfig from '@/components/common/DistrictmapConfig'

const map = ref()
const vesselInfo = ref()
const toolbar = ref()

const isLoading = ref(false)
const showDistrictmapConfig = ref(false)
const showImgList = ref(false)
const displayResult = ref(false)
const currentResult = ref('')
const currentVessel = ref({})
const show = ref(false)
const selectedCoords = ref(null)

const currentDashboardTime = ref('') // 대시보드 타임라인의 현재 시간 저장용

// 타임 슬라이더에서 'change:datetime' 이벤트가 올라왔을 때 실행되는 함수
function onChangeDatetime (start, end, today, tomorrow) {
  // 1. 슬라이더의 시작 시간을 대시보드 현재 시간으로 저장 (AI 궤적 예측용)
  currentDashboardTime.value = start
  // 2. 로딩 스피너 활성화
  isLoading.value = true
  // 3. 지도 컴포넌트에 시간 변경 알림 (데이터 로드)
  map.value?.changeDatetime(start, end, today, tomorrow)
}

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
  map.value.normalize(id)
}

function showTrajectory (mmsi) {
  isLoading.value = true
  map.value.showTrajectory(mmsi)
}

function onShowPredictedTrajectory (predictData) {
  map.value.showPredictedTrajectory(predictData)
}

function onToggleDistrictmap () {
  showDistrictmapConfig.value = !showDistrictmapConfig.value
  if (showDistrictmapConfig.value) {
    showImgList.value = false
    map.value?.closePopups() // 지도 사이드 팝업 닫기
  }
}

function onToggleImgList () {
  showImgList.value = !showImgList.value
  if (showImgList.value) {
    showDistrictmapConfig.value = false
    map.value?.closePopups() // 지도 사이드 팝업 닫기
  }
}

function onToolbarPopupsOpened () {
  showDistrictmapConfig.value = false
  showImgList.value = false
  map.value?.closePopups() // 툴바 하위 메뉴 열릴 때 지도 사이드 팝업 닫기
}

function onMainMapPopupOpened () {
  showDistrictmapConfig.value = false
  showImgList.value = false
  toolbar.value?.closePopups() // 지도 사이드 팝업 열릴 때 툴바 팝업 닫기
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
