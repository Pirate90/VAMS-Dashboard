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
        @filter:change="onChangeFilter"
        @districtmapconfig:toggle="showDistrictmapConfig = !showDistrictmapConfig"
      ></ToolBar>
      <MainMap ref="map" @info:show="showVesselInfo" @data:load="isLoading = false"></MainMap>
      <ServicePopup ref="vesselInfo" v-if="show"
        :show="show"
        :vessel="currentVessel"
        @info:close="closeVesselInfo"
        @info:highlight="map.highlight"
        @info:normalize="map.normalize"
        @info:trajectory="showTrajectory"
      ></ServicePopup>

      <DatetimeSelector @change:datetime="onChangeDatetime"></DatetimeSelector>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import ToolBar from '@/components/decision/ToolBar'
import MainMap from '@/components/decision/MainMap'
import DatetimeSelector from '@/components/decision/DatetimeSelector'
import ServicePopup from '@/components/decision/ServicePopup'
import LoadingSpinner from '@/components/LoadingSpinner'
// import DistrictmapConfigModal from '@/components/DistrictmapConfigModal'
import DistrictmapConfig from '@/components/DistrictmapConfig'

const map = ref()
const vesselInfo = ref()

const isLoading = ref(false)
const showDistrictmapConfig = ref(false)
const vesselList = ref([])
const currentVessel = ref({})
const show = ref(false)

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
</style>
