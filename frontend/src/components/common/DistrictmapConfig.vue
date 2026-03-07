<template>
  <Transition name="slide">
    <section v-if="props.show">
      <div class="title d-flex a-i-center">
        <f-a-icon icon="gear"/>
        구역도 설정
      </div>

      <div class="tabs d-flex">
        <button :class="{ active: currentTab === 'general' }" @click="currentTab = 'general'">일반</button>
        <button :class="{ active: currentTab === 'cgd' }" @click="currentTab = 'cgd'">해양경찰서</button>
      </div>

      <div class="all-tools d-flex a-i-center">
        <button @click="selectAll">전체 선택</button>
        <button @click="unselectAll">전체 해제</button>
      </div>

      <div class="list d-flex">
        <div v-for="d in displayedList" :key="d.name">
          <input type="checkbox" :id="d.name" v-model="d.show" @change="onChangeDistrictmap" @focus="e => e.preventDefault()">
          <label :class="[d.show ? 'checked' : '', 'd-flex', 'j-c-center', 'a-i-center']" :for="d.name">
            {{ d.name }}
            <div :style="{ background: d.color, width: '10px', height: '10px', borderRadius: '5px', marginLeft: '5px' }"></div>
          </label>
        </div>
      </div>
    </section>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, ref, computed } from 'vue'
import { districtmapApi } from '@/apis'

const hexColor = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF5', '#FFC300', '#DAF7A6', '#900C3F', '#581845', '#C70039', '#1A5276', '#229954', '#AF7AC5', '#F39C12', '#2980B9', '#1ABC9C', '#2E4053', '#7D3C98', '#C0392B', '#BDC3C7', '#7F8C8D', '#34495E', '#E74C3C', '#8E44AD', '#2ECC71', '#F1C40F', '#3498DB', '#E67E22', '#16A085', '#D35400', '#AAB7B8', '#ABB2B9', '#E59866', '#F5B041', '#F7DC6F', '#1F618D', '#F0B27A', '#EC7063']
const props = defineProps({
  show: {
    type: Boolean,
    require: true
  }
})

const emit = defineEmits(['districtmapconfig:change', 'districtmapconfig:selectall', 'districtmapconfig:unselectall'])

const districtmapList = ref([])
const currentTab = ref('general') // 'general' 또는 'cgd' (Coast Guard District)

// 탭 상태에 따라 보여줄 리스트를 필터링
const displayedList = computed(() => {
  if (currentTab.value === 'general') {
    return districtmapList.value.filter(d => !d.name.includes('해양경찰서'))
  } else {
    return districtmapList.value.filter(d => d.name.includes('해양경찰서'))
  }
})

onMounted(async () => {
  const apiList = await districtmapApi.list()

  const configStr = localStorage.getItem('districtmapConfig')
  const savedConfig = configStr ? JSON.parse(configStr) : []

  districtmapList.value = apiList.map((name, index) => {
    const existing = savedConfig.find(d => d.name === name)
    return {
      name: name,
      show: existing !== undefined ? existing.show : true,
      // 순서가 섞이더라도 고유 색상을 유지하도록 초기 생성 시점에 컬러 부여
      color: hexColor[index % hexColor.length]
    }
  })

  saveToLocalStorage()
})

function saveToLocalStorage () {
  // 로컬 스토리지에는 전체 리스트를 저장 (color 정보는 제외하고 저장해도 무방하나 통일성을 위해 그대로 저장)
  localStorage.setItem('districtmapConfig', JSON.stringify(districtmapList.value))
}

function onChangeDistrictmap ({ target }) {
  saveToLocalStorage()
  emit('districtmapconfig:change', { name: target.id, show: target.checked })
}

function selectAll () {
  // 현재 보고 있는 탭의 항목들만 상태를 true로 변경
  displayedList.value.forEach(d => {
    // 이미 켜져있는 항목은 이벤트를 중복으로 보내지 않도록 방어
    if (!d.show) {
      d.show = true
      // 부모 컴포넌트(지도)에 현재 탭의 항목만 '켜짐' 상태로 개별 전달
      emit('districtmapconfig:change', { name: d.name, show: true })
    }
  })
  saveToLocalStorage()
  // 부모 컴포넌트에서 강제로 전체를 켜버리는 기존 이벤트는 사용하지 않음
  // emit('districtmapconfig:selectall')
}

function unselectAll () {
  // 현재 보고 있는 탭의 항목들만 상태를 false로 변경
  displayedList.value.forEach(d => {
    // 이미 꺼져있는 항목은 이벤트를 중복으로 보내지 않도록 방어
    if (d.show) {
      d.show = false
      // 부모 컴포넌트(지도)에 현재 탭의 항목만 '꺼짐' 상태로 개별 전달
      emit('districtmapconfig:change', { name: d.name, show: false })
    }
  })
  saveToLocalStorage()
  // 부모 컴포넌트에서 강제로 전체를 꺼버리는 기존 이벤트는 사용하지 않음
  // emit('districtmapconfig:unselectall')
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

/* 탭 버튼 스타일 추가 */
.tabs {
  margin-top: 10px;
  gap: 10px;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}
.tabs > button {
  flex: 1;
  height: 30px;
  border: 1px solid #656565;
  border-radius: 5px;
  background: #222222;
  font: normal normal 600 14px/20px SUIT;
  color: #828282;
  cursor: pointer;
  transition: all .2s;
}
.tabs > button.active {
  background: #757575;
  color: #ffffff;
  border-color: #757575;
}
.tabs > button:hover:not(.active) {
  background: #444;
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
  height: calc(100% - 135px); /* 탭 영역만큼 높이 계산 수정 */
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
