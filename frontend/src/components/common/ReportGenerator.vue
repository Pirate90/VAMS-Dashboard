<template>
  <div class="modal-overlay">
    <div class="report-modal">
      <header class="modal-header d-flex j-c-between a-i-center">
        <h3>통계 / 사건 보고서 생성</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <section class="form-section">
          <h4>1. 기간 선택</h4>
          <div class="radio-group">
            <label><input type="radio" value="daily" v-model="form.period"> 일간</label>
            <label><input type="radio" value="weekly" v-model="form.period"> 주간</label>
            <label><input type="radio" value="monthly" v-model="form.period"> 월간</label>
            <label><input type="radio" value="custom" v-model="form.period"> 사용자 설정</label>
          </div>
          <div class="custom-date-picker d-flex a-i-center" v-if="form.period === 'custom'">
            <input type="datetime-local" v-model="form.customStart" class="date-input">
            <span class="tilde">~</span>
            <input type="datetime-local" v-model="form.customEnd" class="date-input">
          </div>
        </section>

        <section class="form-section">
          <h4>2. 구역 선택</h4>
          <div class="dropdown-group">
            <div class="dropdown-item">
              <label>일반 구역도</label>
              <select v-model="form.selectedDistrict" :disabled="form.selectedCoastGuard !== '' || form.selectedTrench !== ''">
                <option value="">선택 안함</option>
                <option v-for="d in districtList" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="dropdown-item">
              <label>해경 관할구역</label>
              <select v-model="form.selectedCoastGuard" :disabled="form.selectedDistrict !== '' || form.selectedTrench !== ''">
                <option value="">선택 안함</option>
                <option v-for="c in coastGuardList" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="dropdown-item">
              <label>해구도</label>
              <select v-model="form.selectedTrench" :disabled="form.selectedDistrict !== '' || form.selectedCoastGuard !== ''">
                <option value="">선택 안함</option>
                <option v-for="t in trenchList" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <p class="help-text">* 지도에서 선택한 구역이 자동으로 지정됩니다. 다른 구역을 선택하려면 현재 구역을 '선택 안함'으로 변경하세요.</p>
        </section>

        <section class="form-section">
          <h4>3. 선박 종류</h4>
          <div class="toggle-group">
            <button v-for="type in vesselTypes" :key="type.value"
                    :class="{ active: form.vesselTypes.includes(type.value) }"
                    @click="toggleVesselType(type.value)">
              {{ type.label }}
            </button>
          </div>
        </section>

        <section class="form-section">
          <h4>4. 선박 활동 타입</h4>
          <div class="toggle-group">
            <button v-for="act in activityTypes" :key="act.value"
                    :class="{ active: form.activityTypes.includes(act.value) }"
                    @click="toggleActivityType(act.value)">
              {{ act.label }}
            </button>
          </div>
        </section>
      </div>

      <footer class="modal-footer d-flex j-c-center">
        <button class="btn-cancel" @click="$emit('close')">닫기</button>
        <button class="btn-submit" @click="generateReport">보고서 생성</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// 💡 districtmapApi와 함께 getTrenchmap도 가져옵니다.
import { districtmapApi, getTrenchmap } from '@/apis'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({ period: 'daily', item: { type: '', value: '' } })
  }
})

const emit = defineEmits(['close', 'generate'])

const form = ref({
  period: 'daily',
  customStart: '',
  customEnd: '',
  selectedDistrict: '',
  selectedCoastGuard: '',
  selectedTrench: '',
  vesselTypes: ['ALL'],
  activityTypes: ['loitering', 'transshipment', 'illegal', 'delayed']
})

const vesselTypes = [
  { label: 'ALL', value: 'ALL' },
  { label: 'FISHING', value: 'FISHING' },
  { label: 'TUG', value: 'TUG' },
  { label: 'PASSENGER', value: 'PASSENGER' },
  { label: 'GENERAL CARGO', value: 'GENERAL_CARGO' }
]

const activityTypes = [
  { label: '배회의심', value: 'loitering' },
  { label: '환적의심', value: 'transshipment' },
  { label: '불법어업', value: 'illegal' },
  { label: '입항지연', value: 'delayed' }
]

const districtList = ref([])
const coastGuardList = ref([])
const trenchList = ref([])

