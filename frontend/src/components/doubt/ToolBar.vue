<template>
  <section id="toolbar" class="d-flex">
    <div class="d-flex tools">
      <div class="districtmap-config d-flex">
        <button @click="emit('districtmapconfig:toggle')">구역도 설정</button>
      </div>
      <div class="divider"></div>
      <div class="section-list d-flex">
        <button v-for="t in trenchmapList" :key="t.name" @click="onClickTrenchmap(t.value)"
          class="trenchmap"
          :disabled="currentTrenchmap === t.value"
        >
          {{ t.name }}
        </button>
      </div>
      <div class="divider"></div>
      <div class="section-list d-flex">
        <button v-for="s in sectionList" :key="s.name" @click="onClickSection(s.name)">
          {{ s.name }}
        </button>
      </div>
      <div class="divider"></div>
      <div class="filter-list d-flex">
        <div v-for="f in filterList" :key="f.name">
          <input type="checkbox" :id="f.name" v-model="checkedFilter" :value="f.value" @change="onChangeFilter">
          <label class="d-flex j-c-center a-i-center" :for="f.name">{{ f.name }}</label>
        </div>
      </div>
      <div class="divider"></div>
      <div class="section-list d-flex">
        <button style="width: 120px;" @click="displayRequest = !displayRequest" :class="[displayRequest ? 'req-activate' : '']">의심선박 분류</button>
      </div>
    </div>

    <button class="direct-service">빠른 서비스 창</button>
    <RequestPopup v-if="displayRequest" :title="'의심선박 분류 요청'" :type="'doubt'" @req:close="displayRequest = false"/>
  </section>
</template>

<script setup>
import { ref, defineEmits, watch } from 'vue'
import RequestPopup from '@/components/RequestPopup.vue'

const emit = defineEmits(['section:change', 'trenchmap:change', 'filter:change', 'districtmapconfig:toggle'])

const currentSection = ref('')
const sectionList = [
  { name: '인천항' },
  { name: '부산항' },
  { name: '목포항' }
]

function onClickSection (s) {
  currentSection.value = s
  emit('section:change', s)
}

const checkedFilter = ref(['doubt', 'illegal'])
const filterList = [
  { name: '정상선박', value: 'normal' },
  { name: '의심선박', value: 'doubt' },
  { name: '불법선박', value: 'illegal' },
  { name: '배회선박', value: 'loitering' }
]

watch(checkedFilter, (f) => {
  emit('filter:change', f)
})

const currentTrenchmap = ref('big')
const trenchmapList = [
  { name: '대해구도', value: 'big' },
  { name: '소해구도', value: 'small' },
  { name: '없음', value: null }
]

const displayRequest = ref(false)

function onClickTrenchmap (t) {
  currentTrenchmap.value = t
  emit('trenchmap:change', t)
}
</script>

<style scoped>
section {
  position: absolute;
  width: 100%;
  height: 40px;
  background: #222222;
  z-index: 999;
  top: 0;
  right: 0;
  /* opacity: 1; */
  padding: 0 30px;
  align-items: center;
  justify-content: space-between;
}
.tools {
  gap: 20px;
}
.divider {
  width: 1.5px;
  background-color: rgba(255, 255, 255, 0.4);
}
.section-list, .filter-list {
  gap: 10px;
}
.section-list > button, label,
.districtmap-config > button {
  height: 25px;
  width: 80px;
  border: 1px solid #656565;
  border-radius: 13px;
  background: #222222;
  font: normal normal 600 14px/20px SUIT;
  letter-spacing: -0.75px;
  color: #828282;
  transition: all .2s;
}
.districtmap-config > button {
  width: 100px;
}
label {
  background: #ffffff0d;
  width: 100px;
}
.section-list > button:hover,
label:hover,
.districtmap-config > button:hover,
.req-activate {
  cursor: pointer;
  background: #757575;
  color: #ffffff;
}
.trenchmap:disabled {
  background-color: #757575 !important;
  color: #ffffff;
  cursor: auto !important;
}

label::before {
  display: inline-block;
  content: "";
  background-image: url('../../assets/check-icon.png');
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
  display: absolute;
}

input[type="checkbox"] {
  position: absolute;
  opacity: 0;
}

.direct-service {
  position: relative;
  display: flex;
  align-items: center;
  width: 150px;
  height: 25px;
  border: 1px solid #FFFFFF;
  border-radius: 13px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0 10px;
  color: #ffffff;
  font: normal normal 500 14px/20px SUIT;
  letter-spacing: -0.9px;
  transition: all .2s;
}
.direct-service::after {
  position: absolute;
  right: 10px;
  content: "";
  background-image: url('../../assets/arrow-down-icon.png');
  background-size: cover;
  object-fit: contain;
  width: 10px;
  height: 6px;
}
.direct-service:hover {
  cursor: pointer;
  background-color: #757575;
}
</style>
