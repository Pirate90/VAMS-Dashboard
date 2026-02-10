<template>
  <div id="map" class="map"></div>
</template>

<script setup>
import { onMounted, defineExpose, defineEmits } from 'vue'
import initMap from '@/util/maptalks/map'
import Sar from '@/util/maptalks/sar'
import Vessel from '@/util/maptalks/vessel'
import Trenchmap from '@/util/maptalks/trenchmap'
import Districtmap from '@/util/maptalks/districtmap'
import Trajectory from '@/util/maptalks/trajectory'

import { doubtApi } from '@/apis'

const emit = defineEmits(['info:show', 'data:load'])
let map = null
let trenchmap = null
let districtmap = null
let vessel = null
let trajectory
let startDate = null
let endDate = null

// DOUBT
onMounted(async () => {
  map = initMap()

  Sar(map)
  trenchmap = await Trenchmap(map)
  districtmap = await Districtmap(map)

  vessel = Vessel(map, onClickVessel)
  trajectory = Trajectory(map)
})

function onClickVessel ({ coord, elements, isChild }) {
  map.animateTo({ zoom: 10, center: [coord.x, coord.y] }, {
    duration: 500,
    easing: 'out'
  })
  emit('info:show', elements, isChild)
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
    setTimeout(() => {
      vessel.changeDateTime(data)
      emit('data:load')
    }, 100)
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