onMounted(async () => {
  // 💡 1. 일반 구역도 및 해경 관할구역 API 호출
  try {
    const apiList = await districtmapApi.list()

    const districts = []
    const coastGuards = []

    apiList.forEach(item => {
      const nameStr = typeof item === 'object' ? (item.name || item.zone_name) : String(item)
      if (!nameStr) return

      if (nameStr.includes('해양경찰서')) {
        coastGuards.push(nameStr)
      } else {
        // 해구도는 별도 API로 가져오므로 여기서는 일반 구역만 담습니다
        districts.push(nameStr)
      }
    })

    districtList.value = districts
    coastGuardList.value = coastGuards
  } catch (error) {
    console.error('일반 구역 리스트 API 호출 실패:', error)
  }

  // 💡 2. 해구도 API 호출 (대해구, 소해구 모두 가져와서 파싱)
  try {
    const trenches = new Set() // 중복 제거용 Set 객체
    const toInt = (val) => val !== undefined && val !== null ? Math.floor(Number(val)) : null

    // 2-1. 대해구도 파싱
    const bigTrenchData = await getTrenchmap('big')
    if (bigTrenchData && bigTrenchData.features) {
      bigTrenchData.features.forEach(feature => {
        const props = feature.properties
        if (props && props.HAEGU_NO !== undefined && props.HAEGU_NO !== null) {
          trenches.add(`${toInt(props.HAEGU_NO)} 해구`)
        }
      })
    }

    // 2-2. 소해구도 파싱
    const smallTrenchData = await getTrenchmap('small')
    if (smallTrenchData && smallTrenchData.features) {
      smallTrenchData.features.forEach(feature => {
        const props = feature.properties
        if (props && props.HAEGU_NO !== undefined && props.HAEGU_NO !== null) {
          const haeguNo = toInt(props.HAEGU_NO)
          if (props.SUB_NO !== undefined && props.SUB_NO !== null) {
            trenches.add(`${haeguNo}-${toInt(props.SUB_NO)} 해구`)
          } else {
            trenches.add(`${haeguNo} 해구`)
          }
        }
      })
    }

    // Set을 배열로 변환하고 숫자 기준으로 보기 좋게 정렬합니다
    trenchList.value = Array.from(trenches).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  } catch (error) {
    console.error('해구도 리스트 API 호출 실패:', error)
  }

  // 💡 3. 지도에서 클릭하여 넘어온 초기 데이터(기간) 셋팅
  if (props.initialData?.period) {
    form.value.period = props.initialData.period
  }

  // 💡 4. 지도에서 클릭하여 넘어온 구역 데이터 셋팅
  const targetArea = props.initialData?.item
  if (targetArea) {
    if (targetArea.type === 'district') {
      if (!districtList.value.includes(targetArea.value)) districtList.value.unshift(targetArea.value)
      form.value.selectedDistrict = targetArea.value
    } else if (targetArea.type === 'coastguard') {
      if (!coastGuardList.value.includes(targetArea.value)) coastGuardList.value.unshift(targetArea.value)
      form.value.selectedCoastGuard = targetArea.value
    } else if (targetArea.type.includes('trench')) {
      if (!trenchList.value.includes(targetArea.value)) trenchList.value.unshift(targetArea.value)
      form.value.selectedTrench = targetArea.value
    }
  }
})

const toggleVesselType = (val) => {
  if (val === 'ALL') {
    form.value.vesselTypes = ['ALL']
    return
  }

  const allIdx = form.value.vesselTypes.indexOf('ALL')
  if (allIdx > -1) form.value.vesselTypes.splice(allIdx, 1)

  const idx = form.value.vesselTypes.indexOf(val)
  if (idx > -1) {
    form.value.vesselTypes.splice(idx, 1)
  } else {
    form.value.vesselTypes.push(val)
  }

  if (form.value.vesselTypes.length === 0) form.value.vesselTypes = ['ALL']
}

const toggleActivityType = (val) => {
  const idx = form.value.activityTypes.indexOf(val)
  if (idx > -1) {
    form.value.activityTypes.splice(idx, 1)
  } else {
    form.value.activityTypes.push(val)
  }
}

const generateReport = () => {
  emit('generate', { ...form.value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
}

.report-modal {
  background: #222222;
  border: 1px solid #444;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
  font-family: 'SUIT', sans-serif;
  color: #eee;
  overflow: hidden;
}

.modal-header {
  background: #151515;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
}
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
.close-btn { background: none; border: none; color: #888; font-size: 18px; cursor: pointer; }
.close-btn:hover { color: #fff; }

.modal-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.form-section { margin-bottom: 25px; }
.form-section h4 { margin: 0 0 10px 0; font-size: 14px; color: #aaa; font-weight: 500; }

/* 라디오 & 캘린더 */
.radio-group { display: flex; gap: 15px; margin-bottom: 10px; font-size: 13px; }
.radio-group label { cursor: pointer; display: flex; align-items: center; gap: 5px; }
.custom-date-picker { background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #333; gap: 10px; }
.date-input { background: #2a2a2a; color: #eee; border: 1px solid #444; padding: 6px 10px; border-radius: 4px; font-family: inherit; }
.date-input::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }

/* 드롭다운 */
.dropdown-group { display: flex; flex-direction: column; gap: 10px; }
.dropdown-item { display: flex; align-items: center; justify-content: space-between; background: #1a1a1a; padding: 8px 15px; border-radius: 6px; border: 1px solid #333; }
.dropdown-item label { font-size: 13px; color: #ccc; }
.dropdown-item select { background: #2a2a2a; color: #fff; border: 1px solid #444; padding: 5px 10px; border-radius: 4px; width: 200px; cursor: pointer; }
.dropdown-item select:disabled { opacity: 0.5; cursor: not-allowed; }
.help-text { font-size: 11px; color: #777; margin-top: 8px; }

/* 토글 버튼 */
.toggle-group { display: flex; flex-wrap: wrap; gap: 8px; }
.toggle-group button { background: #2a2a2a; border: 1px solid #444; color: #999; padding: 8px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
.toggle-group button:hover { background: #333; }
.toggle-group button.active { background: #3b82f6; border-color: #3b82f6; color: #fff; }

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #333;
  background: #151515;
  gap: 15px;
}
.btn-cancel { background: transparent; border: 1px solid #555; color: #ccc; padding: 8px 25px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.btn-cancel:hover { background: #333; color: #fff; }
.btn-submit { background: #3b82f6; border: none; color: #fff; padding: 8px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-submit:hover { background: #2563eb; }
</style>
