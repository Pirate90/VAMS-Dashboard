<template>
  <section id="toolbar" class="d-flex">
    <div class="d-flex tools">
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
      <div class="section-list d-flex">
        <button style="width: 120px;" @click="emit('list:show')">어업선박 리스트</button>
      </div>
      <div class="divider"></div>
      <div class="section-list d-flex">
        <button style="width: 120px;" :class="[displayVesselRequest ? 'req-activate' : '']"
          @click="displayVesselRequest = !displayVesselRequest"
        >작업 요청</button>
      </div>
    </div>

    <button class="direct-service">빠른 서비스 창</button>
    <RequestPopup v-if="displayVesselRequest" :title="'작업 요청'" :type="'iuu'" @req:close = "displayVesselRequest = false"/>
  </section>
</template>

<script setup>
import { ref, defineEmits, watch } from 'vue'
import RequestPopup from '@/components/RequestPopup.vue'

const emit = defineEmits(['section:change', 'trenchmap:change', 'filter:change', 'list:show'])

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

watch(checkedFilter, (f) => {
  emit('filter:change', f)
})

const currentTrenchmap = ref('big')
const trenchmapList = [
  { name: '대해구도', value: 'big' },
  { name: '소해구도', value: 'small' },
  { name: '없음', value: null }
]

function onClickTrenchmap (t) {
  currentTrenchmap.value = t
  emit('trenchmap:change', t)
}

const displayVesselRequest = ref(false)
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
.section-list > button, label {
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
label {
  background: #ffffff0d;
  width: 100px;
}
.section-list > button:hover,
label:hover {
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
