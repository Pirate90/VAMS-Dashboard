import { Marker, VectorLayer } from 'maptalks'

const status = ['#42a7ff', '#f6ff42', '#ff5542', '#3bcc62']
const statusName = ['normal', 'doubt', 'illegal', 'loitering']

function highlightMarker (marker) {
  const symbol = marker.getSymbol()
  symbol.markerWidth = 20
  symbol.markerHeight = 40
  symbol.markerDy = 20
  marker.setSymbol(symbol)
  marker.bringToFront()
}

function normalizeMarker (marker) {
  const symbol = marker.getSymbol()
  symbol.markerWidth = 10
  symbol.markerHeight = 20
  symbol.markerDy = 10
  marker.setSymbol(symbol)
  marker.bringToBack()
}

export default function Vessel (map, callback) {
  const layer = new VectorLayer('vessel-layer').addTo(map)
  let markers = null
  let selectedMarker = null
  let currentFilter = []

  function onMarkerClick ({ coordinate, target }) {
    if (target.getId() !== selectedMarker && selectedMarker) {
      const geo = layer.getGeometryById(selectedMarker)
      normalizeMarker(geo)
    }
    selectedMarker = target.getId()

    // eslint-disable-next-line
    callback({ coord: coordinate, elements: target.getProperties() })
  }

  function onMarkerMouseEnter ({ target }) {
    highlightMarker(target)
  }

  function onMarkerMouseOut ({ target }) {
    if (selectedMarker === target.getId()) return

    normalizeMarker(target)
  }

  return {
    highlight: (id) => {
      const marker = layer.getGeometryById(id)
      highlightMarker(marker)
    },
    normalize: (id) => {
      selectedMarker = null
      const marker = layer.getGeometryById(id)
      normalizeMarker(marker)
    },
    filter: (f) => {
      currentFilter = f
      markers.forEach(m => {
        const props = m.getProperties()
        const statusIndex = props.fnf_bool ? 1 : 0
        if (f.includes(statusName[statusIndex])) {
          m.show()
        } else {
          m.hide()
        }
      })
    },
    changeDateTime: (d) => {
      layer.clear()
      const uniqueData = Array.from(new Map(d.map(item => [item.vesselid, item])).values())
      markers = uniqueData.map(md => {
        // 1. Boolean 값을 숫자로 변환 (false -> 0, true -> 1)
        const statusIndex = md.fnf_bool ? 1 : 0
        if (!md.fnf_bool) console.log('False value data:', md)
        const marker = new Marker([md.longitude, md.latitude], {
          id: md.vesselid,
          properties: md,
          symbol: {
            markerType: 'pie',
            markerFill: status[statusIndex],
            markerFillOpacity: 1,
            markerLineColor: '#000000',
            markerLineWidth: 1,
            markerLineOpacity: 1,
            markerLineDasharray: [],
            markerWidth: 10,
            markerHeight: 20,
            markerDx: 0,
            markerDy: 10,
            markerOpacity: 1,
            markerRotation: 180 - md.cog
          }
        }).addTo(layer)
        // 2. 이벤트 등록 조건 수정 (md.fnf_bool이 불리언이므로 직접 비교)
        // 기존의 '3'(문자열/숫자) 체크는 불리언 환경에선 불필요하므로 생략하거나 목적에 맞게 수정
        marker.on('click', onMarkerClick)
        marker.on('mouseenter', onMarkerMouseEnter)
        marker.on('mouseout', onMarkerMouseOut)

        // 3. 필터링 로직 수정
        if (currentFilter.length) {
          // currentFilter 배열 내에 해당 상태 이름이 있는지 확인
          if (currentFilter.includes(statusName[statusIndex])) {
            marker.show()
          } else {
            marker.hide()
          }
        } else {
          // 필터가 없을 때의 기본 동작 (예: false인 경우 숨김)
          if (!md.fnf_bool) {
            marker.hide()
          } else {
            marker.show()
          }
        }
        return marker
      })
    }
  }
}
