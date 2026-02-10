<template>
  <div id="map" class="map"></div>
</template>

<script setup>
import { onMounted, defineExpose, defineEmits } from 'vue'
import initMap from '@/util/maptalks/map'
import Trenchmap from '@/util/maptalks/trenchmap'
import Districtmap from '@/util/maptalks/districtmap'
import Img from '@/util/maptalks/img'
import Vessel from '@/util/maptalks/vessel'

import { doubtApi } from '@/apis'

const emit = defineEmits(['info:show'])

let map = null
let trenchmap = null
let districtmap = null
let img = null
let vessel = null

// DOUBT
onMounted(async () => {
  map = initMap()

  trenchmap = await Trenchmap(map)
  districtmap = await Districtmap(map)
  img = Img(map)

  vessel = Vessel(map, onClickVessel)

  const data = await doubtApi.getData(20240310014000, 20240310015000)
  vessel.changeDateTime(data)
})

const sectionList = {
  인천항: [126.6246844, 37.4589868],
  목포항: [126.383362, 34.780277],
  부산항: [129.0430982, 35.1020946]
}

function onClickVessel ({ coord, elements, isChild }) {
  map.animateTo({ zoom: 10, center: [coord.x, coord.y] }, {
    duration: 500,
    easing: 'out'
  })
  emit('info:show', elements, isChild)
}

defineExpose({
  changeCenter: (s) => {
    map.animateTo({ center: sectionList[s], zoom: 10 }, {
      duration: 500,
      easing: 'out'
    })
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

  highlight: (id) => {
    vessel.highlight(id)
  },
  normalize: (id) => {
    vessel.normalize(id)
  },

  displayImg: (info, type) => {
    img.draw(info, type)
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
