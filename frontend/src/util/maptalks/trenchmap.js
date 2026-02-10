import { GeoJSON, VectorLayer, Label } from 'maptalks'
import { getTrenchmap } from '@/apis'

function onHoverTrenchmap (layer, g) {
  const { HAEGU_NO } = g.getProperties()
  const center = g.getCenter()
  const label = new Label(HAEGU_NO, center, {
    textSymbol: {
      textFaceName: 'Arial',
      textFill: '#555555',
      textSize: 14
    }
  })

  g.on('mouseover', () => {
    label.addTo(layer)
  })

  g.on('mouseout', () => {
    label.remove()
  })
}

export default async function Trenchmap (map) {
  const layer = new VectorLayer('trenchmap').addTo(map)
  layer.setOptions({ cursor: 'auto' })
  let trenchmap = null

  async function draw (type) {
    const data = await getTrenchmap(type)

    const trenchmap = GeoJSON.toGeometry(data, g => {
      onHoverTrenchmap(layer, g)

      g.setSymbol({
        lineColor: '#555555',
        lineOpacity: 0.1,
        lineWidth: 1,
        polygonFill: '#ffffff',
        polygonOpacity: 0.01
      })
      g.addTo(layer)
    })

    return trenchmap
  }

  trenchmap = await draw('big')

  return {
    change: async (type) => {
      if (trenchmap) {
        trenchmap.forEach(t => {
          layer.removeGeometry(t)
        })
        trenchmap = null
      }

      if (type) {
        trenchmap = await draw(type)
      }
    }
  }
}
