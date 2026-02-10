<template>
  <div class="report">
    <div class="report-container">
      <div class="header">
        <h1>선박활동 사건 분석</h1>
        <div class="btns">
          <button class="download-button" @click="downloadDocx">
            <f-a-icon icon="download"></f-a-icon>
          </button>

          <button class="download-button" @click="emit('report:close')">
            <f-a-icon icon="x"></f-a-icon>
          </button>
        </div>
      </div>

      <h2 style="text-align: center;">해양경찰청 해역별 선박활동 분석 보고서</h2>
      <div class="report-content">
        <div v-for="(d, i) in reportDataArr" :key="i" style="width: 50%;">
          <div :class="getReportClass(d.type)" :style="{ marginBottom: needMargin(d.type, i) }">{{ d.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits } from 'vue'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

const emit = defineEmits(['report:close'])

// ✅ 재사용 가능한 보고서 데이터 객체
const reportData = [
  {
    title: '1. 보고서 개요',
    items: [
      '보고서 작성일: 2025년 2월 18일',
      '분석 기간: 2025년 2월 1일 ~ 2025년 2월 15일'
    ]
  },
  {
    title: '2. 해역별 선박활동 분석',
    subsections: [
      {
        title: '2.1 서해 해역',
        items: [
          '의심선박 수: 35척',
          '불법어업선박 수: 12척 (주요 불법어업 패턴: 자망, 통발)',
          '중국 국적 어선의 불법조업 증가',
          '조업구역을 이탈하여 대한민국 수역 내 조업 사례 발생',
          '야간 시간대 AIS 신호 차단 후 활동하는 패턴 확인'
        ]
      },
      {
        title: '2.2 남해 해역',
        items: [
          '의심선박 수: 20척',
          '불법어업선박 수: 8척 (주요 불법어업 패턴: 쌍끌이)',
          '일정 구역을 반복적으로 이동 및 조업 패턴 발견',
          '해양경찰 순찰 시 선박 위치 변경 및 항적 조작',
          '근해 어선 간의 신호 공유를 통한 단속 회피 행동'
        ]
      },
      {
        title: '2.3 동해 해역',
        items: [
          '의심선박 수: 18척',
          '불법어업선박 수: 5척 (주요 불법어업 패턴: 통발)',
          '러시아 및 북한 국적 어선의 경제수역(EEZ) 접근 증가',
          '특정 구역에서 장시간 정박 후 불법조업 수행',
          '대형 트롤 어선의 조업구역 미신고 사례 다수 확인'
        ]
      },
      {
        title: '2.4 제주 인근 해역',
        items: [
          '의심선박 수: 25척',
          '불법어업선박 수: 10척 (주요 불법어업 패턴: 트롤)',
          '불법 조업 후 야간 시간대 급속 이동하여 도주 시도',
          '제주 EEZ 경계선 근처에서 반복적인 조업 행위',
          '조업 신고 없이 어획량 반출하는 사례 확인'
        ]
      }
    ]
  },
  {
    title: '3. 결론',
    items: [
      '의심선박 증가 해역: 서해, 제주 인근 해역에서 의심선박 및 불법어업활동 증가 확인됨.',
      '불법어업 주요 시간대: 주로 야간(00:00~06:00) 및 해경 순찰이 적은 시간대에 활동이 집중됨.'
    ]
  }
]

const reportDataArr = computed(() => {
  const arr = []
  reportData.forEach(s => {
    arr.push({ type: 'title', content: s.title })

    if (s?.items) {
      s.items.forEach(i => {
        arr.push({ type: 'item', content: i })
      })
    } else if (s?.subsections) {
      s.subsections.forEach(ss => {
        arr.push({ type: 'subtitle', content: ss.title })
        ss.items.forEach(si => {
          arr.push({ type: 'subitem', content: si })
        })
      })
    }
  })

  return arr
})

function getReportClass (t) {
  return `report-${t}`
}

function needMargin (t, i) {
  const isItem = t === 'item' || t === 'subitem'
  const isLastItem = reportDataArr.value[i + 1]?.type === 'title' || reportDataArr.value[i + 1]?.type === 'subtitle'
  if (isItem && isLastItem) return '10px'
  else return 0
}

function downloadDocx () {
  const docContent = []

  docContent.push(
    new Paragraph({
      children: [new TextRun({ text: '해양경찰청 해역별 선박활동 분석 보고서', bold: true, size: 24 })]
    }),
    new Paragraph({ text: '' })
  )

  reportData.forEach(section => {
    docContent.push(new Paragraph({ text: section.title, bold: true }))

    if (section.items) {
      section.items.forEach(item => {
        docContent.push(new Paragraph(` • ${item}`))
      })
    }

    if (section.subsections) {
      section.subsections.forEach(sub => {
        docContent.push(new Paragraph({ text: sub.title, bold: true }))
        sub.items.forEach(item => {
          docContent.push(new Paragraph(` • ${item}`))
        })
      })
    }

    docContent.push(new Paragraph({ text: '' })) // spacing
  })

  const doc = new Document({
    sections: [{ children: docContent }]
  })

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, '2025년_2월_주간_보고서_1주차.docx')
  })
}
</script>

<style scoped>
.report {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.report-container {
  width: calc(100% - 100px);
  height: calc(100% - 100px);
  padding: 20px;
  background: #fff;
  border-radius: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
}

.report-content {
  height: calc(100% - 75px);
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 20px;
}

.download-button {
  background-color: #e5e5e5;
  border: 1px solid #aaa;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
}

.report-title {
  font: normal normal 600 20px/40px SUIT;
}
.report-item {
  margin-left: 15px;
  font: normal normal 500 15px/25px SUIT;
}
.report-item::before,
.report-subitem::before {
  content: '•';
  display: inline-block;
  margin-right: 8px;
  color: #000; /* 점 색상 */
}
.report-subtitle {
  font: normal normal 600 18px/30px SUIT;
  margin-left: 15px;
}
.report-subitem {
  font: normal normal 500 15px/25px SUIT;
  margin-left: 30px;
}
</style>
