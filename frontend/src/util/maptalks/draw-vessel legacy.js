import { Marker, VectorLayer } from 'maptalks'
import { ClusterLayer } from 'maptalks.markercluster'

const status = {
  normal: '#42a7ff',
  doubt: '#f6ff42',
  illegal: '#ff5542'
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

export default function Vessel (map, data, callback) {
  const layer = new VectorLayer('vessel-layer').addTo(map)
  let selectedMarker = null

  function onMarkerClick ({ coordinate, target, isChild }) {
    if (target.getId() !== selectedMarker && selectedMarker) {
      const geo = layer.getGeometryById(selectedMarker)
      normalizeMarker(geo)
    }
    selectedMarker = target.getId()

    // eslint-disable-next-line
    callback({ coord: coordinate, elements: [target.getProperties()], isChild })
  }

  function onMarkerMouseEnter ({ target }) {
    highlightMarker(target)
  }

  function onMarkerMouseOut ({ target }) {
    if (selectedMarker === target.getId()) return

    normalizeMarker(target)
  }

  const markers = data.map(d => {
    const marker = new Marker([d.longitude, d.latitude], {
      id: d.vesselid,
      properties: d,
      symbol: {
        // markerType: 'triangle',
        markerType: 'pie',
        markerFill: status[d.illegalStatus],
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
        // markerRotation: -d.cog
        markerRotation: 180 - d.cog
      }
    })
    // .addTo(layer)

    marker.on('click', onMarkerClick)
    marker.on('mouseenter', onMarkerMouseEnter)
    marker.on('mouseout', onMarkerMouseOut)

    return marker
  })

  const cluster = new ClusterLayer('cluster', markers, {
    maxClusterZoom: 18,
    symbol: {
      markerType: 'ellipse',
      markerFill: { property: 'count', type: 'interval', stops: [[0, 'rgb(135, 196, 240)'], [9, '#1bbc9b'], [99, 'rgb(216, 115, 149)']] },
      markerFillOpacity: 0.7,
      markerLineOpacity: 1,
      markerLineWidth: 3,
      markerLineColor: '#fff',
      markerWidth: { property: 'count', type: 'interval', stops: [[0, 40], [9, 60], [99, 80]] },
      markerHeight: { property: 'count', type: 'interval', stops: [[0, 40], [9, 60], [99, 80]] }
    },
    geometryEventTolerance: false
  })

  map.on('click', e => {
    const mIdentify = layer.identify(e.coordinate)
    const cIdentify = cluster.identify(e.coordinate)

    if (mIdentify.length) return

    layer.clear()

    if (cIdentify.children && cluster.isVisible()) {
      cluster.hide()
      cIdentify.children.forEach(c => {
        const cMarker = c.copy()

        cMarker.on('click', ({ target }) => onMarkerClick({ target, isChild: true }))
        cMarker.on('mouseenter', onMarkerMouseEnter)
        cMarker.on('mouseout', onMarkerMouseOut)

        cMarker.addTo(layer)
      })
      // eslint-disable-next-line
      callback({ coord: cIdentify.center, elements: cIdentify.children.map(c => c.getProperties()) })
    } else {
      cluster.show()
    }
  })

  cluster.addTo(map)

  map.on('zoomstart', () => {
    layer.clear()
    cluster.show()
    selectedMarker = null
  })

  return {
    hideClusterDetail: () => {
      layer.clear()
      cluster.show()

      const currentMarker = cluster.getGeometryById(selectedMarker)
      if (currentMarker) {
        normalizeMarker(currentMarker)
      }

      selectedMarker = null
    },
    highlight: (id) => {
      const marker = layer.getGeometryById(id)
      highlightMarker(marker)
    },
    normalize: (id) => {
      const marker = layer.getGeometryById(id)
      normalizeMarker(marker)
    }
  }
}
