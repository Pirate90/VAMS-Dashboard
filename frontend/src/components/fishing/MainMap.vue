<template>
  <div id="map" class="map"></div>
  <HeatmapConfig @config:change="onChangeHeatmapConfig"></HeatmapConfig>
  <VesselList :show="showVesselList" :list="vesselList"
    @list:close="closeVesselList"
    @info:show="showVesselMarker"
    @info:hide="hideVesselMarker"
    @info:trajectory="showTrajectory"
  ></VesselList>
</template>

<script setup>
import { onMounted, defineExpose, defineEmits, ref } from 'vue'
import initMap from '@/util/maptalks/map'
import Trenchmap from '@/util/maptalks/trenchmap'
import Heatmap from '@/util/maptalks/heatmap'
import VesselMarker from '@/util/maptalks/marker'
import Trajectory from '@/util/maptalks/trajectory'
import HeatmapConfig from '@/components/fishing/HeatmapConfig'
import VesselList from '@/components/VesselList'
import * as maptalks from 'maptalks' // 추가

import { iuuApi } from '@/apis'

const emit = defineEmits(['data:load', 'data:loadstart'])

let map = null
let trenchmap = null
let heatmap = null
let vesselMarker = null
let trajectory = null
let startDate = null
let endDate = null

let drawTool = null
let drawLayer = null

const vesselList = ref([])
const showVesselList = ref(false)

onMounted(async () => {
  map = initMap()

  trenchmap = await Trenchmap(map)
  heatmap = Heatmap(map)
  vesselMarker = VesselMarker(map)
  trajectory = Trajectory(map)

  drawLayer = new maptalks.VectorLayer('draw-layer').addTo(map)

  drawTool = new maptalks.DrawTool({
    mode: 'Polygon',
    symbol: {
      lineColor: '#34495e',
      lineWidth: 2,
      polygonFill: '#1abc9c',
      polygonOpacity: 0.6
    }
  }).addTo(map).disable()

  drawTool.on('drawend', (param) => {
    const { geometry } = param
    drawLayer.clear().addGeometry(geometry) // 기존 구역 삭제 후 추가
    const coords = geometry.getCoordinates()
    // 이 좌표를 팝업으로 전달하기 위해 이벤트를 발생시킵니다.
    emit('draw:completed', coords)
    drawTool.disable()
  })
})

function onChangeHeatmapConfig (key, value) {
  heatmap.changeConfig(key, value)
}

function closeVesselList () {
  hideVesselMarker()
  showVesselList.value = false
}

function showVesselMarker (v) {
  map.animateTo({ center: [v.longitude, v.latitude] }, {
    duration: 500,
    easing: 'out'
  })
  vesselMarker.show(v)
}
function hideVesselMarker () {
  vesselMarker.hide()
  trajectory.hide()
}

async function showTrajectory (mmsi) {
  emit('data:loadstart')
  const data = await iuuApi.getTrajectory(mmsi, startDate, endDate)
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: data.map(d => [d.longitude, d.latitude])
    }
  }
  trajectory.load(geojson)
  emit('data:load')
}

const sectionList = {
  인천항: [126.6246844, 37.4589868],
  목포항: [126.383362, 34.780277],
  부산항: [129.0430982, 35.1020946]
}
defineExpose({
  changeCenter: (s) => {
    map.animateTo({ center: sectionList[s], zoom: 10 }, {
      duration: 500,
      easing: 'out'
    })
  },
  changeDate: async (start, end) => {
    startDate = start
    endDate = end
    vesselList.value = await iuuApi.getList(start, end)
    vesselList.value.sort((a, b) => {
      const aIncludes = a.flagcountry.includes('Korea')
      const bIncludes = b.flagcountry.includes('Korea')
      if (aIncludes && !bIncludes) return -1
      else if (!aIncludes && bIncludes) return 1
      else return 0
    })
    const data = await iuuApi.getData(start, end)
    heatmap.changeData(data)
    emit('data:load')
  },
  changeTrenchmap: (t) => {
    trenchmap.change(t)
  },
  showList: () => {
    showVesselList.value = true
  },
  startDraw: () => {
    drawLayer.clear()
    drawTool.enable()
  },
  stopDraw: () => {
    drawTool.disable()
  }
})
</script>

<style scoped>
.map {
  /* width: 100%; */
  flex: 1;
  height: 100%;
}
</style>

<style>
.map img {
  filter: grayscale(100%) invert(100%) !important;
}
.pointer-cursor {
  cursor: pointer;
}
</style>
