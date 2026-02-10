<template>
  <div class="map" ref="mapContainer"></div>
</template>

<script setup>
/* eslint-disable */
import { ref, onMounted, defineExpose } from 'vue'
import mapboxgl from 'mapbox-gl'
// import MapLibre from 'maplibre-gl'
import * as MaplibreGrid from 'maplibre-grid'
import { dataApi } from '@/apis'

mapboxgl.accessToken = 'pk.eyJ1IjoiZ2V1bmlpIiwiYSI6ImNrdGw3aDFwNjF0MWUyb3FuZHhsMHp2M3UifQ.LhTy9DE32CO59gxGKxwtDg'

const mapContainer = ref()
let map = null

onMounted(initMap)
function initMap () {
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256
          // attribution: 'Map tiles by <a target="_top" rel="noopener" href="https://tile.openstreetmap.org/">OpenStreetMap tile servers</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>'
        }
      },
      layers: [{
        id: 'osm',
        type: 'raster',
        source: 'osm'
      }]
    },
    center: [127.4, 36.1], // starting position [lng, lat]
    zoom: 6,
    maxBounds: [
      [115, 30], // Southwest coordinates
      [140, 40] // Northeast coordinates
    ]
  })

  map.on('load', async () => {
    loadTileset()

    loadVesselImg()
    // const data = await getData()
    // await drawVesselLayer(data)
    drawMapGrid()

    map.on('click', 'vessel-layer', (e) => {
      console.log(e.features[0].properties.mmsi)
    })
  })
  map.on(MaplibreGrid.GRID_CLICK_EVENT, event => {
    console.log(event.bbox)
  })
}

function loadTileset () {
  // console.log('log')
  map.addSource('t_source', {
    type: 'raster',
    tiles: ['http://localhost:3000/tiles/{z}/{x}/{-y}.png'],
    tileSize: 256
  })

  map.addLayer({
    id: 't_layer',
    type: 'raster',
    source: 't_source',
    minzoom: 0,
    maxzoom: 5
  })
}

async function getData () {
  const result = await dataApi.getData()
  result.forEach(r => {
    r.cog *= 1
  })

  return result
}

function loadVesselImg () {
  map.loadImage(require('@/assets/ship-r.png'), (err, img) => {
    if (err) throw err

    map.addImage('vessel', img, { pixelRatio: 1 })
  })
}

async function getAllVesselSource (data) {
  return {
    type: 'FeatureCollection',
    // features: data.map(({ course, lat, lon, speed, mmsi, timestamp }) => ({
    features: data.map(({ cog, latitude, longitude, speed, mmsi, timestamp }) => ({
      type: 'Feature',
      properties: { cog, speed, mmsi, timestamp },
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    }))
  }
}

async function drawVesselLayer (data) {
  const source = await getAllVesselSource(data)
  map.addSource('vessel-source', {
    type: 'geojson',
    data: source
  })

  map.addLayer({
    id: 'vessel-layer',
    type: 'symbol',
    source: 'vessel-source',
    layout: {
      'icon-image': 'vessel',
      'icon-anchor': 'center',
      // 'icon-offset': [0, 5],
      'icon-rotate': ['get', 'cog'],
      'icon-allow-overlap': true
    }
  })
}

function drawMapGrid () {
  const grid = new MaplibreGrid.Grid({
    gridWidth: 0.2,
    gridHeight: 0.1,
    units: 'degrees',
    paint: {
      'line-opacity': 0.2
    }
  })

  map.addControl(grid)
  map.setZoom(6)
}

defineExpose({
  getDataByDate: async ({ start, end }) => {
    // const startDate = start.padEnd(14, 0)
    // const endDate = end.padEnd(14, 0)

    // map.removeLayer('vessel-layer')
    // map.removeSource('vessel-source')

    // const data = (await dataApi.getDataByDate(startDate, endDate))
    // data.forEach(r => {
    //   r.cog *= 1
    // })
    // drawVesselLayer(data)
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
.marker {
  background-image: url('../assets/ship-r.png');
  background-size: cover;
  width: 12px;
  height: 20px;
}
</style>
