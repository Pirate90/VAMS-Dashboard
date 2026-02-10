import { TileLayer, Extent } from 'maptalks'

function tile2long (x, z) {
  return (x / Math.pow(2, z) * 360 - 180)
}

function tile2lat (y, z) {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z)
  return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))))
}

function getTileIndex (map, coord, zoom) {
  const worldCoord = map.coordinateToPoint(coord, zoom)
  const tileX = Math.floor(worldCoord.x / 256)
  const tileY = Math.floor(worldCoord.y / 256)
  return { x: tileX, y: tileY }
}

export default function Sar (map) {
  const layer = new TileLayer('SAR', {
    urlTemplate: (x, y, z) => {
      const reversedY = Math.pow(2, z) - 1 - y

      const minLon = tile2long(x, z)
      const maxLon = tile2long(x + 1, z)
      const minLat = tile2lat(y + 1, z)
      const maxLat = tile2lat(y, z)

      const tileExtent = new Extent(minLon, minLat, maxLon, maxLat)
      const extent = new Extent(127.9570494235744, 34.51262151047193, 128.323360579194, 34.7647814887019)

      if (!extent.intersects(tileExtent)) {
        // 타일이 범위를 벗어나면 null을 반환하여 로드하지 않음
        return '/tiles/null'
      }

      return `/tiles/${z}/${x}/${reversedY}.png`
    },
    placeholder: true
  })

  // 맵 클릭 이벤트 핸들러 등록
  map.on('click', function (e) {
    const clickedCoord = e.coordinate
    const zoom = map.getZoom()

    // 클릭한 좌표의 타일 인덱스를 계산
    const tileIndex = getTileIndex(map, clickedCoord, zoom)

    // 타일 클릭 시 사용자 정의 이벤트 발생
    layer.fire('tileClick', {
      coordinate: { x: clickedCoord.x, y: clickedCoord.y },
      tileIndex: tileIndex
    })
  })

  layer.on('tileClick', function (e) {
    // console.log(e.coordinate.x, e.coordinate.y)
    // console.log(this.getTileUrl(e.coordinate.x, e.coordinate.y))
  })
  map.addLayer(layer)
}
