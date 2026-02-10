/* eslint-disable */
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Stroke, Fill, Text } from 'ol/style'
import { GeoJSON } from 'ol/format'

import { Select } from 'ol/interaction'
import { pointerMove } from 'ol/events/condition'

function initPointerMove (map, layer) {
  const select = new Select({
    layers: [layer],
    condition: pointerMove,
    style: f => new Style({
      fill: new Fill({ color: 'rgba(255, 255, 255, 0)' }),
      stroke: new Stroke({ color: 'white' }),
      text: new Text({
        text: `${f.getProperties().HAEGU_NO}`,
        fill: new Fill({ color: '#fff' }),
        // stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.6)', width: 3 })
      })
    })
  })

  map.addInteraction(select)
}

export default function drawTrenchmap (map, t = '대해구도') {
  const trenchmapList = {
    대해구도: 'big',
    소해구도: 'small'
  }
  const source = new VectorSource({
    format: new GeoJSON(),
    url: `/trenchmap/${trenchmapList[t]}.geojson`
  })

  const layer = new VectorLayer({
    source,
    zIndex: 1,
    style: f => new Style({
      fill: new Fill({ color: 'rgba(255, 255, 255, 0)' }),
      stroke: new Stroke({ color: 'rgba(200, 200, 200, 0.1)' })
    }),
    properties: { name: 'trenchmap' }
  })

  initPointerMove(map, layer)
  map.addLayer(layer)
}
