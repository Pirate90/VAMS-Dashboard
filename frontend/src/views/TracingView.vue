<template>
  <main>
    <LoadingSpinner v-if="isLoading"/>
    <!-- <DistrictmapConfigModal v-if="showDistrictmapConfig" @districtmapconfig:close="showDistrictmapConfig = false"></DistrictmapConfigModal> -->
    <div class="content">
      <DistrictmapConfig :show="showDistrictmapConfig"
        @districtmapconfig:change="onChangeDistrictmapConfig"
        @districtmapconfig:selectall="onSelectall"
        @districtmapconfig:unselectall="onUnselectall"
      ></DistrictmapConfig>
      <ToolBar @section:change="onChangeSection"
        @trenchmap:change="onChangeTrenchmap"
        @districtmapconfig:toggle="showDistrictmapConfig = !showDistrictmapConfig"
      ></ToolBar>
      <MainMap ref="map" @info:show="showVesselInfo" @data:load="isLoading = false"></MainMap>

      <TracingPopup :currentVessel="currentVessel"/>
      <ImgList @img:display="displayImg"/>
    </div>

    <div class="result-popup" v-if="displayResult">
      <button @click="displayResult = false"><f-a-icon icon="x" /></button>
      <img :src="`/tracing/img/${currentResult}/result.png`" alt="">
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import ToolBar from '@/components/tracing/ToolBar'
import MainMap from '@/components/tracing/MainMap'
import LoadingSpinner from '@/components/LoadingSpinner'
import DistrictmapConfig from '@/components/DistrictmapConfig'
import TracingPopup from '@/components/tracing/TracingPopup.vue'
import ImgList from '@/components/tracing/ImgList.vue'

const map = ref()

const isLoading = ref(false)
const showDistrictmapConfig = ref(false)
const currentVessel = ref({})
const displayResult = ref(false)
const currentResult = ref('')

function onChangeSection (s) {
  map.value.changeCenter(s)
}
function onChangeTrenchmap (t) {
  map.value.changeTrenchmap(t)
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
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 80%;
  max-height: 80%;
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
