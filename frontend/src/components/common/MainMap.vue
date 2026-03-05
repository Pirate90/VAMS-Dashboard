<template>
  <div class="main-map-container">
    <div id="map" class="map"></div>
    <button class="vessel-list-toggle" :class="{ active: showVesselList }" @click="toggleVesselList">
      <img src="@/assets/vessel-icon.png" alt="vessel" class="vessel-icon" />
      <span class="vessel-list-text">선박 목록</span>
    </button>
    <div class="vessel-list-wrapper" v-if="showVesselList">
      <VesselList :show="showVesselList" :list="vesselList"
        @list:close="closeVesselList"
        @info:show="showVesselMarker"
        @info:hide="hideVesselMarker"
        @info:trajectory="showTrajectory"
      ></VesselList>
    </div>
  </div>
</template>

<script setup>
import { onMounted, defineExpose, defineEmits, ref } from 'vue'
import initMap from '@/util/maptalks/map'
import Vessel from '@/util/maptalks/vessel'
import Trenchmap from '@/util/maptalks/trenchmap'
import Districtmap from '@/util/maptalks/districtmap'
import Trajectory from '@/util/maptalks/trajectory'
import Img from '@/util/maptalks/img'
import VesselList from '@/components/VesselList'
import * as maptalks from 'maptalks'

import { doubtApi } from '@/apis'

const emit = defineEmits(['info:show', 'data:load', 'draw:completed'])

let map = null
let img = null
let trenchmap = null
let districtmap = null
let vessel = null
let trajectory
let startDate = null
let endDate = null
let drawTool = null
let drawLayer = null

const vesselList = ref([])
const showVesselList = ref(false)

onMounted(async () => {
  map = initMap()

  // Sar(map)
  trenchmap = await Trenchmap(map)
  districtmap = await Districtmap(map)
  vessel = Vessel(map, onClickVessel)
  trajectory = Trajectory(map)
  img = Img(map)

  drawLayer = new maptalks.VectorLayer('draw-layer').addTo(map)

  drawTool = new maptalks.DrawTool({
    mode: 'Polygon',
    symbol: {
      lineColor: '#34495e',
      lineWidth: 2,
      polygonFill: '#1abc9c',
      polygonOpacity: 0.6
    }
  }).addTo(map).disable()

  drawTool.on('drawend', (param) => {
    const { geometry } = param
    drawLayer.clear().addGeometry(geometry) // 기존 구역 삭제 후 추가
    const coords = geometry.getCoordinates()
    // 이 좌표를 팝업으로 전달하기 위해 이벤트를 발생시킵니다.
    emit('draw:completed', coords)
    drawTool.disable()
  })
})

function onClickVessel ({ coord, elements, isChild }) {
  map.animateTo({ zoom: 10, center: [coord.x, coord.y] }, {
    duration: 500,
    easing: 'out'
  })
  emit('info:show', elements, isChild)
}

// 리스트에서 선박을 클릭했을 때 호출되는 함수
function showVesselMarker (vesselData) {
  // 1. 선택한 선박의 위도/경도가 존재하면 해당 위치로 지도 부드럽게 이동
  if (vesselData && vesselData.longitude && vesselData.latitude) {
    map.animateTo({
      zoom: 10,
      center: [vesselData.longitude, vesselData.latitude]
    }, {
      duration: 500,
      easing: 'out'
    })
  }

  // 2. 부모(VAMS.vue)에게 선박 정보를 넘겨서 하나의 상세 정보 창(VesselInformation)만 띄우도록 함
  emit('info:show', vesselData)
}

function hideVesselMarker () {
  // 필요한 경우 마커 숨김 로직을 넣는 곳
}

function toggleVesselList () {
  showVesselList.value = !showVesselList.value
}

function closeVesselList () {
  showVesselList.value = false
}

const sectionList = {
  인천항: [126.6246844, 37.4589868],
  목포항: [126.383362, 34.780277],
  부산항: [129.0430982, 35.1020946]
}

