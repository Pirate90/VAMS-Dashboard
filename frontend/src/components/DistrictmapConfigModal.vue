<template>
  <section class="d-flex j-c-center a-i-center">
    <div class="modal">
      <div class="title d-flex a-i-center">
        <span>구역도 설정</span>
        <button @click="emit('districtmapconfig:close')"><f-a-icon icon="x" /></button>
      </div>
      <div class="config d-flex">
        <div class="map" id="map"></div>
        <div class="list"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, defineEmits } from 'vue'
import initMap from '@/util/maptalks/map'
import Districtmap from '@/util/maptalks/districtmap'

import { districtmapApi } from '@/apis'

const emit = defineEmits(['districtmapconfig:close'])

let map = null
let districtmap = null
const districtmapList = ref([])

onMounted(async () => {
  map = initMap()
  map.setZoom(6)

  districtmap = await Districtmap(map)
  console.log(districtmap)

  districtmapList.value = await districtmapApi.list()
})
</script>

<style scoped>
section {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99999;
  top: 0;
  left: 0;
}
.modal {
  background: #222222;
  border-radius: 10px;
}
.title {
  width: 100%;
  height: 50px;
  padding: 0 20px;
  justify-content: space-between;
  border-bottom: 0.1px solid rgba(255, 255, 255, 0.2);
}
.title > span {
  font: normal normal 600 20px/20px SUIT;
  color: rgba(255, 255, 255, 0.8);
}
.title > button {
  border: none;
  background: #F3463D;
  color: #ffffff;
  font-size: 8px;
  width: 15px;
  height: 15px;
  border-radius: 8px;
}
.title > button:hover {
  cursor: pointer;
  opacity: 0.7;
}
.config {
  width: 1000px;
  height: 600px;
}
.map {
  width: 600px;
  height: 600px;
  border: 0.1px solid #222222;
  border-radius: 10px;
}
.list {
  width: 400px;
  height: 600px;
}
</style>

<style>
.maptalks-wrapper {
  border-radius: 0 0 0 10px;
}
</style>
