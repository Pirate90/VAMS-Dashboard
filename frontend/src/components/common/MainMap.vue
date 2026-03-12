<template>
  <div class="main-map-container">
    <div id="map" class="map"></div>
    <MapContextMenu
      v-bind="contextMenu"
      @close="closeContextMenu"
      @select="onClickContextMenuItem"
      @stats="onStatsClick"
    />
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
import { onMounted, defineExpose, defineEmits, ref, markRaw } from 'vue'
import initMap from '@/util/maptalks/map'
import Vessel from '@/util/maptalks/vessel'
import Trenchmap from '@/util/maptalks/trenchmap'
import Districtmap from '@/util/maptalks/districtmap'
import Trajectory from '@/util/maptalks/trajectory'
import Img from '@/util/maptalks/img'
import VesselList from '@/components/common/VesselList'
import VesselSearch from '@/components/common/VesselSearch'
import MapContextMenu from '@/components/common/MapContextMenu'
import * as maptalks from 'maptalks'
import { vesselApi, servicesApi } from '@/apis'

const emit = defineEmits(['info:show', 'data:load', 'draw:completed', 'popup:open'])

let map = null
let img = null
let trenchmap = null
let districtmap = null
let vessel = null
let trajectory
let drawTool = null
let drawLayer = null
let animationId = null

// 💡 날짜 및 캐싱 관련 상태 변수
let startDate = null
let endDate = null
let currentStart = null
let currentEnd = null
let allVesselData = []

// 💡 [핵심 1] 현재 툴바에서 선택된 필터 상태를 기억하는 변수 추가
let activeFilters = ['normal', 'loitering', 'transshipment', 'illegal', 'delayed']

const vesselList = ref([])
const showVesselList = ref(false)
const showVesselSearch = ref(false)
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  coord: [0, 0],
  items: []
})

const closeContextMenu = () => { contextMenu.value.show = false }

let blinkInterval = null
let currentBlinkingGeom = null
let originalSymbolCache = null

const clearBlink = () => {
  if (blinkInterval) {
    clearInterval(blinkInterval)
    blinkInterval = null
  }
  if (currentBlinkingGeom && originalSymbolCache) {
    currentBlinkingGeom.setSymbol(originalSymbolCache)
  }
  currentBlinkingGeom = null
  originalSymbolCache = null
}

const onClickContextMenuItem = (item) => {
  clearBlink()

  if (!item.geometry) return

  currentBlinkingGeom = item.geometry
  originalSymbolCache = currentBlinkingGeom.getSymbol() || {}

  let count = 0
  const maxFlashes = 6

  blinkInterval = setInterval(() => {
    if (count >= maxFlashes) {
      clearBlink()
      return
    }

    if (count % 2 === 0) {
      currentBlinkingGeom.setSymbol({
        polygonFill: '#F3463D',
        polygonOpacity: 0.6,
        lineWidth: 3,
        lineColor: '#FFFFFF'
      })
    } else {
      currentBlinkingGeom.setSymbol(originalSymbolCache)
    }
    count++
  }, 300)
}

const onStatsClick = (data) => {
  const { period, item } = data
  console.log(`[통계 팝업 요청] 기간: ${period}, 구역:`, item)

  // 부모 컴포넌트로 데이터 그대로 전달
  emit('stats:open', data)
}

// 💡 화면 밖 선박 렌더링 최적화
const updateVisibleVessels = () => {
  if (!map || !vessel) return

  // 💡 [핵심 2] 데이터가 아예 없을 때(모든 필터 해제 시) 지도를 깨끗하게 비우도록 처리
  if (allVesselData.length === 0) {
    vessel.changeDateTime([])
    return
  }

  const ext = map.getExtent()
  const xBuffer = (ext.xmax - ext.xmin) * 0.2
  const yBuffer = (ext.ymax - ext.ymin) * 0.2

  const minX = ext.xmin - xBuffer
  const maxX = ext.xmax + xBuffer
  const minY = ext.ymin - yBuffer
  const maxY = ext.ymax + yBuffer

  const visibleData = allVesselData.filter(item => {
    const lon = item.longitude || item.lon
    const lat = item.latitude || item.lat
    if (!lon || !lat) return false
    return lon >= minX && lon <= maxX && lat >= minY && lat <= maxY
  })

  vessel.changeDateTime(visibleData)
}

let cachedVessels = {
  normal: null,
  loitering: null,
  transshipment: null,
  illegal: null,
  delayed: null
}

const fetchVesselsByCategory = async (category, start, end) => {
  try {
    switch (category) {
      case 'normal': return await vesselApi.getData(start, end)
      case 'loitering': return await servicesApi['01-lvd'].getLvdData(start, end)
      case 'transshipment': return await servicesApi['02-tvd'].getTvdData(start, end)
      case 'illegal': return await servicesApi['05-fpi'].getFpiData(start, end)
      case 'delayed': return await servicesApi['08-lavt'].getLavtData(start, end)
      default: return []
    }
  } catch (err) {
    console.error(`[${category}] 데이터 조회 실패:`, err)
    return []
  }
}

