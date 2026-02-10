import { HeatLayer } from 'maptalks.heatmap'

export default function Heatmap (map) {
  const layer = new HeatLayer('heat', [], {
    radius: 11,
    blur: 20,
    opacity: 0.8
  })

  layer.addTo(map)

  return {
    changeData: (d) => {
      layer.clear()
      const heatData = d.map(hd => {
        return [hd.longitude, hd.latitude, hd.fnf_confidence]
      })

      layer.setData(heatData)
    },
    changeConfig: (key, value) => {
      layer.config(key, value * 1)
      if (key === 'opacity') layer.redraw()
    }
  }
}
