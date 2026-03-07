<template>
  <section class="search-panel d-flex f-d-column" v-if="show">
    <div class="header d-flex a-i-center">
      <span>선박 조회</span>
      <button class="close-btn" @click="emit('search:close')"><f-a-icon icon="x" /></button>
    </div>

    <div class="searching d-flex a-i-center">
      <input type="text" placeholder="선박 번호/명 조회" v-model="keyword">
      <button class="search-btn"><img src="@/assets/search-blue.png" alt="search"></button>
    </div>

    <div class="filter flex-1 scrollable-content">
      <div class="title">유형 선택</div>
      <div class="container">
        <div class="content" v-for="f in filters" :key="f.name">
          <div class="filter-title">{{ f.name }}</div>
          <div class="btn-group">
            <button
              v-for="l in f.list" :key="l"
              :class="{ active: selectedFilters[f.name] === l }"
              @click="selectFilter(f.name, l)"
              :style="{ width: `calc(100% / ${f.list.length} - 5px)` }"
            >
              {{ l }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['search:close', 'search:execute'])

const keyword = ref('')

// '전체' 옵션을 추가하여 기본 선택값을 줍니다.
const filters = [
  { name: '채집 종류', list: ['전체', '통발', '자망', '연승', '선망', '저인망'] },
  { name: '채집 위치', list: ['전체', '동쪽', '서쪽', '남쪽'] }
]

// 선택된 필터 상태 관리
const selectedFilters = ref({
  '채집 종류': '전체',
  '채집 위치': '전체'
})

function selectFilter (category, val) {
  selectedFilters.value[category] = val
}
</script>

<style scoped>
/* 선박 목록(VesselList)과 동일한 규격 적용 */
.search-panel {
  width: 360px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  font: normal normal 700 15px/20px SUIT;
  color: #333333;
  min-height: 40px;
  padding: 0px 15px;
  border-bottom: 1px solid #DDDDDD;
}

.close-btn {
  margin-left: auto;
  border: none;
  background: none;
  color: #555;
  width: 16px;
  height: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-btn:hover {
  opacity: 0.6;
}

.searching {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid #EEEEEE;
  padding: 0 10px;
  background: #FAFAFA;
}

.searching > input {
  height: 100%;
  flex: 1;
  padding: 0 10px;
  border: none;
  background: transparent;
  font: normal normal 600 14px/20px SUIT;
  color: #333333;
}

.searching > input:focus {
  outline: none;
}

.search-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-btn > img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  transition: opacity 0.2s;
}

.search-btn:hover img {
  opacity: 0.6;
}

.filter {
  padding: 15px;
}

.filter > .title {
  font: normal normal 700 14px/20px SUIT;
  color: #333333;
  margin-bottom: 10px;
}

.filter > .container {
  background: #F8F9FA;
  padding: 15px 12px;
  border-radius: 6px;
}

.filter > .container > .content {
  margin-bottom: 15px;
}
.filter > .container > .content:last-child {
  margin-bottom: 0;
}

.filter-title {
  margin-bottom: 8px;
  font: normal normal 700 12px/20px SUIT;
  color: #555555;
}

.btn-group {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 5px;
}

.btn-group > button {
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  border-radius: 4px;
  font: normal normal 600 12px/20px SUIT;
  color: #666666;
  height: 30px;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-group > button:hover {
  background: #EAF0FF;
  border-color: #275FCE;
  color: #275FCE;
}

.btn-group > button.active {
  background: #275FCE;
  border-color: #275FCE;
  color: #ffffff;
}
</style>