const loadFilteredData = async (filters) => {
  if (!currentStart || !currentEnd) return

  let combinedData = []

  for (const filter of filters) {
    if (!cachedVessels[filter]) {
      const res = await fetchVesselsByCategory(filter, currentStart, currentEnd)

      // 💡 디버깅 1: 백엔드에서 데이터가 제대로 도착했는지 원본 확인!
      console.log(`👀 [${filter}] API 원본 응답:`, res)

      const targetData = Array.isArray(res) ? res : (res?.data || res?.result || [])

      // 💡 디버깅 2: 프론트에서 배열 형태로 잘 추출했는지 확인!
      console.log(`📦 [${filter}] 배열 추출 후 (targetData):`, targetData)

      const validData = targetData.filter(item => {
        // 💡 안전장치: 혹시라도 shipname이 숫자이거나 undefined일 때 trim() 에러 방지
        const name = String(item.shipname || item.ship_name || item.name || '')
        const flag = String(item.flagcountry || item.flag_country || '')

        const isValid = name.trim() !== '' && flag.trim() !== ''

        // 데이터가 누락되어 버려지는 경우 원인 파악용 로그
        if (!isValid && targetData.length > 0) {
          console.warn(`🗑️ [${filter}] 필터링 탈락 데이터: name=${name}, flag=${flag}`)
        }

        return isValid
      })

      // 💡 디버깅 3: 국적/이름 필터링을 무사히 통과했는지 확인!
      console.log(`🎯 [${filter}] 노이즈 필터 통과 후 (validData):`, validData)

      const uniqueData = Array.from(new Map(validData.map(item => [item.mmsi, item])).values())

      uniqueData.forEach(v => { v.vesselCategory = filter })
      cachedVessels[filter] = uniqueData
    }

    combinedData = [...combinedData, ...cachedVessels[filter]]
  }

  vesselList.value = [...combinedData]
  vesselList.value.sort((a, b) => {
    const aIncludes = a.flagcountry?.includes('Korea')
    const bIncludes = b.flagcountry?.includes('Korea')
    if (aIncludes && !bIncludes) return -1
    else if (!aIncludes && bIncludes) return 1
    else return 0
  })

  allVesselData = combinedData
  console.log('✅ 최종 화면 표출용 합산 데이터 (allVesselData):', allVesselData)

  updateVisibleVessels()
}

onMounted(async () => {
  map = initMap()

  vessel = Vessel(map, onClickVessel)
  trajectory = Trajectory(map)
  img = Img(map)

  trenchmap = await Trenchmap(map)
  districtmap = await Districtmap(map)
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
    drawLayer.clear().addGeometry(geometry)
    const coords = geometry.getCoordinates()
    emit('draw:completed', coords)
    drawTool.disable()
  })

  map.on('contextmenu', (e) => {
    if (e.domEvent) e.domEvent.preventDefault()
    clearBlink()

    contextMenu.value.x = e.containerPoint.x
    contextMenu.value.y = e.containerPoint.y
    contextMenu.value.coord = [e.coordinate.x, e.coordinate.y]
    contextMenu.value.items = []

    const layers = map.getLayers()
    layers.forEach(layer => {
      if (layer instanceof maptalks.VectorLayer) {
        const hits = layer.identify(e.coordinate)

        hits.forEach(geometry => {
          const props = geometry.getProperties()
          if (!props) return

          const toInt = (val) => val !== undefined && val !== null ? Math.floor(Number(val)) : null
          const geomRaw = markRaw(geometry)

          if (props.HAEGU_NO !== undefined && props.HAEGU_NO !== null) {
            const haeguNo = toInt(props.HAEGU_NO)
            if (props.SUB_NO !== undefined && props.SUB_NO !== null) {
              const subNo = toInt(props.SUB_NO)
              contextMenu.value.items.push({
                type: 'trench-sm',
                typeLabel: '소해구',
                value: `${haeguNo}-${subNo} 해구`,
                geometry: geomRaw
              })
            } else {
              contextMenu.value.items.push({
                type: 'trench-lg',
                typeLabel: '대해구',
                value: `${haeguNo} 해구`,
                geometry: geomRaw
              })
            }
          }

          if (props.NAME !== undefined && props.NAME !== null) {
            const nameStr = String(props.NAME)
            if (nameStr.includes('해양경찰서')) {
              contextMenu.value.items.push({
                type: 'coastguard',
                typeLabel: '관할구역',
                value: nameStr,
                geometry: geomRaw
              })
            } else {
              if (isNaN(Number(nameStr))) {
                contextMenu.value.items.push({
                  type: 'district',
                  typeLabel: '구역도',
                  value: nameStr,
                  geometry: geomRaw
                })
              }
            }
          }
        })
      }
    })

    const uniqueItems = Array.from(new Map(contextMenu.value.items.map(item => [item.value, item])).values())
    contextMenu.value.items = uniqueItems
    contextMenu.value.show = true
  })

  map.on('mousedown movestart zoomstart', () => {
    closeContextMenu()
    clearBlink()
  })

  map.on('moveend zoomend', () => {
    updateVisibleVessels()
  })
})

