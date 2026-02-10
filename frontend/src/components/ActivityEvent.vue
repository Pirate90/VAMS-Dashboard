<template>
  <div class="event">
    <div class="title">
      <img :src="require('@/assets/event-black.png')" alt="">
      <span>주요 선박 활동 이벤트</span>
    </div>

    <div class="list">
      <div :class="['card', `border-${e.type}`]" v-for="e in eventList" :key="e.num">
        <div :class="['c-title', `bg-${e.type}`]">
          <img :src="require(`@/assets/event-${e.type}.png`)" alt="">
          <span :class="[`txt-${e.type}`]">Event #{{ e.num }}</span>
          <span>{{ dateFormater() }}</span>
        </div>
        <div class="c-content">
          <span :class="[`content-${e.type}`]">{{ e.header }}</span>
          <span :class="['mmsi', `mmsi-${e.type}`]">{{ e.mmsi }}</span>
          <span :class="[`content-${e.type}`]">{{ e.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const eventList = [
  { num: 1, type: 'warning', mmsi: '32433244', date: '', header: 'AIS 미보고 의심 선박', description: '위성영상 탐지 알림' },
  { num: 2, type: 'warning', mmsi: '43256333', date: '', header: '인천해역 IUU 불법선박', description: '추정 선박 감지' },
  { num: 3, type: 'danger', mmsi: '34423438', date: '', header: '관심선박 IUU 불법선박', description: '예상 이동경로 이탈' },
  { num: 4, type: 'warning', mmsi: '45343465', date: '', header: '어업선박', description: '어업형태 위반 조업 정황 감지' },
  { num: 5, type: 'warning', mmsi: '65343444', date: '', header: '어업선박', description: '금어기 수역 조업 정황 감지' }
]

function dateFormater (date = new Date()) {
  const y = String(date.getFullYear()).padStart(4, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}
</script>

<style scoped>
.event {
  position: absolute;
  right: 30px;
  top: 30px;
  width: 420px;
  height: 50%;
  background: white;
  border-radius: 15px;
  padding: 20px;
}
.title {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.title > img {
  height: 100%;
}
.title > span {
  font: normal normal 800 24px/20px SUIT;
  letter-spacing: -0.6px;
  color: #444444;
}

.list {
  width: 100%;
  height: calc(100% - 30px);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}
.card {
  width: 100%;
  border-radius: 10px;
  border: 1px solid;
}
.c-title {
  height: 30px;
  border-radius: 10px 10px 0 0;
  border-bottom: inherit;
  padding: 0 10px;
  display: flex;
  align-items: center;
}
.c-title > img {
  height: 20px;
}
.c-title > span {
  font: normal normal 800 16px/20px SUIT;
  letter-spacing: -0.8px;
  padding-left: 10px;
}
.border-danger {
  border-color: #FFC5C2;
}
.bg-danger {
  background-color: #FFF2F2;
}
.txt-danger, .content-danger {
  color: #FF1100;
}
.border-warning {
  border-color: #FFE3A9;
}
.bg-warning {
  background-color: #FFFBF2;
}
.txt-warning {
  color: #FF9900;
}
.c-content {
  padding: 5px 10px;
  gap: 5px;
}
.c-content > span {
  font: normal normal 800 16px/20px SUIT;
  letter-spacing: -0.8px;
}
.c-content > .mmsi {
  margin: 0 5px;
  padding: 2px 15px;
  border: 1px solid #DDDDDD;
  background: #EEEEEE;
  border-radius: 15px;
}
.mmsi-danger {
  background: #FF1100 !important;
  color: #ffffff;
  border: none !important;
}
</style>
