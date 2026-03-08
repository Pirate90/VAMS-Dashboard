<template>
  <section class="information d-flex f-d-column">
    <div class="header d-flex a-i-center">
      <span class="ship-title">{{ props.vessel.shipname || 'Unknown Vessel' }}</span>
      <button @click="emit('info:close', props.vessel.vesselid)"><f-a-icon icon="x" /></button>
    </div>

    <div class="currentVessel d-flex f-d-column flex-1 scrollable-content">
      <div class="section-group">
        <div class="vessel-id d-flex a-i-center">
          <img :src="require('@/assets/ship-icon.png')" alt="ship">
          VESSEL ID
        </div>
        <div class="value vessel-id-value d-flex a-i-center">{{ props.vessel.vesselid }}</div>

        <div class="container d-flex m-t-10">
          <div class="content flex-1 mmsi d-flex f-d-column j-c-center a-i-center">
            <div class="title">MMSI</div>
            <div class="value">{{ props.vessel.mmsi }}</div>
          </div>
          <div class="content flex-1 imo d-flex f-d-column j-c-center a-i-center">
            <div class="title">IMO</div>
            <div class="value">{{ props.vessel.imonumber || '0' }}</div>
          </div>
          <div class="content flex-1 callsign d-flex f-d-column j-c-center a-i-center">
            <div class="title">CALL SIGN</div>
            <div class="value">{{ props.vessel.callsign || '-' }}</div>
          </div>
        </div>

        <div class="container container-inline d-flex m-t-10">
          <div class="date d-flex a-i-center flex-1">
            <img :src="require('@/assets/date-icon.png')" alt="date">
            DATES
          </div>
          <div class="value d-flex j-c-center a-i-center flex-1 addon">{{ dateFormat(dateByVessel?.min) }}</div>
          <div class="value d-flex j-c-center a-i-center flex-1">{{ dateFormat(dateByVessel?.max) }}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-group">
        <div class="vessel-info d-flex a-i-center">
          <img :src="require('@/assets/ship-icon.png')" alt="info">
          VESSEL INFORMATION
        </div>

        <div class="vessel-type d-flex a-i-center m-t-10">
          <span class="name">TYPE</span>
          <span class="value">{{ props.vessel.shiptype || 'Not available' }}</span>
        </div>

        <div class="d-flex a-i-center m-t-10" style="gap: 10px;">
          <div class="country-flag d-flex a-i-center flex-1">
            <span class="name">COUNTRY</span>
            <span class="value">{{ props.vessel.flagcountry || 'Unknown' }}</span>
          </div>
          <div class="nav-status-code d-flex a-i-center flex-1">
            <span class="name">NAV STATUS</span>
            <span class="d-flex a-i-center">
              <span class="value">{{ props.vessel.navstatuscode || '0' }}</span>
              <span style="position: relative; line-height: 0; margin-left: 5px;">
                <f-a-icon class="info-icon" icon="circle-info"
                  @mouseenter="displayNavStatus"
                  @mouseleave="hideNavStatus"
                ></f-a-icon>
                <span class="popover" v-if="showNavStatus">{{ NAV_STATUS[props.vessel.navstatuscode] || NAV_STATUS[15] }}</span>
              </span>
            </span>
          </div>
        </div>

        <div class="d-flex a-i-center m-t-10" style="gap: 10px;">
          <div class="vessel-longitude d-flex a-i-center flex-1">
            <span class="name">LONGITUDE</span>
            <span class="value">{{ props.vessel.longitude }}</span>
          </div>
          <div class="vessel-latitude d-flex a-i-center flex-1">
            <span class="name">LATITUDE</span>
            <span class="value">{{ props.vessel.latitude }}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-group ai-command-center">
        <div class="vessel-info d-flex a-i-center title-ai">
          <span class="ai-badge">AI</span>
          심층 분석 요청
        </div>
        <div class="action-buttons d-flex f-d-column m-t-10">
          <button class="ai-btn" @click="requestSvt" :disabled="loadingSvt">
            <div class="btn-content">
              <span class="service-code">06-SVT</span>
              <span class="service-name">시공간 궤적 예측</span>
            </div>
            <div class="status-icon">
              <f-a-icon v-if="loadingSvt" icon="spinner" class="fa-spin" />
              <f-a-icon v-else icon="map-location-dot" />
            </div>
          </button>

          <button class="ai-btn" @click="requestLgvd" :disabled="loadingLgvd">
            <div class="btn-content">
              <span class="service-code">09-LGVD</span>
              <span class="service-name">VLM 선박활동 설명</span>
            </div>
            <div class="status-icon">
              <f-a-icon v-if="loadingLgvd" icon="spinner" class="fa-spin" />
              <f-a-icon v-else icon="file-lines" />
            </div>
          </button>

          <button class="ai-btn" @click="requestLvad" :disabled="loadingLvad">
            <div class="btn-content">
              <span class="service-code">10-LVAD</span>
              <span class="service-name">LLM 불법어업 근거 보고서</span>
            </div>
            <div class="status-icon">
              <f-a-icon v-if="loadingLvad" icon="spinner" class="fa-spin" />
              <f-a-icon v-else icon="gavel" />
            </div>
          </button>
        </div>
      </div>

    </div>
  </section>

  <Teleport to="body">
    <div class="report-overlay d-flex j-c-center a-i-center" v-if="showReportModal">
      <div class="report-modal d-flex f-d-column">
        <div class="report-header d-flex a-i-center j-c-between">
          <h2>{{ currentReportTitle }}</h2>
          <button class="close-report-btn" @click="showReportModal = false"><f-a-icon icon="x" /></button>
        </div>
        <div class="report-body scrollable-content">
          <div class="report-answer" v-html="formatAnswer(reportData.answer)"></div>
          <div class="report-image-box" v-if="reportData.image_path">
            <img :src="reportData.image_path" alt="근거 이미지" class="report-img" />
          </div>

          <div class="report-sources" v-if="reportData.sources && reportData.sources.length > 0">
            <h3>📑 관련 법령 및 근거 문서</h3>
            <ul>
              <li v-for="(src, idx) in reportData.sources" :key="idx">
                <span class="source-tag">Page {{ src.page }}</span>
                <span class="source-text">{{ extractFileName(src.source) }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="report-footer d-flex j-c-end">
          <button class="export-btn"><f-a-icon icon="download" /> PDF 다운로드</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { vesselApi, vamsApi } from '@/apis'

const NAV_STATUS = [
  'Under way using its engine', 'Anchored', 'Not under command', 'Has restricted maneuverability',
  'Ship draught is limiting its movement', 'Moored', 'Aground', 'Engaged in fishing',
  'Under way sailing', '(Reserved)', '(Reserved)', 'Power-driven vessel towing astern',
  'Power-driven vessel pushing ahead/towing alongside', '(Reserved for future use)',
  'AIS-SART, MOB, EPIRB active', 'Undefined (default)'
]

const props = defineProps({
  vessel: { type: Object, required: true },
  dashboardTime: { type: String, required: false, default: '' }
})

// 부모(MainMap)으로 보낼 이벤트들
const emit = defineEmits(['info:close', 'info:highlight', 'info:normalize', 'info:trajectory', 'info:predict'])

const dateByVessel = ref(null)
const showNavStatus = ref(false)

// AI 로딩 상태 관리
const loadingSvt = ref(false)
const loadingLgvd = ref(false)
const loadingLvad = ref(false)

// 보고서 모달 상태 관리
const showReportModal = ref(false)
const currentReportTitle = ref('')
const reportData = ref({})

onMounted(async () => {
  dateByVessel.value = await vesselApi.getMinMaxDateByVessel(props.vessel.mmsi)
})

watch(() => props.vessel, async (c, o) => {
  if (c) {
    dateByVessel.value = await vesselApi.getMinMaxDateByVessel(c.mmsi)
  } else {
    dateByVessel.value = null
    if (o) emit('info:normalize', o.vesselid)
  }
})

const monthStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function dateFormat (d) {
  if (!d) return '-'
  const date = new Date(d)
  return `${monthStr[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function displayNavStatus () { showNavStatus.value = true }
function hideNavStatus () { showNavStatus.value = false }

// ==========================================
// 💡 AI 심층 분석 요청 함수들
// ==========================================
function formatToUtcmin (dateObj) {
  if (!dateObj) return '20240126194208'
  const d = new Date(dateObj)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

// 💡 'YYYYMMDDHHMMSS' 문자열을 Javascript Date 객체로 변환하는 함수
function parseUtcminToDate (utcStr) {
  if (!utcStr || utcStr.length !== 14) return new Date()
  const y = parseInt(utcStr.substring(0, 4))
  const m = parseInt(utcStr.substring(4, 6)) - 1 // 월은 0부터 시작
  const d = parseInt(utcStr.substring(6, 8))
  const h = parseInt(utcStr.substring(8, 10))
  const min = parseInt(utcStr.substring(10, 12))
  const sec = parseInt(utcStr.substring(12, 14))
  return new Date(y, m, d, h, min, sec)
}

// 1. [06-SVT] 시공간 궤적 예측 요청
async function requestSvt () {
  loadingSvt.value = true
  try {
    // 1. 종료 시간(End): 부모가 넘겨준 타임 슬라이더의 현재 시간 (예측의 기준점)
    const endTarget = props.dashboardTime
      ? parseUtcminToDate(props.dashboardTime)
      : new Date()

    // 2. 시작 시간(Start): 기준점으로부터 과거 60분 (입력 궤적용)
    const PREDICTION_MINUTES = 60
    const startTarget = new Date(endTarget.getTime() - (PREDICTION_MINUTES * 60 * 1000))

    // 3. 백엔드로 보낼 파라미터 조립
    const payload = {
      mmsi: props.vessel.mmsi.toString(),
      start_posutcmin: formatToUtcmin(startTarget),
      end_posutcmin: formatToUtcmin(endTarget),
      vessel_type: 'stownet' // (필요시 shiptype 동적 매핑)
    }
    console.log(`🤖 AI 궤적 예측 요청 | 시작(과거): ${payload.start_posutcmin}, 종료(현재): ${payload.end_posutcmin}`)

    // API 호출
    const response = await vamsApi['06-svt'].predict(payload)
    // 성공/실패 분기 처리
    if (response && response.status === 'success') {
      // 💡 신규: input_trajectory와 predicted_trajectory 두 개를 객체로 묶어서 부모(MainMap)로 전달
      emit('info:predict', {
        input: response.input_trajectory,
        predicted: response.predicted_trajectory
      })
    } else if (response && response.status === 'fail') {
      alert(response.message || '해당 시간대의 과거 궤적 데이터가 부족하여 예측할 수 없습니다.')
    } else {
      alert('AI 모델에서 예상 궤적을 반환하지 않았습니다.')
    }
  } catch (error) {
    console.error('궤적 예측 실패:', error)
    alert('궤적 예측 요청 중 서버 오류가 발생했습니다.')
  } finally {
    loadingSvt.value = false
  }
}

// 2. [09-LGVD] VLM 기반 선박활동 설명 요청
async function requestLgvd () {
  loadingLgvd.value = true
  currentReportTitle.value = `[${props.vessel.shipname}] VLM 선박활동 설명서`
  // TODO: 실제 09-LGVD API 호출 (현재는 10-LVAD 모의 데이터를 빌려옴)
  setTimeout(async () => {
    const data = await vamsApi['10-lvad'].getExplanation()
    reportData.value = data
    loadingLgvd.value = false
    showReportModal.value = true
  }, 2000)
}

// 3. [10-LVAD] LLM 불법어업 근거 보고서 요청
async function requestLvad () {
  loadingLvad.value = true
  currentReportTitle.value = `[${props.vessel.shipname}] LLM 불법어업 근거 분석`

  try {
    const data = await vamsApi['10-lvad'].getExplanation()
    reportData.value = data
    showReportModal.value = true
  } catch (error) {
    console.error('LVAD 분석 실패:', error)
    alert('분석 중 오류가 발생했습니다.')
  } finally {
    loadingLvad.value = false
  }
}

// 텍스트의 줄바꿈(\n)을 HTML <br>로 변환하여 예쁘게 출력
function formatAnswer (text) {
  if (!text) return ''
  return text.replace(/\n/g, '<br />')
}

// 파일 경로에서 순수 파일명만 추출하여 깔끔하게 표시
function extractFileName (path) {
  if (!path) return ''
  return path.split('/').pop()
}
</script>

<style scoped>
/* 독립적인 고정 위치 (우측 하단) */
.information {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 360px;
  height: auto;
  max-height: calc(100vh - 80px); /* 화면을 넘어가지 않도록 최대 높이 설정 */
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 3000;
}

.header {
  font: normal normal 700 14px/20px SUIT;
  color: #333333;
  min-height: 40px;
  justify-content: space-between;
  padding: 0px 15px;
  border-bottom: 1px solid #DDDDDD;
}

.ship-title {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header > button {
  border: none;
  background: none;
  color: #555;
  width: 16px;
  height: 16px;
  font-size: 14px;
  cursor: pointer;
}

.header > button:hover { opacity: 0.6; }

.currentVessel {
  padding: 10px 15px;
  gap: 8px;
  overflow-y: auto;
}

.currentVessel img { width: 14px; height: 14px; }

.vessel-id, .date, .vessel-info {
  font: normal normal 700 13px/20px SUIT;
  color: #444444;
  gap: 6px;
}

.vessel-id-value, .vessel-type, .nav-status-code,
.vessel-longitude, .country-flag, .vessel-latitude {
  background: #F8F8F8;
  border-radius: 5px;
  padding: 0 10px;
  height: 32px;
}

.vessel-id-value {
  font: normal normal 600 12px/20px SUIT;
  color: #444444;
  margin-top: 5px;
}

.mmsi, .imo, .callsign {
  height: 55px;
  gap: 4px;
  border-radius: 5px;
}

.mmsi > .title, .imo > .title, .callsign > .title { font: normal normal 800 12px/16px SUIT; }
.mmsi > .value, .imo > .value, .callsign > .value { font: normal normal 600 12px/16px SUIT; }

.mmsi { background: #EAE4FF; color: #7D58FF; }
.imo { background: #DBE5FB; color: #176AFF; }
.callsign { background: #FCEEBD; color: #AE6E00; }

.container-inline { height: 28px; }
.container-inline .value {
  position: relative;
  font: normal normal 600 11px/20px SUIT;
  color: #444444;
  border-radius: 5px;
  background: #F8F8F8;
  height: 28px;
}
.container-inline .addon::after {
  content: '-';
  position: absolute;
  right: -6px;
  top: 4px;
}

.vessel-type, .nav-status-code, .vessel-longitude, .country-flag, .vessel-latitude {
  justify-content: space-between;
}
.vessel-type > .name, .nav-status-code > .name, .vessel-longitude > .name,
.country-flag > .name, .vessel-latitude > .name {
  font: normal normal 700 11px/20px SUIT;
  color: #777777;
}
.vessel-type > .value, .nav-status-code .value, .vessel-longitude > .value,
.country-flag > .value, .vessel-latitude > .value {
  font: normal normal 600 12px/20px SUIT;
  color: #444444;
}

.divider {
  border-top: 1px dashed #DDDDDD;
  margin: 8px 0;
}

.info-icon { color: #888888; cursor: pointer; }

/* ==========================================
   💡 AI 심층 분석 패널 디자인
========================================== */
.ai-command-center {
  background-color: #F4F7FF;
  border: 1px solid #D5E1FF;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 5px;
}

.title-ai {
  color: #275FCE;
  font-weight: 800;
}

.ai-badge {
  background-color: #275FCE;
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 10px;
  margin-right: 6px;
}

.action-buttons {
  gap: 8px;
}

.ai-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 40px;
  background-color: #ffffff;
  border: 1px solid #CCD8F5;
  border-radius: 5px;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-btn:hover:not(:disabled) {
  background-color: #275FCE;
  border-color: #275FCE;
}

.ai-btn:hover:not(:disabled) .service-code { color: #A6C4FF; }
.ai-btn:hover:not(:disabled) .service-name { color: #ffffff; }
.ai-btn:hover:not(:disabled) .status-icon { color: #ffffff; }

.ai-btn:disabled {
  background-color: #EFEFEF;
  border-color: #DDDDDD;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.service-code {
  font: normal normal 700 10px/12px SUIT;
  color: #7A9CE0;
  margin-bottom: 2px;
  transition: color 0.2s;
}

.service-name {
  font: normal normal 700 13px/16px SUIT;
  color: #333333;
  transition: color 0.2s;
}

.status-icon {
  font-size: 16px;
  color: #275FCE;
  transition: color 0.2s;
}

/* ==========================================
   💡 보고서 모달(Modal) 디자인
========================================== */
.report-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
}

.report-modal {
  width: 650px;
  max-height: 85vh;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.report-header {
  background-color: #275FCE;
  color: #ffffff;
  padding: 15px 25px;
}

.report-header h2 {
  margin: 0;
  font: normal normal 700 18px/24px SUIT;
}

.close-report-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.close-report-btn:hover { opacity: 0.7; }

.report-body {
  padding: 25px;
  background-color: #FBFDFD;
  overflow-y: auto;
}

.report-answer {
  font: normal normal 500 14px/24px SUIT;
  color: #333333;
  background-color: #ffffff;
  padding: 20px;
  border: 1px solid #EEEEEE;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  margin-bottom: 20px;
}

.report-image-box {
  margin-bottom: 20px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  padding: 10px;
  background-color: #ffffff;
  text-align: center;
}

.report-img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.report-sources h3 {
  font: normal normal 800 15px/20px SUIT;
  color: #275FCE;
  margin: 0 0 10px 0;
}

.report-sources ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.report-sources li {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
}

.source-tag {
  background-color: #EAF0FF;
  color: #275FCE;
  font: normal normal 700 12px/16px SUIT;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 12px;
  white-space: nowrap;
}

.source-text {
  font: normal normal 500 13px/18px SUIT;
  color: #555555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-footer {
  padding: 15px 25px;
  background-color: #ffffff;
  border-top: 1px solid #EEEEEE;
}

.export-btn {
  background-color: #333333;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font: normal normal 700 14px/20px SUIT;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-btn:hover { background-color: #555555; }
</style>
