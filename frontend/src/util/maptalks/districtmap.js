import { GeoJSON, VectorLayer, DrawTool, control } from 'maptalks'
import { districtmapApi } from '@/apis'

const hexColor = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF5', '#FFC300', '#DAF7A6', '#900C3F', '#581845', '#C70039', '#900C3F', '#FF5733', '#1A5276', '#229954', '#AF7AC5', '#F39C12', '#2980B9', '#1ABC9C', '#2E4053', '#7D3C98', '#C0392B', '#BDC3C7', '#7F8C8D', '#34495E', '#E74C3C', '#8E44AD', '#2ECC71', '#F1C40F', '#3498DB', '#E67E22', '#16A085', '#D35400', '#AAB7B8', '#ABB2B9', '#E59866', '#F5B041', '#F7DC6F', '#1F618D', '#F0B27A', '#EC7063']

export default async function Districtmap (map, enablePolygon = false, getDataByPolygon) {
  const layer = new VectorLayer('districtmap').addTo(map)
  layer.setOptions({ cursor: 'auto' })

  let districtmapList = []
  const config = localStorage.getItem('districtmapConfig')
  if (config) districtmapList = JSON.parse(config)
  else districtmapList = (await districtmapApi.list()).map(d => ({ name: d, show: true }))

  if (enablePolygon) {
    const drawLayer = new VectorLayer('draw').addTo(map)
    const drawTool = new DrawTool({
      mode: 'Polygon'
    }).addTo(map).disable()

    drawTool.on('drawend', (param) => {
      console.log(param.geometry)
      drawLayer.addGeometry(param.geometry)
      drawTool.disable()
    })

    const itms = ['Polygon', 'Circle', 'Rectangle'].map(v => ({
      item: v,
      click: () => {
        drawLayer.clear()
        drawTool.setMode(v).enable()
      }
    }))

    new control.Toolbar({
      items: [
        ...itms,
        { item: 'Disable', click: () => drawTool.disable() },
        { item: 'Clear', click: () => drawLayer.clear() }
      ]
    }).addTo(map)
  }

  async function draw () {
    const list = districtmapList.map(async (d, i) => {
      const data = await districtmapApi.get(d.name)
      const geometry = GeoJSON.toGeometry(data, g => {
        g.setSymbol({
          lineColor: hexColor[i],
          lineOpacity: 1,
          lineWidth: 1,
          polygonFill: hexColor[i],
          polygonOpacity: 0.7
        })
        g.addTo(layer)
      })

      if (!d.show) geometry.forEach(g => g.hide())

      return { geometry, name: d.name }
    })

    return await Promise.all(list)
  }

  const geometries = await draw()

  return {
    change: ({ name, show }) => {
      const { geometry } = geometries.find(g => g.name === name)

      if (show) geometry.forEach(g => g.show())
      else geometry.forEach(g => g.hide())
    },
    selectAll: () => {
      geometries.forEach(a => {
        a.geometry.forEach(g => g.show())
      })
    },
    unselectAll: () => {
      geometries.forEach(a => {
        a.geometry.forEach(g => g.hide())
      })
    }
  }
}
