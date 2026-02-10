<template>
  <div class="currentVessel d-flex f-d-column flex-1">
    <div class="container d-flex">
      <div class="content flex-1">
        <div class="vessel-id d-flex a-i-center">
          <img :src="require('@/assets/ship-icon.png')" alt="">
          VESSEL ID
        </div>
        <div class="value vessel-id-value d-flex a-i-center" style="user-select: text;">{{ props.vessel.vesselid }}
        </div>
      </div>
    </div>

    <div class="container d-flex" style="margin-top: 10px; user-select: text;">
      <div class="content flex-1 mmsi d-flex f-d-column j-c-center a-i-center">
        <div class="title">MMSI</div>
        <div class="value">{{ props.vessel.mmsi }}</div>
      </div>

      <div class="content flex-1 imo d-flex f-d-column j-c-center a-i-center">
        <div class="title">IMO</div>
        <div class="value">{{ props.vessel.imonumber }}</div>
      </div>

      <div class="content flex-1 callsign d-flex f-d-column j-c-center a-i-center">
        <div class="title">CALL SIGN</div>
        <div class="value">{{ props.vessel.callsign }}</div>
      </div>
    </div>

    <div class="container container-inline d-flex" style="margin-top: 10px;">
      <div class="date d-flex a-i-center flex-1">
        <img :src="require('@/assets/date-icon.png')" alt="">
        DATES
      </div>
      <div class="value d-flex j-c-center a-i-center flex-1 addon">{{ dateFormat(dateByVessel?.min) }}</div>
      <div class="value d-flex j-c-center a-i-center flex-1">{{ dateFormat(dateByVessel?.max) }}</div>
    </div>

    <div class="vessel-info d-flex a-i-center" style="margin-top: 10px;">
      <img :src="require('@/assets/ship-icon.png')" alt="">
      VESSEL INFORMATION
    </div>

    <div class="vessel-type d-flex a-i-center">
      <span class="name">TYPE</span>
      <span class="value">{{ props.vessel.shiptype }}</span>
    </div>

    <div class="d-flex a-i-center" style="gap: 10px;">
      <div class="country-flag d-flex a-i-center flex-1">
        <span class="name">COUNTRY</span>
        <span class="value">{{ props.vessel.flagcountry }}</span>
      </div>
      <div class="nav-status-code d-flex a-i-center flex-1">
        <span class="name">NAV STATUS</span>
        <span>
          <span class="value">{{ props.vessel.navstatuscode }}</span>
          <span style="position: relative">
            <f-a-icon style="color: #777777; margin-left: 5px; cursor: pointer;" icon="circle-info"
              @mouseenter="displayNavStatus" @mouseleave="hideNavStatus"></f-a-icon>
            <span class="popover" v-if="showNavStatus">{{ NAV_STATUS[props.vessel.navstatuscode] }}</span>
          </span>
        </span>
      </div>
    </div>

    <div class="d-flex a-i-center" style="gap: 10px;">
      <div class="vessel-longitude d-flex a-i-center flex-1">
        <span class="name">LONGITUDE</span>
        <span class="value">{{ props.vessel.longitude }}</span>
      </div>
      <div class="vessel-latitude d-flex a-i-center flex-1">
        <span class="name">LATITUDE</span>
        <span class="value">{{ props.vessel.latitude }}</span>
      </div>
    </div>

    <div class="information-tools d-flex">
      <div class="tools d-flex a-i-center">
        <button @click="emit('info:trajectory', props.vessel.mmsi)"><f-a-icon icon="map-location-dot" /></button>
        <button><f-a-icon icon="download" /></button>
        <button><f-a-icon icon="layer-group" /></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue'
import { doubtApi } from '@/apis'

const props = defineProps({
  vessel: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['info:normalize', 'info:trajectory'])

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
  '(Number reserved for modifying reported status of ships carrying dangerous goods/harmful substances/marine pollutants)',
  '(Number reserved for modifying reported status of ships carrying dangerous goods/harmful substances/marine pollutants)',
  'Power-driven vessel towing astern',
  'Power-driven vessel pushing ahead/towing alongside',
  '(Reserved for future use)',
  'Any of the following are active: AIS-SART (Search and Rescue Transmitter), AIS-MOB (Man Overboard), AIS-EPIRB (Emergency Position Indicating Radio Beacon)',
  'Undefined (default)'
]

