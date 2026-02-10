<template>
  <Transition name="slide">
    <section v-if="props.show">
      <div class="title d-flex a-i-center">
        <f-a-icon icon="gear"/>
        구역도 설정
      </div>

      <div class="all-tools d-flex a-i-center">
        <button @click="selectAll">전체 선택</button>
        <button @click="unselectAll">전체 해제</button>
      </div>

      <div class="list d-flex">
        <div v-for="(d, i) in districtmapList" :key="d.name">
          <input type="checkbox" :id="d.name" v-model="d.show" @change="onChangeDistrictmap" @focus="e => e.preventDefault()">
          <label :class="[d.show ? 'checked' : '', 'd-flex', 'j-c-center', 'a-i-center']" :for="d.name">
            {{ d.name }}
            <div :style="{ background: hexColor[i], width: '10px', height: '10px', borderRadius: '5px', marginLeft: '5px' }"></div>
          </label>
        </div>
      </div>
    </section>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, ref } from 'vue'
import { districtmapApi } from '@/apis'

const hexColor = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF5', '#FFC300', '#DAF7A6', '#900C3F', '#581845', '#C70039', '#900C3F', '#FF5733', '#1A5276', '#229954', '#AF7AC5', '#F39C12', '#2980B9', '#1ABC9C', '#2E4053', '#7D3C98', '#C0392B', '#BDC3C7', '#7F8C8D', '#34495E', '#E74C3C', '#8E44AD', '#2ECC71', '#F1C40F', '#3498DB', '#E67E22', '#16A085', '#D35400', '#AAB7B8', '#ABB2B9', '#E59866', '#F5B041', '#F7DC6F', '#1F618D', '#F0B27A', '#EC7063']

const props = defineProps({
  show: {
    type: Boolean,
    require: true
  }
})

const emit = defineEmits(['districtmapconfig:change', 'districtmapconfig:selectall', 'districtmapconfig:unselectall'])

const districtmapList = ref([])
onMounted(async () => {
  const config = localStorage.getItem('districtmapConfig')
  if (config) districtmapList.value = JSON.parse(config)
  else districtmapList.value = (await districtmapApi.list()).map(d => ({ name: d, show: true }))
})

function onChangeDistrictmap ({ target }) {
  localStorage.setItem('districtmapConfig', JSON.stringify(districtmapList.value))
  emit('districtmapconfig:change', { name: target.id, show: target._modelValue })
}

function selectAll () {
  districtmapList.value.forEach(d => {
    d.show = true
  })
  localStorage.setItem('districtmapConfig', JSON.stringify(districtmapList.value))
  emit('districtmapconfig:selectall')
}

function unselectAll () {
  districtmapList.value.forEach(d => {
    d.show = false
  })
  localStorage.setItem('districtmapConfig', JSON.stringify(districtmapList.value))
  emit('districtmapconfig:unselectall')
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

section {
  width: 270px;
  height: calc(100% - 80px);
  background: #222222;
  position: absolute;
  left: 0px;
  top: 40px;
  z-index: 1999;
  box-shadow: 0 0 2px #fff;
  padding: 10px;
  overflow: hidden;
}
.title {
  color: rgba(255, 255, 255, 0.8);
  font: normal normal 600 18px/20px SUIT;
  height: 30px;
  gap: 10px;
}
.all-tools {
  height: 50px;
  padding: 10px 0;
  gap: 10px;
}
.all-tools > button {
  width: 110px !important;
}
.list {
  height: calc(100% - 80px);
  overflow-y: auto;
  flex-direction: column;
  gap: 5px;
}
.list > div {
  position: relative;
}
.all-tools > button,
label {
  height: 25px;
  width: 230px;
  border: 1px solid #656565;
  border-radius: 13px;
  background: #222222;
  font: normal normal 600 14px/20px SUIT;
  letter-spacing: -0.75px;
  color: #828282;
  transition: all .2s;
  background: #ffffff0d;
  position: relative;
}
.all-tools > button:hover,
label:hover {
  cursor: pointer;
  background: #757575;
  color: #ffffff;
}
label.checked::before {
  position: absolute;
  left: 10px;
  display: inline-block;
  content: "";
  background-image: url('../assets/check-icon.png');
  background-size: cover;
  object-fit: contain;
  width: 13px;
  height: 9px;
  transition: transform .3s ease-in-out;
  margin-right: 2px;
}
input[type="checkbox"]:checked+label::before {
  transform: rotate(-360deg);
  transition: transform .3s ease-in-out;
}

input[type="checkbox"]:checked+label {
  background-color: #757575;
  color: #fff;
  transition: all .2s;
}

input[type="checkbox"] {
  position: absolute;
  opacity: 0;
}
.list::-webkit-scrollbar {
  width: 5px;
}
.list::-webkit-scrollbar-thumb {
  background-color: #757575;
  border-radius: 3px;
}
.list::-webkit-scrollbar-track {
  background-color: none;
}
</style>
