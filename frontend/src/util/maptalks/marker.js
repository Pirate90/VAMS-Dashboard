import { Marker, VectorLayer } from 'maptalks'

export default function VesselMarker (map) {
  const layer = new VectorLayer('marker-layer').addTo(map)

  return {
    show: (props) => {
      layer.clear()
      const marker = new Marker([props.longitude, props.latitude], {
        id: props.vesselid,
        properties: props,
        symbol: {
          // markerType: 'triangle',
          markerType: 'pie',
          markerFill: '#42a7ff',
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
          markerRotation: 180 - props.cog
        }
      })
      marker.addTo(layer)
    },
    hide: () => {
      layer.clear()
    }
  }
}