const showNavStatus = ref(false)
const dateByVessel = ref(null)

watch(() => props.vessel, async (c, o) => {
  if (c) dateByVessel.value = await doubtApi.getMinMaxDateByVessel(c.mmsi)
  else {
    dateByVessel.value = null
    emit('info:normalize', o.vesselid)
  }
})

onMounted(async () => {
  dateByVessel.value = await doubtApi.getMinMaxDateByVessel(props.vessel.mmsi)
})
watch(() => props.vessel, async (c, o) => {
  if (c) dateByVessel.value = await doubtApi.getMinMaxDateByVessel(c.mmsi)
  else {
    dateByVessel.value = null
    emit('info:normalize', o.vesselid)
  }
})

const monthStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function dateFormat (d) {
  const date = new Date(d)
  return `${monthStr[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}
function displayNavStatus () {
  showNavStatus.value = true
}
function hideNavStatus () {
  showNavStatus.value = false
}
</script>

<style scoped>
.currentVessel {
  padding: 10px 15px;
  gap: 10px;
}
.currentVessel > .container {
  gap: 10px;
}
.currentVessel img {
  width: 15px;
  height: 15px;
}
.vessel-id, .date, .vessel-info {
  font: normal normal 800 16px/20px SUIT;
  letter-spacing: -0.4px;
  color: #444444;
  gap: 6px;
}
.vessel-id-value, .vessel-type, .nav-status-code,
.vessel-longitude, .country-flag, .vessel-latitude {
  background: #F8F8F8;
  border-radius: 5px;
  padding: 0 15px;
  height: 40px;
}
.vessel-id-value {
  font: normal normal 600 16px/20px SUIT;
  letter-spacing: -0.4px;
  color: #444444;
  margin-top: 10px;
}
.mmsi, .imo, .callsign {
  height: 70px;
  gap: 5px;
  border-radius: 5px;
}
.mmsi > .title, .imo > .title, .callsign > .title {
  font: normal normal 800 16px/20px SUIT;
  letter-spacing: -0.4px;
}
.mmsi > .value, .imo > .value, .callsign > .value {
  font: normal normal 600 16px/20px SUIT;
  letter-spacing: -0.4px;
}
.mmsi {
  background: #EAE4FF;
  color: #7D58FF;
}
.imo {
  background: #DBE5FB;
  color: #176AFF;
}
.callsign {
  background: #FCEEBD;
  color: #AE6E00;
}
.container-inline {
  height: 30px;
}
.container-inline .value {
  position: relative;
  font: normal normal 600 15px/20px SUIT;
  letter-spacing: -0.38px;
  color: #444444;
  border-radius: 5px;
  background: #F8F8F8;
  height: 30px;
}
.container-inline .addon::after {
  content: '-';
  position: absolute;
  right: -8.5px;
  top: 4px;
}

.vessel-type, .nav-status-code, .vessel-longitude, .country-flag, .vessel-latitude {
  justify-content: space-between;
}
.vessel-type > .name, .nav-status-code > .name, .vessel-longitude > .name,
.country-flag > .name, .vessel-latitude > .name {
  font: normal normal bold 14px/20px SUIT;
  letter-spacing: -0.35px;
  color: #777777;
}
.vessel-type > .value, .nav-status-code .value, .vessel-longitude > .value,
.country-flag > .value, .vessel-latitude > .value {
  font: normal normal 600 15px/20px SUIT;
  letter-spacing: -0.4px;
  color: #444444;
}

.popover {
  position: absolute;
  bottom: 30px;
  right: -10px;
  width: 200px;
  font: normal normal 500 12px/20px SUIT;
  color: #ffffff;
  background-color: #222222;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0px 5px rgba(0, 0, 0, 1);
}

.information-tools {
  justify-content: space-between;
  margin-top: 10px;
}
.information-tools > .tools {
  gap: 15px;
}
.information-tools > .tools > button {
  border: none;
  background: none;
  font-size: 21px;
  color: #444444;
}
.information-tools > .tools > button:hover {
  cursor: pointer;
  opacity: 0.7;
}
</style>
