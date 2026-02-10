import * as maptalks from 'maptalks'

function extractImageExtent ({
  center_lat: centerLat,
  center_lon: centerLon,
  width,
  height
}) {
  const minLon = centerLon - (width / 2)
  const maxLon = centerLon + (width / 2)
  const minLat = centerLat - (height / 2)
  const maxLat = centerLat + (height / 2)

  return [minLon, minLat, maxLon, maxLat]
}

export default function Img (map) {
  const layer = new maptalks.VectorLayer('bboxLayer')
  layer.addTo(map)

  const imgLayer = new maptalks.ImageLayer('imgLayer')
  imgLayer.addTo(map)

  return {
    draw: (info, type) => {
      layer.clear()
      const shape = maptalks.GeoJSON.toGeometry(info.metadata)
      shape[0].addTo(layer)
      layer.setOpacity(0.5)

      const corners = extractImageExtent(info.metadata.features[0].properties)
      imgLayer.setImages([
        { url: `/tracing/img/${info.name}/${type}.jpg`, extent: corners, opacity: 1 }
      ])

      const { center_lat: centerLat, center_lon: centerLon } = info.metadata.features[0].properties
      map.setCenterAndZoom([centerLon, centerLat], 13)
    }
  }
}
