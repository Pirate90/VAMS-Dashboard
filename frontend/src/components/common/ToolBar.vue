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

// 💡 [핵심] 기본값을 'Korea' 하나만 남겼습니다!
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
/* 💡 1. 툴바 전체 높이를 키우고 바닥에 은은한 선을 추가했습니다 */
section {
  position: absolute;
  width: 100%;
  height: 54px; /* 기존 40px -> 54px 로 넓게 */
  background: #1e1e1e; /* 대시보드 톤에 맞춘 색상 */
  border-bottom: 1px solid #333;
  z-index: 2000;
  top: 0;
  right: 0;
  padding: 0 30px;
  align-items: center;
  justify-content: space-between;
}
.tools { gap: 20px; align-items: center; }
.divider { width: 1.5px; height: 18px; background-color: #444; } /* 구분선 세련되게 변경 */

.dropdown-wrapper { position: relative; align-items: center; }

/* 💡 2. 모든 버튼의 높이와 여백을 대폭 늘려 클릭하기 편하게 만들었습니다 */
.toggle-btn, .section-list > button, .districtmap-config > button {
  height: 34px; /* 기존 25px -> 34px */
  min-width: 90px;
  padding: 0 16px;
  border: 1px solid #555;
  border-radius: 17px; /* 알약 형태의 둥근 모서리 */
  background: #2A2A2A;
  font: normal normal 500 14px/34px SUIT;
  letter-spacing: -0.5px;
  color: #bbb;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

/* 호버 및 활성화 상태일 때 브랜드 컬러(#646BA1) 적용 */
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

/* 💡 3. 드롭다운 팝업 위치 및 내부 간격 조정 */
.dropdown-content {
  position: absolute;
  top: 46px; /* 버튼이 커졌으므로 위치 하향 조정 */
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

/* 💡 4. 체크박스 라벨도 버튼과 완벽하게 동일한 모양으로 통일 */
.check-label {
  height: 34px;
  min-width: 90px;
  padding: 0 16px;
  border: 1px solid #555;
  border-radius: 17px;
  background: #2A2A2A;
  font: normal normal 500 14px/34px SUIT;
  color: #bbb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.check-label:hover { background: #444; color: #fff; }

.check-label::before {
  display: inline-block;
  content: "";
  background-image: url('../../assets/check-icon.png');
  background-size: cover;
  object-fit: contain;
  width: 13px;
  height: 9px;
  transition: transform .3s ease-in-out;
  margin-right: 6px; /* 텍스트와의 간격 조정 */
}

/* 체크되었을 때 브랜드 컬러 적용 */
input[type="checkbox"]:checked+.check-label::before {
  transform: rotate(-360deg);
}

input[type="checkbox"]:checked+.check-label {
  background-color: #646BA1;
  border-color: #646BA1;
  color: #fff;
}

input[type="checkbox"] { position: absolute; opacity: 0; }

/* 💡 5. 우측 끝 빠른 서비스 창 버튼도 동일 규격으로 맞춤 */
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
  color: #bbb;
  font: normal normal 500 14px/34px SUIT;
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
.direct-service:hover { background-color: #444; color: #fff; }
</style>
