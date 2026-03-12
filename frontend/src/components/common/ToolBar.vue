<template>
  <section id="toolbar" class="d-flex">
    <div class="d-flex tools">
      <div class="districtmap-config d-flex">
        <button @click="toggleMenu('none'); emit('districtmapconfig:toggle')">구역도 설정</button>
      </div>
      <div class="divider"></div>
      <div class="dropdown-wrapper d-flex">
        <button class="toggle-btn" @click="toggleMenu('trenchmaps')" :class="{ 'active': showTrenchmaps }">
          해구도
        </button>
        <div class="dropdown-content section-list d-flex" v-if="showTrenchmaps">
          <button v-for="t in trenchmapList" :key="t.name" @click="onClickTrenchmap(t.value)"
            class="trenchmap"
            :disabled="currentTrenchmap === t.value"
          >
            {{ t.name }}
          </button>
        </div>
      </div>
      <div class="divider"></div>
      <div class="dropdown-wrapper d-flex">
        <button class="toggle-btn" @click="toggleMenu('ports')" :class="{ 'active': showPorts }">
          주요 항구
        </button>
        <div class="dropdown-content section-list d-flex" v-if="showPorts">
          <button v-for="s in sectionList" :key="s.name" @click="onClickSection(s.name)">
            {{ s.name }}
          </button>
        </div>
      </div>
      <div class="divider"></div>
      <div class="dropdown-wrapper d-flex">
        <button class="toggle-btn" style="width: 110px;" @click="toggleMenu('filters')" :class="{ 'active': showFilters }">
          선박 활동 타입
        </button>
        <div class="dropdown-content filter-list d-flex" v-if="showFilters">
          <div v-for="f in filterList" :key="f.name">
            <input type="checkbox" :id="f.name" v-model="checkedFilter" :value="f.value" @change="onChangeFilter">
            <label class="d-flex j-c-center a-i-center" :for="f.name">{{ f.name }}</label>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="districtmap-config d-flex">
        <button @click="toggleMenu('none'); emit('imglist:toggle')">위성영상 리스트</button>
      </div>
      <div class="divider"></div>
      <div class="section-list d-flex">
        <button style="width: 120px;" @click="toggleMenu('request')" :class="[displayRequest ? 'req-activate' : '']">워크플로우 등록</button>
      </div>
    </div>

    <button class="direct-service">빠른 서비스 창</button>
    <RequestPopup v-if="displayRequest" @req:draw="emit('toolbar:draw')" :selectedCoords="props.selectedCoords" @req:close="displayRequest = false"/>
  </section>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from 'vue'
import RequestPopup from '@/components/common/RequestPopup.vue'

// 💡 'close:popups' 이벤트를 추가로 정의합니다.
const emit = defineEmits(['section:change', 'trenchmap:change', 'filter:change', 'districtmapconfig:toggle', 'imglist:toggle', 'toolbar:draw', 'close:popups'])
const props = defineProps(['selectedCoords'])

const showPorts = ref(false)
const showFilters = ref(false)
const showTrenchmaps = ref(false)
const displayRequest = ref(false)

// 💡 통합 토글 제어 함수 업데이트
function toggleMenu (menu) {
  // 1. 내부 드롭다운 상태 관리 (선택한 것만 열고 나머지는 무조건 닫음)
  showTrenchmaps.value = menu === 'trenchmaps' ? !showTrenchmaps.value : false
  showPorts.value = menu === 'ports' ? !showPorts.value : false
  showFilters.value = menu === 'filters' ? !showFilters.value : false
  displayRequest.value = menu === 'request' ? !displayRequest.value : false

  // 2. 내부 메뉴(해구도, 항구 등)를 열었을 때, 외부에 띄워진 구역도/위성 창도 닫도록 부모에게 신호 전송
  if (['trenchmaps', 'ports', 'filters', 'request'].includes(menu)) {
    emit('close:popups')
  }
}

const currentSection = ref('')
const sectionList = [
  { name: '인천항' },
  { name: '부산항' },
  { name: '목포항' }
]

function onClickSection (s) {
  currentSection.value = s
  emit('section:change', s)
  showPorts.value = false
}

const checkedFilter = ref(['normal', 'loitering', 'transshipment', 'illegal', 'delayed'])
const filterList = [
  { name: '정상선박', value: 'normal' },
  { name: '배회의심', value: 'loitering' },
  { name: '환적의심', value: 'transshipment' },
  { name: '불법어업', value: 'illegal' },
  { name: '입항지연', value: 'delayed' }
]

function onChangeFilter () {
  emit('filter:change', [...checkedFilter.value])
}

const currentTrenchmap = ref('big')
const trenchmapList = [
  { name: '대해구도', value: 'big' },
  { name: '소해구도', value: 'small' },
  { name: '없음', value: null }
]

function onClickTrenchmap (t) {
  currentTrenchmap.value = t
  emit('trenchmap:change', t)
  showTrenchmaps.value = false
}

defineExpose({
  closePopups: () => {
    showTrenchmaps.value = false
    showPorts.value = false
    showFilters.value = false
    displayRequest.value = false
  }
})
</script>

<style scoped>
section {
  position: absolute;
  width: 100%;
  height: 40px;
  background: #222222;
  z-index: 2000; /* 💡 999에서 2000으로 수정 */
  top: 0;
  right: 0;
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

/* 드롭다운 래퍼 및 콘텐츠 스타일 */
.dropdown-wrapper {
  position: relative;
  align-items: center;
}
.toggle-btn {
  height: 25px;
  width: 90px;
  border: 1px solid #656565;
  border-radius: 13px;
  background: #222222;
  font: normal normal 600 14px/20px SUIT;
  letter-spacing: -0.75px;
  color: #828282;
  transition: all .2s;
}
.toggle-btn:hover,
.toggle-btn.active {
  cursor: pointer;
  background: #757575;
  color: #ffffff;
}
.dropdown-content {
  position: absolute;
  top: 35px;
  left: 0;
  background: #222222;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.5);
  z-index: 2001; /* 💡 1000에서 2001로 수정 */
  white-space: nowrap;
}

/* 내부 버튼 및 라벨 스타일 */
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
