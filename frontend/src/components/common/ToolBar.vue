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
        <button class="toggle-btn" @click="toggleMenu('countries')" :class="{ 'active': showCountries }">
          선박 국가
        </button>
        <div class="dropdown-content filter-list d-flex" v-if="showCountries">
          <div v-for="c in countryList" :key="c.name">
            <input type="checkbox" :id="'country-' + c.name" v-model="checkedCountry" :value="c.value" @change="onChangeCountry">
            <label class="check-label d-flex j-c-center a-i-center" :for="'country-' + c.name">{{ c.name }}</label>
          </div>
        </div>
      </div>
      <div class="divider"></div>

      <div class="dropdown-wrapper d-flex">
        <button class="toggle-btn" style="min-width: 120px;" @click="toggleMenu('filters')" :class="{ 'active': showFilters }">
          선박 활동 타입
        </button>
        <div class="dropdown-content filter-list d-flex" v-if="showFilters">
          <div v-for="f in filterList" :key="f.name">
            <input type="checkbox" :id="'filter-' + f.name" v-model="checkedFilter" :value="f.value" @change="onChangeFilter">
            <label class="check-label d-flex j-c-center a-i-center" :for="'filter-' + f.name">{{ f.name }}</label>
          </div>
        </div>
      </div>
      <div class="divider"></div>

      <div class="districtmap-config d-flex">
        <button style="min-width: 130px;" @click="toggleMenu('none'); emit('imglist:toggle')">위성영상 리스트</button>
      </div>
      <div class="divider"></div>

      <div class="section-list d-flex">
        <button style="min-width: 130px;" @click="toggleMenu('request')" :class="[displayRequest ? 'req-activate' : '']">워크플로우 등록</button>
      </div>
    </div>

    <button class="direct-service">빠른 서비스 창</button>
    <RequestPopup v-if="displayRequest" @req:draw="emit('toolbar:draw')" :selectedCoords="props.selectedCoords" @req:close="displayRequest = false"/>
  </section>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from 'vue'
import RequestPopup from '@/components/common/RequestPopup.vue'

const emit = defineEmits(['section:change', 'trenchmap:change', 'filter:change', 'country:change', 'districtmapconfig:toggle', 'imglist:toggle', 'toolbar:draw', 'close:popups'])
const props = defineProps(['selectedCoords'])

const showPorts = ref(false)
const showFilters = ref(false)
const showCountries = ref(false)
const showTrenchmaps = ref(false)
const displayRequest = ref(false)

function toggleMenu (menu) {
  showTrenchmaps.value = menu === 'trenchmaps' ? !showTrenchmaps.value : false
  showPorts.value = menu === 'ports' ? !showPorts.value : false
  showFilters.value = menu === 'filters' ? !showFilters.value : false
  showCountries.value = menu === 'countries' ? !showCountries.value : false
  displayRequest.value = menu === 'request' ? !displayRequest.value : false

  if (['trenchmaps', 'ports', 'filters', 'countries', 'request'].includes(menu)) {
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

const checkedCountry = ref(['Korea'])
const countryList = [
  { name: '한국', value: 'Korea' },
  { name: '중국', value: 'China' },
  { name: '일본', value: 'Japan' },
  { name: '이외', value: 'Others' }
]

function onChangeCountry () {
  emit('country:change', [...checkedCountry.value])
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
    showCountries.value = false
    displayRequest.value = false
  }
})
</script>

<style scoped>
section {
  position: absolute;
  width: 100%;
  height: 54px;
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  z-index: 2000;
  top: 0;
  right: 0;
  padding: 0 30px;
  align-items: center;
  justify-content: space-between;
}
.tools { gap: 20px; align-items: center; }
.divider { width: 1.5px; height: 18px; background-color: #444; }

.dropdown-wrapper { position: relative; align-items: center; }

/* 💡 1. 텍스트 정렬을 완벽하게 잡기 위해 display: flex 속성 적용 */
/* 💡 2. 가시성 상향을 위해 font-weight: 600(Semi-bold) 적용 및 색상을 #EFEFEF 로 밝게 변경 */
.toggle-btn, .section-list > button, .districtmap-config > button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  min-width: 90px;
  padding: 0 16px;
  border: 1px solid #555;
  border-radius: 17px;
  background: #2A2A2A;
  font-family: 'SUIT', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1; /* line-height 의존성 제거 */
  letter-spacing: -0.5px;
  color: #EFEFEF;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toggle-btn:hover, .toggle-btn.active,
.section-list > button:hover, .districtmap-config > button:hover, .req-activate {
  background: #646BA1;
  border-color: #646BA1;
  color: #ffffff;
}

.trenchmap:disabled {
  background-color: #646BA1 !important;
  border-color: #646BA1 !important;
  color: #ffffff !important;
  cursor: auto !important;
}

.dropdown-content {
  position: absolute;
  top: 46px;
  left: 0;
  background: #2A2A2A;
  padding: 12px;
  border: 1px solid #444;
  border-radius: 8px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.5);
  z-index: 2001;
  white-space: nowrap;
  gap: 8px;
}

/* 💡 체크박스 라벨도 일반 버튼과 동일하게 Flexbox 정렬 및 가시성 상향 */
.check-label {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  min-width: 90px;
  padding: 0 16px;
  border: 1px solid #555;
  border-radius: 17px;
  background: #2A2A2A;
  font-family: 'SUIT', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.5px;
  color: #EFEFEF;
  cursor: pointer;
  transition: all 0.2s ease;
}

.check-label:hover { background: #444; color: #ffffff; }

.check-label::before {
  display: inline-block;
  content: "";
  background-image: url('../../assets/check-icon.png');
  background-size: cover;
  object-fit: contain;
  width: 13px;
  height: 9px;
  transition: transform .3s ease-in-out;
  margin-right: 6px;
}

input[type="checkbox"]:checked+.check-label::before {
  transform: rotate(-360deg);
}

input[type="checkbox"]:checked+.check-label {
  background-color: #646BA1;
  border-color: #646BA1;
  color: #ffffff;
}

input[type="checkbox"] { position: absolute; opacity: 0; }

/* 💡 우측 빠른 서비스 창 버튼도 동일하게 교정 */
.direct-service {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  height: 34px;
  border: 1px solid #555;
  border-radius: 17px;
  background-color: #2A2A2A;
  padding: 0 30px 0 16px;
  font-family: 'SUIT', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.5px;
  color: #EFEFEF;
  transition: all .2s ease;
  cursor: pointer;
}
.direct-service::after {
  position: absolute;
  right: 14px;
  content: "";
  background-image: url('../../assets/arrow-down-icon.png');
  background-size: cover;
  object-fit: contain;
  width: 10px;
  height: 6px;
  opacity: 0.7;
}
.direct-service:hover { background-color: #444; color: #ffffff; }
</style>
