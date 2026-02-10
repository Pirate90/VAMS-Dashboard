import { Map, View } from 'ol'
import { Zoom } from 'ol/control'
import { Tile as TileLayer } from 'ol/layer'
import { OSM, XYZ } from 'ol/source'
import { transform, transformExtent } from 'ol/proj'

const tile = new TileLayer({ source: new OSM() })
tile.on('prerender', (evt) => {
  if (evt.context) {
    const context = evt.context
    context.filter = 'grayscale(100%) invert(100%) contrast(100%)'
    context.globalCompositeOperation = 'source-over'
  }
})

tile.on('postrender', (evt) => {
  if (evt.context) {
    const context = evt.context
    context.filter = 'none'
  }
})

export default function initMap () {
  const map = new Map({
    target: 'map',
    layers: [tile],
    view: new View({
      center: transform([127.4, 36.1], 'EPSG:4326', 'EPSG:3857'),
      zoom: 7,
      maxZoom: 20,
      extent: transformExtent([115, 25, 140, 45], 'EPSG:4326', 'EPSG:3857')
    })
  })

  map.addLayer(new TileLayer({
    extent: transformExtent([127.9570494235744, 34.51262151047193, 128.323360579194, 34.7647814887019], 'EPSG:4326', 'EPSG:3857'),
    source: new XYZ({ url: '/tiles/{z}/{x}/{-y}.png' })
  }))

  map.getControls().forEach((c) => {
    if (c instanceof Zoom) {
      map.removeControl(c)
    }
  }, this)

  return map
}
