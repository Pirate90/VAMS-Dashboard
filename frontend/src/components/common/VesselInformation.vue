<template>
  <section class="information d-flex f-d-column">
    <div class="header d-flex a-i-center">
      <span class="ship-title">{{ props.vessel.shipname || '이름 없는 선박' }}</span>
      <button @click="emit('info:close', props.vessel.vesselid)"><f-a-icon icon="x" /></button>
    </div>

    <div class="tabs d-flex">
      <button :class="{ active: currentTab === 'basic' }" @click="currentTab = 'basic'">선박 기본 정보</button>
      <button :class="{ active: currentTab === 'analysis' }" @click="currentTab = 'analysis'">분석 정보</button>
      <button :class="{ active: currentTab === 'history' }" @click="currentTab = 'history'">과거 이력</button>
    </div>

    <div class="currentVessel d-flex f-d-column flex-1 scrollable-content">

      <div v-show="currentTab === 'basic'" class="tab-content">
        <div class="section-group">
          <div class="vessel-id d-flex a-i-center">
            <img :src="require('@/assets/ship-icon.png')" alt="ship">
            선박 정보
          </div>
          <div class="container info-boxes d-flex m-t-10">
            <div class="content flex-1 mmsi d-flex f-d-column j-c-center a-i-center">
              <div class="title">MMSI</div>
              <div class="value">{{ props.vessel.mmsi }}</div>
            </div>
            <div class="content flex-1 imo d-flex f-d-column j-c-center a-i-center">
              <div class="title">IMO</div>
              <div class="value">{{ props.vessel.imonumber || '0' }}</div>
            </div>
            <div class="content flex-1 callsign d-flex f-d-column j-c-center a-i-center">
              <div class="title">호출부호</div>
              <div class="value">{{ props.vessel.callsign || '-' }}</div>
            </div>
          </div>
          <div class="container container-inline d-flex m-t-10">
            <div class="date d-flex a-i-center flex-1">
              <img :src="require('@/assets/date-icon.png')" alt="date">
              수집 기간
            </div>
            <div class="value d-flex j-c-center a-i-center flex-1 addon">{{ dateFormat(dateByVessel?.min) }}</div>
            <div class="value d-flex j-c-center a-i-center flex-1">{{ dateFormat(dateByVessel?.max) }}</div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="section-group">
          <div class="vessel-info d-flex a-i-center">
            <img :src="require('@/assets/ship-icon.png')" alt="info">
            선박 상세 제원
          </div>
          <div class="vessel-type d-flex a-i-center m-t-10">
            <span class="name">선종</span>
            <span class="value">{{ props.vessel.shiptype || '정보 없음' }}</span>
          </div>
          <div class="d-flex a-i-center m-t-10" style="gap: 10px;">
            <div class="country-flag d-flex a-i-center flex-1">
              <span class="name">국적</span>
              <span class="value">{{ props.vessel.flagcountry || '미상' }}</span>
            </div>
            <div class="nav-status-code d-flex a-i-center flex-1">
              <span class="name">항해 상태</span>
              <span class="d-flex a-i-center">
                <span class="value">{{ props.vessel.navstatuscode || '0' }}</span>
                <span class="tooltip-container">
                  <f-a-icon class="info-icon" icon="circle-info"></f-a-icon>
                  <span class="popover">{{ NAV_STATUS[props.vessel.navstatuscode] || NAV_STATUS[15] }}</span>
                </span>
              </span>
            </div>
          </div>
          <div class="d-flex a-i-center m-t-10" style="gap: 10px;">
            <div class="vessel-longitude d-flex a-i-center flex-1">
              <span class="name">경도</span>
              <span class="value">{{ props.vessel.longitude }}</span>
            </div>
            <div class="vessel-latitude d-flex a-i-center flex-1">
              <span class="name">위도</span>
              <span class="value">{{ props.vessel.latitude }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-show="currentTab === 'analysis'" class="tab-content">
        <div class="woo-ri-panel" v-if="props.vessel.category === 'loitering'">

          <div class="panel-section text-center">
            <div class="gauge-wrapper">
              <svg viewBox="0 0 100 55" class="gauge-svg">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F1F5F9" stroke-width="12" stroke-linecap="round"/>
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" :stroke="riskColor" stroke-width="12" stroke-linecap="round"
                      :stroke-dasharray="125.66" :stroke-dashoffset="gaugeOffset" class="gauge-path"/>
              </svg>
              <div class="gauge-text">
                <div class="score-value" :style="{ color: riskColor }">{{ riskScore }}%</div>
                <div class="score-label">배회 위험도</div>
              </div>
            </div>

            <div class="pattern-badge">
              <span class="dot" :style="{ backgroundColor: riskColor }"></span>
              유형: {{ getLoiteringType(props.vessel.pred_loitering_type) }}
            </div>
          </div>

          <div class="panel-divider"></div>

          <div class="panel-section">
            <div class="section-header">
              <div class="title">이상 강도 추이</div>
              <div class="subtitle">(탐지 알고리즘 편차치)</div>
            </div>
            <div class="sparkline-box">
              <svg viewBox="0 0 200 45" class="sparkline-svg">
                <defs>
                  <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" :stop-color="riskColor" stop-opacity="0.3"/>
                    <stop offset="100%" :stop-color="riskColor" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <polygon points="0,45 0,35 40,30 80,37 120,23 160,20 200,10 200,45" fill="url(#trend-grad)"/>
                <polyline points="0,35 40,30 80,37 120,23 160,20 200,10" fill="none" :stroke="riskColor" stroke-width="2.5"/>
                <circle cx="200" cy="10" r="4.5" :fill="riskColor" stroke="#fff" stroke-width="1.5"/>
              </svg>
              <div class="divergence-value" :style="{ color: riskColor }">
                현재 강도: <strong>{{ props.vessel.pred_divergence || 'N/A' }}</strong>
              </div>
            </div>
          </div>

          <div class="panel-divider"></div>

          <div class="panel-section current-status d-flex j-c-between">
            <div class="status-item flex-1">
              <div class="status-title">추정 배회 반경</div>
              <div class="status-value">{{ props.vessel.pred_divergence ? (props.vessel.pred_divergence / 25).toFixed(1) : 1.2 }} <span class="unit">nm</span></div>
            </div>
            <div class="status-item flex-1 border-left">
              <div class="status-title">현재 속력(SOG)</div>
              <div class="status-value">{{ props.vessel.sog || 0 }}<span class="unit">kts</span></div>
            </div>
          </div>
        </div>

        <div class="section-group" v-else>
           <p style="text-align: center; color: #888; margin: 30px 0;">현재 해당 선박은 배회 의심 분석 대상이 아닙니다.</p>
        </div>
      </div>

      <div v-show="currentTab === 'history'" class="tab-content">
        <div class="section-group">
          <table class="history-table">
            <thead>
              <tr><th>발생 일시</th><th>활동 유형</th><th>위험도</th></tr>
            </thead>
            <tbody>
              <tr><td>2024-03-01 14:22</td><td><span class="history-badge loitering">배회</span></td><td class="risk-medium">주의</td></tr>
              <tr><td>2024-02-15 08:11</td><td><span class="history-badge delayed">입항지연</span></td><td class="risk-low">관찰</td></tr>
              <tr><td>2023-11-20 22:45</td><td><span class="history-badge illegal">불법어업</span></td><td class="risk-high">심각</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-group ai-command-center">
        <div class="vessel-info d-flex a-i-center title-ai" @click="showAiServices = !showAiServices" style="cursor: pointer;">
          <div class="d-flex a-i-center">
            <span class="ai-badge">AI</span>
            선박활동 심층 분석 요청
          </div>
          <f-a-icon :icon="showAiServices ? 'chevron-up' : 'chevron-down'" style="color: #275FCE;" />
        </div>
        <div class="action-buttons d-flex f-d-column" style="margin-top: 15px;" v-show="showAiServices">
          <button class="ai-btn" @click="requestSvt" :disabled="loadingSvt">
            <div class="btn-content"><span class="service-code">06-SVT</span><span class="service-name">시공간 궤적 예측</span></div>
            <div class="status-icon"><f-a-icon v-if="loadingSvt" icon="spinner" class="fa-spin" /><f-a-icon v-else icon="map-location-dot" /></div>
          </button>
          <button class="ai-btn" @click="requestLgvd" :disabled="loadingLgvd">
            <div class="btn-content"><span class="service-code">09-LGVD</span><span class="service-name">VLM 선박활동 설명</span></div>
            <div class="status-icon"><f-a-icon v-if="loadingLgvd" icon="spinner" class="fa-spin" /><f-a-icon v-else icon="file-lines" /></div>
          </button>
          <button class="ai-btn" @click="requestLvad" :disabled="loadingLvad">
            <div class="btn-content"><span class="service-code">10-LVAD</span><span class="service-name">LLM 불법어업 근거 보고서</span></div>
            <div class="status-icon"><f-a-icon v-if="loadingLvad" icon="spinner" class="fa-spin" /><f-a-icon v-else icon="gavel" /></div>
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
import { ref, watch, onMounted, computed } from 'vue'
import { vesselApi, servicesApi } from '@/apis'

const NAV_STATUS = [
  '엔진 사용 항해 중', '정박 중', '지휘 불능', '조종 제한', '흘수 제약', '계류 중', '좌초', '어업 종사 중', '돛 사용 항해 중', '(예약됨)', '(예약됨)', '선미 예인 중', '선수 밀기 / 측면 예인 중', '(미래 사용을 위해 예약됨)', 'AIS-SART, MOB, EPIRB 활성화', '알 수 없음 (기본값)'
]

const props = defineProps({
  vessel: { type: Object, required: true },
  dashboardTime: { type: String, required: false, default: '' }
})

const emit = defineEmits(['info:close', 'info:highlight', 'info:normalize', 'info:trajectory', 'info:predict', 'info:blink'])

const dateByVessel = ref(null)
const currentTab = ref('basic')
const showAiServices = ref(false)

const loadingSvt = ref(false)
const loadingLgvd = ref(false)
const loadingLvad = ref(false)

const showReportModal = ref(false)
const currentReportTitle = ref('')
const reportData = ref({})

// 💡 도넛 차트를 왼쪽에서 오른쪽으로 채우는 계산식
const riskScore = computed(() => {
  if (!props.vessel || !props.vessel.pred_loitering_prob) return 0
  return Math.round(props.vessel.pred_loitering_prob * 100)
})

const riskColor = computed(() => {
  if (riskScore.value > 80) return '#EF4444' // 세련된 Red (Tailwind 스타일)
  if (riskScore.value > 50) return '#F59E0B' // 세련된 Orange
  return '#10B981' // 세련된 Green
})

const gaugeOffset = computed(() => {
  const max = 125.66
  return max - (max * (riskScore.value / 100))
})

onMounted(async () => {
  dateByVessel.value = await vesselApi.getMinMaxDateByVessel(props.vessel.mmsi)
})

watch(() => props.vessel, async (c, o) => {
  if (c) {
    dateByVessel.value = await vesselApi.getMinMaxDateByVessel(c.mmsi)
    currentTab.value = 'basic' // 항상 기본 정보 탭이 먼저 열림!

    if (c.pred_loitering_prob > 0.8) {
      emit('info:blink', c)
    }
  } else {
    dateByVessel.value = null
    if (o) emit('info:normalize', o.vesselid)
  }
}, { immediate: true })

function dateFormat (d) {
  if (!d) return '-'
  const date = new Date(d)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

function getLoiteringType (typeCode) {
  const types = {
    0: '왕복형 (Oscillatory)',
    1: '안정형 (Steady)',
    2: '원형 (Circular)',
    3: '전환형 (Transition)',
    4: '점진적 표류 (Gradual Drift)',
    5: '주저형 (Hesitant)'
  }
  return types[typeCode] || '분석 중'
}

function formatToUtcmin (dateObj) {
  if (!dateObj) return '20240126194208'
  const d = new Date(dateObj)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

function parseUtcminToDate (utcStr) {
  if (!utcStr || utcStr.length !== 14) return new Date()
  const y = parseInt(utcStr.substring(0, 4))
  const m = parseInt(utcStr.substring(4, 6)) - 1
  const d = parseInt(utcStr.substring(6, 8))
  const h = parseInt(utcStr.substring(8, 10))
  const min = parseInt(utcStr.substring(10, 12))
  const sec = parseInt(utcStr.substring(12, 14))
  return new Date(y, m, d, h, min, sec)
}

async function requestSvt () {
  loadingSvt.value = true
  try {
    const endTarget = props.dashboardTime ? parseUtcminToDate(props.dashboardTime) : new Date()
    const PREDICTION_MINUTES = 60
    const startTarget = new Date(endTarget.getTime() - (PREDICTION_MINUTES * 60 * 1000))

    const payload = {
      mmsi: props.vessel.mmsi.toString(),
      start_posutcmin: formatToUtcmin(startTarget),
      end_posutcmin: formatToUtcmin(endTarget),
      vessel_type: 'stownet'
    }

    const response = await servicesApi['06-svt'].predict(payload)
    if (response && response.status === 'success') {
      emit('info:predict', { input: response.input_trajectory, predicted: response.predicted_trajectory })
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

async function requestLgvd () {
  loadingLgvd.value = true
  currentReportTitle.value = `[${props.vessel.shipname}] VLM 선박활동 설명서`
  setTimeout(async () => {
    const data = await servicesApi['10-lvad'].getExplanation()
    reportData.value = data
    loadingLgvd.value = false
    showReportModal.value = true
  }, 2000)
}

async function requestLvad () {
  loadingLvad.value = true
  currentReportTitle.value = `[${props.vessel.shipname}] LLM 불법어업 근거 분석`
  try {
    const data = await servicesApi['10-lvad'].getExplanation()
    reportData.value = data
    showReportModal.value = true
  } catch (error) {
    console.error('LVAD 분석 실패:', error)
    alert('분석 중 오류가 발생했습니다.')
  } finally {
    loadingLvad.value = false
  }
}

function formatAnswer (text) {
  if (!text) return ''
  return text.replace(/\n/g, '<br />')
}

function extractFileName (path) {
  if (!path) return ''
  return path.split('/').pop()
}
</script>

<style scoped>
/* 베이스 CSS */
.information { position: fixed; bottom: 80px; right: 30px; width: 380px; height: auto; max-height: calc(100vh - 160px); background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); overflow: hidden; z-index: 3000; }
.header { font: normal normal 800 18px/24px SUIT; color: #111111; min-height: 48px; justify-content: space-between; padding: 5px 20px; border-bottom: 1px solid #E5E7EB;}
.ship-title { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.header > button { border: none; background: none; color: #6B7280; width: 24px; height: 24px; font-size: 16px; cursor: pointer; transition: color 0.2s; }
.header > button:hover { color: #111827; }

/* 탭 메뉴 */
.tabs { display: flex; background-color: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
.tabs button { flex: 1; padding: 12px 0; border: none; background: none; font: normal normal 600 13px/1 SUIT; color: #6B7280; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
.tabs button:hover { color: #111827; }
.tabs button.active { color: #275FCE; border-bottom-color: #275FCE; background-color: #ffffff; }

.currentVessel { padding: 15px 20px; gap: 8px; overflow-y: auto; }
.tab-content { display: flex; flex-direction: column; gap: 10px; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* 기본 정보 스타일 */
.currentVessel img { width: 14px; height: 14px; }
.vessel-id, .date, .vessel-info { font: normal normal 700 13px/20px SUIT; color: #374151; gap: 6px; }
.info-boxes { gap: 12px; }
.mmsi, .imo, .callsign { height: 58px; gap: 4px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.mmsi > .title, .imo > .title, .callsign > .title { font: normal normal 800 11px/16px SUIT; }
.mmsi > .value, .imo > .value, .callsign > .value { font: normal normal 700 13px/16px SUIT; }
.mmsi { background: #EEF2FF; color: #3B82F6; }
.imo { background: #F3F4F6; color: #4B5563; }
.callsign { background: #FEF3C7; color: #D97706; }
.vessel-type, .nav-status-code, .vessel-longitude, .country-flag, .vessel-latitude { background: #F9FAFB; border-radius: 6px; padding: 0 12px; height: 34px; justify-content: space-between; }
.container-inline { height: 30px; }
.container-inline .value { position: relative; font: normal normal 600 12px/20px SUIT; color: #374151; border-radius: 6px; background: #F9FAFB; height: 30px; }
.container-inline .addon::after { content: '-'; position: absolute; right: -6px; top: 5px; }
.vessel-type > .name, .nav-status-code > .name, .vessel-longitude > .name, .country-flag > .name, .vessel-latitude > .name { font: normal normal 700 12px/20px SUIT; color: #6B7280; }
.vessel-type > .value, .nav-status-code .value, .vessel-longitude > .value, .country-flag > .value, .vessel-latitude > .value { font: normal normal 600 13px/20px SUIT; color: #111827; }
.divider { border-top: 1px dashed #E5E7EB; margin: 10px 0; }

.tooltip-container { position: relative; display: inline-flex; align-items: center; margin-left: 5px; cursor: help; }
.info-icon { color: #9CA3AF; transition: color 0.2s; }
.tooltip-container:hover .info-icon { color: #275FCE; }
.popover { visibility: hidden; opacity: 0; position: absolute; top: calc(100% + 8px); right: -10px; background-color: #1F2937; color: #ffffff; padding: 8px 12px; border-radius: 6px; font: normal normal 500 12px/16px SUIT; white-space: nowrap; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.2); pointer-events: none; transition: opacity 0.2s ease-in-out; }
.popover::after { content: ''; position: absolute; bottom: 100%; right: 14px; border-width: 6px; border-style: solid; border-color: transparent transparent #1F2937 transparent; }
.tooltip-container:hover .popover { visibility: visible; opacity: 1; }

/* ==========================================
   💡 WOO RI PANEL 스타일 완벽 적용
========================================== */
.woo-ri-panel { background: #ffffff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); padding: 18px 15px; }
.panel-section { margin-bottom: 15px; }
.panel-divider { border-top: 1px solid #F3F4F6; margin: 18px 0; }

/* 도넛 차트 컨테이너 개선 */
.gauge-wrapper { position: relative; width: 150px; height: 85px; margin: 0 auto 12px; }
.gauge-svg { width: 100%; height: 100%; overflow: visible; }
.gauge-path { transition: stroke-dashoffset 1s ease-out; }
.gauge-text { position: absolute; bottom: 5px; left: 0; right: 0; text-align: center; }
.score-value { font: normal normal 800 32px/1 SUIT; letter-spacing: -0.5px; }
.score-label { font: normal normal 600 11px/1 SUIT; color: #9CA3AF; margin-top: 4px; letter-spacing: 0.5px; }

/* 배회 패턴 배지 */
.pattern-badge { display: inline-flex; align-items: center; justify-content: center; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 20px; padding: 6px 14px; font: normal normal 600 13px/1 SUIT; color: #374151; }
.pattern-badge .dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }

/* 스파크라인 */
.section-header { margin-bottom: 12px; }
.section-header .title { font: normal normal 800 12px/1 SUIT; color: #4B5563; }
.section-header .subtitle { font: normal normal 500 11px/1 SUIT; color: #9CA3AF; margin-top: 2px; }
.sparkline-box { background: #F8FAFC; border-radius: 8px; padding: 12px; border: 1px solid #F1F5F9; }
.sparkline-svg { width: 100%; height: 45px; display: block; overflow: visible; }
.divergence-value { font: normal normal 600 11px/1 SUIT; margin-top: 8px; }

/* 실무자 맞춤 하단 상태창 */
.current-status { padding: 0; margin-bottom: 0; }
.status-item { background: #F8FAFC; padding: 12px; border-radius: 8px; }
.status-item.border-left { margin-left: 10px; }
.status-title { font: normal normal 600 11px/1 SUIT; color: #6B7280; margin-bottom: 6px; }
.status-value { font: normal normal 800 18px/1 SUIT; color: #111827; }
.status-value .unit { font-size: 12px; font-weight: 600; color: #9CA3AF; margin-left: 2px; }

/* 과거 이력 및 AI 버튼 패널 유지 */
.history-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.history-table th { background: #F9FAFB; padding: 10px; text-align: left; color: #4B5563; border-bottom: 1px solid #E5E7EB; }
.history-table td { padding: 10px; border-bottom: 1px solid #F3F4F6; color: #111827; font-weight: 500; }
.history-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #fff; }
.history-badge.loitering { background: #F59E0B; }
.history-badge.delayed { background: #6B7280; }
.history-badge.illegal { background: #EF4444; }
.risk-high { color: #EF4444; font-weight: bold; }
.risk-medium { color: #F59E0B; font-weight: bold; }
.risk-low { color: #6B7280; font-weight: bold; }

.ai-command-center { background-color: #F0F5FF; border: 1px solid #D6E4FF; border-radius: 8px; padding: 12px; margin-bottom: 5px; }
.title-ai { color: #1D4ED8; font-weight: 800; justify-content: space-between; }
.ai-badge { background-color: #1D4ED8; color: #fff; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 12px; margin-right: 8px; }
.action-buttons { gap: 10px; }
.ai-btn { display: flex; justify-content: space-between; align-items: center; width: 100%; height: 44px; background-color: #ffffff; border: 1px solid #BFDBFE; border-radius: 6px; padding: 0 14px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
.ai-btn:hover:not(:disabled) { background-color: #1D4ED8; border-color: #1D4ED8; }
.ai-btn:hover:not(:disabled) .service-code { color: #93C5FD; }
.ai-btn:hover:not(:disabled) .service-name { color: #ffffff; }
.ai-btn:hover:not(:disabled) .status-icon { color: #ffffff; }
.ai-btn:disabled { background-color: #F3F4F6; border-color: #E5E7EB; cursor: not-allowed; }
.btn-content { display: flex; flex-direction: column; align-items: flex-start; }
.service-code { font: normal normal 800 10px/12px SUIT; color: #60A5FA; margin-bottom: 2px; transition: color 0.2s; }
.service-name { font: normal normal 700 13px/16px SUIT; color: #1F2937; transition: color 0.2s; }
.status-icon { font-size: 16px; color: #1D4ED8; transition: color 0.2s; }

/* 모달 디자인 생략 (동일 유지) */
.report-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.6); z-index: 9999; }
.report-modal { width: 650px; max-height: 85vh; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); overflow: hidden; }
.report-header { background-color: #275FCE; color: #ffffff; padding: 15px 25px; }
.report-header h2 { margin: 0; font: normal normal 700 18px/24px SUIT; }
.close-report-btn { background: none; border: none; color: #ffffff; font-size: 18px; cursor: pointer; transition: opacity 0.2s; }
.close-report-btn:hover { opacity: 0.7; }
.report-body { padding: 25px; background-color: #FBFDFD; overflow-y: auto; }
.report-answer { font: normal normal 500 14px/24px SUIT; color: #333333; background-color: #ffffff; padding: 20px; border: 1px solid #EEEEEE; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 20px; }
.report-image-box { margin-bottom: 20px; border: 1px solid #DDDDDD; border-radius: 8px; padding: 10px; background-color: #ffffff; text-align: center; }
.report-img { max-width: 100%; max-height: 300px; object-fit: contain; }
.report-sources h3 { font: normal normal 800 15px/20px SUIT; color: #275FCE; margin: 0 0 10px 0; }
.report-sources ul { list-style: none; padding: 0; margin: 0; }
.report-sources li { display: flex; align-items: center; background-color: #ffffff; border: 1px solid #E5E5E5; border-radius: 6px; padding: 10px; margin-bottom: 8px; }
.source-tag { background-color: #EAF0FF; color: #275FCE; font: normal normal 700 12px/16px SUIT; padding: 4px 8px; border-radius: 4px; margin-right: 12px; white-space: nowrap; }
.source-text { font: normal normal 500 13px/18px SUIT; color: #555555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.report-footer { padding: 15px 25px; background-color: #ffffff; border-top: 1px solid #EEEEEE; }
.export-btn { background-color: #333333; color: #ffffff; border: none; border-radius: 6px; padding: 10px 20px; font: normal normal 700 14px/20px SUIT; cursor: pointer; transition: background-color 0.2s; }
.export-btn:hover { background-color: #555555; }
</style>