function onClickVessel ({ coord, elements, isChild }) {
  map.animateTo({ zoom: 10, center: [coord.x, coord.y] }, {
    duration: 500,
    easing: 'out'
  })
  emit('info:show', elements, isChild)
}

function showVesselMarker (vesselData) {
  if (vesselData && vesselData.longitude && vesselData.latitude) {
    map.animateTo({
      zoom: 10,
      center: [vesselData.longitude, vesselData.latitude]
    }, {
      duration: 500,
      easing: 'out'
    })
  }
  emit('info:show', vesselData)
}

function hideVesselMarker () {
  // 마커 숨김 로직
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
    currentStart = start
    currentEnd = end

    cachedVessels = {
      normal: null,
      loitering: null,
      transshipment: null,
      illegal: null,
      delayed: null
    }

    // 💡 [핵심 3] 타임슬라이더가 돌아갈 때 무조건 5개를 부르는 게 아니라, 현재 툴바의 상태(activeFilters)만 호출합니다!
    await loadFilteredData(activeFilters)

    emit('data:load')
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

  changeFilter: async (filters) => {
    // 💡 [핵심 4] 툴바에서 체크박스를 변경하면 그 상태를 저장합니다!
    activeFilters = filters
    await loadFilteredData(activeFilters)
  },

  highlight: (id) => {
    vessel.highlight(id)
  },
  normalize: (id) => {
    vessel.normalize(id)
    trajectory.hide()
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    drawLayer.clear()
  },
  showTrajectory: async (mmsi) => {
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
  showPredictedTrajectory: (predictData) => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }

    const { input, predicted } = predictData
    const geometries = []
    let lastInputCoord = null

    if (input && input.length > 0) {
      const inputCoords = input.map(d => [d[1], d[0]])
      lastInputCoord = inputCoords[inputCoords.length - 1]
      const inputLine = new maptalks.LineString(inputCoords, {
        symbol: { lineColor: '#275FCE', lineWidth: 4 }
      })
      geometries.push(inputLine)
    }

    let predictedCoords = []
    if (predicted && predicted.length > 0) {
      predictedCoords = predicted.map(d => [d[1], d[0]])
      if (lastInputCoord) {
        predictedCoords.unshift(lastInputCoord)
      }
      const predictedLine = new maptalks.LineString(predictedCoords, {
        symbol: { lineColor: '#F3463D', lineWidth: 4, lineDasharray: [10, 6] }
      })
      geometries.push(predictedLine)
    }

    if (geometries.length === 0) return

    let movingMarker = null
    if (predictedCoords.length > 1) {
      movingMarker = new maptalks.Marker(predictedCoords[0], {
        symbol: {
          markerType: 'triangle',
          markerFill: '#F3463D',
          markerLineColor: '#ffffff',
          markerLineWidth: 2,
          markerWidth: 14,
          markerHeight: 20,
          markerRotation: 0
        }
      })
      geometries.push(movingMarker)
    }

    drawLayer.clear().addGeometry(geometries)

    const centerCoord = lastInputCoord || (predictedCoords.length > 0 ? predictedCoords[0] : null)
    if (centerCoord) {
      map.animateTo({ center: centerCoord, zoom: 11 }, { duration: 500, easing: 'out' })
    }

    if (movingMarker && predictedCoords.length > 1) {
      let currentIndex = 0
      let animStartTime = null
      const durationPerSegment = 800

      function animateShip (timestamp) {
        if (!animStartTime) animStartTime = timestamp
        const elapsed = timestamp - animStartTime
        let progress = elapsed / durationPerSegment

        if (progress >= 1) {
          progress = 0
          animStartTime = timestamp
          currentIndex++
          if (currentIndex >= predictedCoords.length - 1) {
            currentIndex = 0
          }
        }

        const p1 = predictedCoords[currentIndex]
        const p2 = predictedCoords[currentIndex + 1]
        const lon = p1[0] + (p2[0] - p1[0]) * progress
        const lat = p1[1] + (p2[1] - p1[1]) * progress
        movingMarker.setCoordinates([lon, lat])

        const sp1 = map.coordinateToContainerPoint(new maptalks.Coordinate(p1[0], p1[1]))
        const sp2 = map.coordinateToContainerPoint(new maptalks.Coordinate(p2[0], p2[1]))
        const dx = sp2.x - sp1.x
        const dy = sp2.y - sp1.y
        const segmentAngle = Math.atan2(dy, dx) * (90 / Math.PI)

        movingMarker.updateSymbol({ markerRotation: segmentAngle })
        animationId = requestAnimationFrame(animateShip)
      }

      animationId = requestAnimationFrame(animateShip)
    }
  },
  startDraw: () => {
    drawLayer.clear()
    drawTool.enable()
  },
  stopDraw: () => {
    drawTool.disable()
  },
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
.btn-list { top: 60px; }
.btn-search { top: 115px; }
.tool-icon {
  width: 22px !important;
  height: 22px !important;
  max-width: 100%;
  object-fit: contain;
  display: block;
}
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
.popup-wrapper {
  position: absolute;
  right: 85px;
  z-index: 1000;
}
.wrapper-list { top: 60px; }
.wrapper-search { top: 115px; }
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
