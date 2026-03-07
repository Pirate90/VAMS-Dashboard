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

      <div class="information-tools d-flex a-i-center">
        <div class="tools d-flex">
          <button title="Trajectory" @click="emit('info:trajectory', props.vessel.mmsi)"><f-a-icon icon="map-location-dot" /></button>
          <button title="Download"><f-a-icon icon="download" /></button>
          <button title="Layers"><f-a-icon icon="layer-group" /></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { doubtApi } from '@/apis'

const NAV_STATUS = [
  'Under way using its engine',
  'Anchored',
  'Not under command',
  'Has restricted maneuverability',
  'Ship draught is limiting its movement',
  'Moored (tied to another object to limit free movement)',
  'Aground',
  'Engaged in fishing',
  'Under way sailing',
  '(Reserved for dangerous goods)',
  '(Reserved for dangerous goods)',
  'Power-driven vessel towing astern',
  'Power-driven vessel pushing ahead/towing alongside',
  '(Reserved for future use)',
  'AIS-SART, MOB, EPIRB active',
  'Undefined (default)'
]

const props = defineProps({
  vessel: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['info:close', 'info:highlight', 'info:normalize', 'info:trajectory'])

const dateByVessel = ref(null)
const showNavStatus = ref(false)

onMounted(async () => {
  dateByVessel.value = await doubtApi.getMinMaxDateByVessel(props.vessel.mmsi)
})

watch(() => props.vessel, async (c, o) => {
  if (c) {
    dateByVessel.value = await doubtApi.getMinMaxDateByVessel(c.mmsi)
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
</script>

<style scoped>
/* 독립적인 고정 위치 (우측 하단) */
.information {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 360px; /* 창 폭을 기존 500px에서 360px로 다이어트 */
  height: auto;
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

.header > button:hover {
  opacity: 0.6;
}

.currentVessel {
  padding: 10px 15px;
  gap: 8px;
  overflow-y: auto;
}

.currentVessel img {
  width: 14px;
  height: 14px;
}

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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mmsi, .imo, .callsign {
  height: 55px;
  gap: 4px;
  border-radius: 5px;
}

.mmsi > .title, .imo > .title, .callsign > .title {
  font: normal normal 800 12px/16px SUIT;
}

.mmsi > .value, .imo > .value, .callsign > .value {
  font: normal normal 600 12px/16px SUIT;
}

.mmsi { background: #EAE4FF; color: #7D58FF; }
.imo { background: #DBE5FB; color: #176AFF; }
.callsign { background: #FCEEBD; color: #AE6E00; }

.container-inline {
  height: 28px;
}

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
  margin: 10px 0;
}

.info-icon {
  color: #888888;
  cursor: pointer;
}

.popover {
  position: absolute;
  bottom: 25px;
  right: -5px;
  width: 180px;
  font: normal normal 500 11px/16px SUIT;
  color: #ffffff;
  background-color: #333333;
  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  z-index: 2001;
}

.information-tools {
  justify-content: flex-end;
  margin-top: 5px;
  padding-bottom: 5px;
}

.information-tools > .tools {
  gap: 12px;
}

.information-tools > .tools > button {
  border: none;
  background: none;
  font-size: 16px;
  color: #666666;
  padding: 4px;
}

.information-tools > .tools > button:hover {
  cursor: pointer;
  color: #4D61FF;
}
</style>
