<template>
  <div class="main-map-container">
    <div id="map" class="map"></div>
    <button class="side-toggle-btn btn-list" :class="{ active: showVesselList }" @click="toggleVesselList">
      <img src="@/assets/ship-icon.png" alt="ship" class="tool-icon" />
      <span class="hover-text">선박 목록</span>
    </button>
    <button class="side-toggle-btn btn-search" :class="{ active: showVesselSearch }" @click="toggleVesselSearch">
      <img src="@/assets/search-white.png" alt="search" class="tool-icon" />
      <span class="hover-text">선박 조회</span>
    </button>
    <div class="popup-wrapper wrapper-list" v-if="showVesselList">
      <VesselList :show="showVesselList" :list="vesselList"
        @list:close="closeVesselList"
        @info:show="showVesselMarker"
        @info:hide="hideVesselMarker"
        @info:trajectory="showTrajectory"
      ></VesselList>
    </div>
    <div class="popup-wrapper wrapper-search" v-if="showVesselSearch">
      <VesselSearch :show="showVesselSearch" @search:close="showVesselSearch = false" />
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
import VesselList from '@/components/common/VesselList'
import VesselSearch from '@/components/common/VesselSearch'
import * as maptalks from 'maptalks'
import { vesselApi } from '@/apis'

const emit = defineEmits(['info:show', 'data:load', 'draw:completed', 'popup:open'])

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
const showVesselSearch = ref(false)

onMounted(async () => {
  map = initMap()
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
  if (showVesselList.value) {
    showVesselSearch.value = false
    emit('popup:open')
  }
}

function toggleVesselSearch () {
  showVesselSearch.value = !showVesselSearch.value
  if (showVesselSearch.value) {
    showVesselList.value = false
    emit('popup:open')
  }
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

    const data = await vesselApi.getData(start, end)
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
    const data = await vesselApi.getTrajectory(mmsi, startDate.slice(0, 8) + '000000', endDate.slice(0, 8) + '000000')
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
  // AI 예상 궤적을 맵에 그리는 함수
  showPredictedTrajectory: (predictData) => {
    // VesselInformation에서 넘겨준 두 개의 배열을 받습니다
    const { input, predicted } = predictData
    const geometries = [] // 맵에 그릴 도형들을 담을 배열
    // 1. 과거(입력) 궤적 그리기 (파란색 실선)
    if (input && input.length > 0) {
      // [Lat, Lon] -> GeoJSON 스펙인 [Lon, Lat] 변환
      const inputCoords = input.map(d => [d[1], d[0]])
      const inputLine = new maptalks.LineString(inputCoords, {
        symbol: {
          lineColor: '#275FCE', // 파란색 계열
          lineWidth: 4
          // 실선이므로 lineDasharray는 생략
        }
      })
      geometries.push(inputLine)
    }
    // 2. 미래(예측) 궤적 그리기 (빨간색 점선)
    if (predicted && predicted.length > 0) {
      // [Lat, Lon] -> [Lon, Lat] 변환
      const predictedCoords = predicted.map(d => [d[1], d[0]])
      const predictedLine = new maptalks.LineString(predictedCoords, {
        symbol: {
          lineColor: '#F3463D', // 붉은색 계열
          lineWidth: 4,
          lineDasharray: [10, 6] // 점선 효과
        }
      })
      geometries.push(predictedLine)
    }
    // 그릴 데이터가 아예 없다면 종료
    if (geometries.length === 0) return
    // 3. 기존 레이어를 비우고 과거 실선과 미래 점선 2개를 한 번에 올림
    drawLayer.clear().addGeometry(geometries)
    // 4. 카메라 시점 이동 (미래 예측의 첫 번째 지점을 중심으로 잡음)
    const centerCoord = predicted && predicted.length > 0
      ? [predicted[0][1], predicted[0][0]]
      : [input[input.length - 1][1], input[input.length - 1][0]]
    map.animateTo({ center: centerCoord, zoom: 11 }, { duration: 500, easing: 'out' })
  },
  startDraw: () => {
    drawLayer.clear()
    drawTool.enable()
  },
  stopDraw: () => {
    drawTool.disable()
  },
  // 💡 아래 closePopups 함수를 맨 끝에 추가
  closePopups: () => {
    showVesselList.value = false
    showVesselSearch.value = false
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

/* 💡 통합된 우측 사이드 토글 버튼 스타일 */
.side-toggle-btn {
  position: absolute;
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
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.side-toggle-btn:hover,
.side-toggle-btn.active {
  background-color: #757575;
  color: #ffffff;
  border-color: #ffffff;
}

/* 각각의 위치 지정 */
.btn-list { top: 60px; }
.btn-search { top: 115px; }

/* 💡 내부 아이콘 스타일 제한 */
.tool-icon {
  width: 22px !important;
  height: 22px !important;
  max-width: 100%;
  object-fit: contain;
  display: block;
}

/* 💡 호버 글씨 박스 애니메이션 */
.hover-text {
  position: absolute;
  top: 50%;
  right: 55px;
  transform: translateY(-50%) translateX(10px);
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.side-toggle-btn:hover .hover-text {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

/* 💡 팝업 래퍼: 버튼을 가리지 않게 버튼 왼쪽(right: 85px)으로 위치 조정 */
.popup-wrapper {
  position: absolute;
  right: 85px;
  z-index: 1000;
}

.wrapper-list { top: 60px; }
.wrapper-search { top: 115px; }

/* 래퍼 내부 컴포넌트 강제 리셋 */
.popup-wrapper :deep(> *) {
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
