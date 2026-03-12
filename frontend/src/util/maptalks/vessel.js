import { Marker, VectorLayer } from 'maptalks'

// 💡 5가지 새로운 카테고리에 맞춘 마커 색상 정의
const categoryColors = {
  normal: '#42a7ff', // 파란색 (정상)
  loitering: '#f6ff42', // 노란색 (배회)
  transshipment: '#ff9900', // 주황색 (환적)
  illegal: '#ff5542', // 빨간색 (불법)
  delayed: '#999999' // 회색 (지연)
}

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
  let selectedMarker = null

  function onMarkerClick ({ coordinate, target }) {
    if (target.getId() !== selectedMarker && selectedMarker) {
      const geo = layer.getGeometryById(selectedMarker)
      if (geo) normalizeMarker(geo)
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
      if (marker) highlightMarker(marker)
    },
    normalize: (id) => {
      selectedMarker = null
      const marker = layer.getGeometryById(id)
      if (marker) normalizeMarker(marker)
    },
    filter: () => {
      // deprecated (MainMap의 캐싱 필터링 로직으로 대체됨)
    },
    changeDateTime: (d) => {
      layer.clear()

      const uniqueData = Array.from(new Map(d.map(item => [item.mmsi || item.vesselid, item])).values())

      // 💡 배열에 저장할 필요가 없으므로 map 대신 forEach를 사용하여 메모리를 절약합니다.
      uniqueData.forEach(md => {
        const color = categoryColors[md.vesselCategory] || categoryColors.normal

        const marker = new Marker([md.longitude, md.latitude], {
          id: md.mmsi || md.vesselid,
          properties: md,
          symbol: {
            markerType: 'pie',
            markerFill: color,
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
            // cog 값이 없는 경우 방어 코드 추가
            markerRotation: 180 - (md.cog || 0)
          }
        }).addTo(layer)

        marker.on('click', onMarkerClick)
        marker.on('mouseenter', onMarkerMouseEnter)
        marker.on('mouseout', onMarkerMouseOut)

        marker.show()
      })
    }
  }
}
