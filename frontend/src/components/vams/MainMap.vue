<template>
  <div id="map" class="map"></div>
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
// import Sar from '@/util/maptalks/sar'
import Vessel from '@/util/maptalks/vessel'
import Trenchmap from '@/util/maptalks/trenchmap'
import Districtmap from '@/util/maptalks/districtmap'
import Trajectory from '@/util/maptalks/trajectory'
import Img from '@/util/maptalks/img'
import VesselList from '@/components/VesselList'
import * as maptalks from 'maptalks'

import { doubtApi } from '@/apis'

const emit = defineEmits(['info:show', 'data:load'])

let map = null
let img = null
let trenchmap = null
let districtmap = null
let vessel = null
let trajectory
let startDate = null
let endDate = null
let drawTool = null
let drawLayer = null

const vesselList = ref([])
const showVesselList = ref(true)

onMounted(async () => {
  map = initMap()

  // Sar(map)
  trenchmap = await Trenchmap(map)
  districtmap = await Districtmap(map)
  vessel = Vessel(map, onClickVessel)
  trajectory = Trajectory(map)
  img = Img(map)

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

function onClickVessel ({ coord, elements, isChild }) {
  map.animateTo({ zoom: 10, center: [coord.x, coord.y] }, {
    duration: 500,
    easing: 'out'
  })
  emit('info:show', elements, isChild)
}

function closeVesselList () {
  showVesselList.value = false
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
  changeDatetime: async (start, end, today, tomorrow) => {
    startDate = today
    endDate = tomorrow

    const data = await doubtApi.getData(start, end)
    const targetData = Array.isArray(data) ? data : (data?.data || [])
    vesselList.value = [...targetData]
    vesselList.value.sort((a, b) => {
      const aIncludes = a.flagcountry?.includes('Korea')
      const bIncludes = b.flagcountry?.includes('Korea')
      if (aIncludes && !bIncludes) return -1
      else if (!aIncludes && bIncludes) return 1
      else return 0
    })
    setTimeout(() => {
      vessel.changeDateTime(data)
      emit('data:load')
    }, 100)
  },
  showList: () => {
    showVesselList.value = true
  },
  changeTrenchmap: (t) => {
    trenchmap.change(t)
  },
  changeDistrictmapConfig: (e) => {
    districtmap.change(e)
  },
  onSelectAllDistrict: () => {
    districtmap.selectAll()
  },
  onUnselectAllDistrict: () => {
    districtmap.unselectAll()
  },
  displayImg: (info, type) => {
    img.draw(info, type)
  },
  changeFilter: (f) => {
    vessel.filter(f)
  },
  highlight: (id) => {
    vessel.highlight(id)
  },
  normalize: (id) => {
    vessel.normalize(id)
    trajectory.hide()
  },
  showTrajectory: async (mmsi) => {
    // 0226 까지만 데이터 있음
    const data = await doubtApi.getTrajectory(mmsi, startDate.slice(0, 8) + '000000', endDate.slice(0, 8) + '000000')
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
  },
  hideTrajectory: () => {
    trajectory.hide()
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

<style>
/* .maptalks-control> div:last-child {
  top: 50px !important;
  right: 10px !important;
} */
</style>
