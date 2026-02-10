<template>
  <div id="map" class="map"></div>
</template>

<script setup>
import { onMounted, defineExpose, defineEmits } from 'vue'
import { transform } from 'ol/proj'

import { dataApi } from '@/apis'

import initMap from '@/util/openlayers/init-map'
import drawTrenchmap from '@/util/openlayers/trenchmap'
import drawVessel from '@/util/openlayers/draw-vessel'

const emit = defineEmits(['vesselinfo'])
let map = null

let vessel = null
onMounted(async () => {
  map = initMap()

  const data = await getData()
  vessel = drawVessel(map, data, onClickVessel)

  drawTrenchmap(map)
})

async function getData () {
  const result = await dataApi.getData()
  result.forEach(r => {
    r.cog *= 1
  })

  return result
}

function onClickVessel (features, coord) {
  map.getView().animate({
    center: coord,
    duration: 500
  })
  emit('vesselinfo', features)
}

const sectionList = {
  인천항: [126.6246844, 37.4589868],
  목포항: [126.383362, 34.780277],
  부산항: [129.0430982, 35.1020946]
}

defineExpose({
  changeCenter: (s) => {
    map.getView().animate({
      center: transform(sectionList[s], 'EPSG:4326', 'EPSG:3857'),
      zoom: 10,
      duration: 700
    })
  },
  changeTrenchmap: (t) => {
    const trenchmap = map.getLayers().getArray().find(l => l.getProperties().name === 'trenchmap')
    if (trenchmap) map.removeLayer(trenchmap)

    if (t === '없음') return
    drawTrenchmap(map, t)
  },
  changeFilter: (f) => {
    vessel.changeFeatures(f)
  },
  clear: () => {
    vessel.select.getFeatures().clear()
  },
  highlight: (id) => {
    // console.log(vessel.source.getFeatures(id))
  },
  normalize: (id) => {
    // console.log(id)
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
