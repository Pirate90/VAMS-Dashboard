import { Map, TileLayer, ui } from 'maptalks'

export default function initMap () {
  const map = new Map('map', {
    center: [127.4, 36.1],
    zoom: 7,
    baseLayer: new TileLayer('base', {
      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      // cssFilter: 'grayscale(100%) invert(100%)'
    }),
    maxZoom: 20
  })

  const tooltip = new ui.ToolTip('test', {
    dx: 20,
    dy: 20
  })
  tooltip.addTo(map)

  map.on('mousemove', (e) => {
    const coord = e.coordinate
    const lngLat = `${coord.x.toFixed(5)}, ${coord.y.toFixed(5)}`

    tooltip._content = lngLat
    tooltip.show(e.coordinate)
  })

  return map
}