defineExpose({
  changeCenter: (s) => {
    map.animateTo({ center: sectionList[s], zoom: 10 }, {
      duration: 500,
      easing: 'out'
    })
  },
  changeDatetime: async (start, end, today, tomorrow) => {
    startDate = today
    endDate = tomorrow

    const data = await doubtApi.getData(start, end)
    const targetData = Array.isArray(data) ? data : (data?.data || [])

    // 💡 1. 노이즈 데이터 필터링: 선박명(shipname)이나 국가(flagcountry) 정보가 없는 데이터 제외
    const validData = targetData.filter(item => {
      // 속성 이름은 실제 API 응답 구조에 맞게 유동적으로 체크 (shipname, ship_name 등)
      const name = item.shipname || item.ship_name || item.name || ''
      const flag = item.flagcountry || item.flag_country || ''
      // 이름과 국가 정보가 모두 존재하는 데이터만 통과
      return name.trim() !== '' && flag.trim() !== ''
    })

    // 💡 2. MMSI를 기준으로 중복 선박 제거 (필터링된 validData 사용)
    const uniqueData = Array.from(new Map(validData.map(item => [item.mmsi, item])).values())

    vesselList.value = [...uniqueData]
    vesselList.value.sort((a, b) => {
      const aIncludes = a.flagcountry?.includes('Korea')
      const bIncludes = b.flagcountry?.includes('Korea')
      if (aIncludes && !bIncludes) return -1
      else if (!aIncludes && bIncludes) return 1
      else return 0
    })
    setTimeout(() => {
      // 지도상에는 모든 궤적이 필요하므로 원본 data를 넘겨줌 (또는 취향에 따라 validData를 넘겨도 됨)
      vessel.changeDateTime(data)
      emit('data:load')
    }, 100)
  },
  showList: () => {
    showVesselList.value = true
  },
  changeTrenchmap: (t) => {
    trenchmap.change(t)
  },
  changeDistrictmapConfig: (e) => {
    districtmap.change(e)
  },
  onSelectAllDistrict: () => {
    districtmap.selectAll()
  },
  onUnselectAllDistrict: () => {
    districtmap.unselectAll()
  },
  displayImg: (info, type) => {
    img.draw(info, type)
  },
  changeFilter: (f) => {
    vessel.filter(f)
  },
  highlight: (id) => {
    vessel.highlight(id)
  },
  normalize: (id) => {
    vessel.normalize(id)
    trajectory.hide()
  },
  showTrajectory: async (mmsi) => {
    // 0226 까지만 데이터 있음
    const data = await doubtApi.getTrajectory(mmsi, startDate.slice(0, 8) + '000000', endDate.slice(0, 8) + '000000')
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: data.map(d => [d.longitude, d.latitude])
      }
    }
    trajectory.load(geojson)
    emit('data:load')
  },
  hideTrajectory: () => {
    trajectory.hide()
  },
  startDraw: () => {
    drawLayer.clear()
    drawTool.enable()
  },
  stopDraw: () => {
    drawTool.disable()
  }
})
</script>

<style scoped>
.main-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
}

.map {
  width: 100%;
  height: 100%;
}

/* 동그란 토글 버튼 스타일 */
.vessel-list-toggle {
  position: absolute;
  top: 60px;
  right: 30px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #222222;
  border: 1px solid #656565;
  color: #828282;
  z-index: 1000;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.vessel-list-toggle:hover,
.vessel-list-toggle.active {
  background-color: #757575;
  color: #ffffff;
  border-color: #ffffff;
}

/* 💡 추가: 선박 아이콘 스타일 */
.vessel-icon {
  width: 22px !important;
  height: 22px !important;
  max-width: 100%;
  object-fit: contain;
  display: block;
}

/* 💡 추가: 글씨 박스 스타일 및 애니메이션 */
.vessel-list-text {
  position: absolute;
  top: 50%;
  right: 55px; /* 버튼 왼쪽에 위치 */
  transform: translateY(-50%) translateX(10px); /* 초기 위치: 오른쪽으로 살짝 밀어둠 */
  opacity: 0; /* 초기 상태: 투명 */
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap; /* 줄바꿈 방지 */
  transition: opacity 0.3s ease, transform 0.3s ease; /* 애니메이션 효과 설정 */
  pointer-events: none; /* 텍스트 박스가 마우스 이벤트를 방해하지 않도록 설정 */
}

/* 💡 추가: 호버 시 글씨 박스 애니메이션 */
.vessel-list-toggle:hover .vessel-list-text {
  opacity: 1; /* 투명도 원상복구 */
  transform: translateY(-50%) translateX(0); /* 제자리로 이동 */
}

/* 선박 리스트가 토글 버튼 아래에 뜨도록 감싸는 래퍼 */
.vessel-list-wrapper {
  position: absolute;
  top: 115px;
  right: 30px;
  z-index: 1000;
}

/* 기존 VesselList 컴포넌트 내부에 left, bottom 속성이 하드코딩 되어 있을 경우를 대비해,
  최상단 엘리먼트의 위치를 relative로 강제 초기화하여 wrapper의 위치에 맞춥니다.
*/
.vessel-list-wrapper :deep(> *) {
  position: relative !important;
  inset: auto !important;
  margin: 0 !important;
}
</style>

<style>
.map img {
  filter: grayscale(100%) invert(100%) !important;
}
.pointer-cursor {
  cursor: pointer;
}
</style>
