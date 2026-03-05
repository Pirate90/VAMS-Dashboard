import { GeoJSON, VectorLayer, DrawTool, control, ui } from 'maptalks' // ui 모듈 추가
import { districtmapApi } from '@/apis'

const hexColor = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF5', '#FFC300', '#DAF7A6', '#900C3F', '#581845', '#C70039', '#1A5276', '#229954', '#AF7AC5', '#F39C12', '#2980B9', '#1ABC9C', '#2E4053', '#7D3C98', '#C0392B', '#BDC3C7', '#7F8C8D', '#34495E', '#E74C3C', '#8E44AD', '#2ECC71', '#F1C40F', '#3498DB', '#E67E22', '#16A085', '#D35400', '#AAB7B8', '#ABB2B9', '#E59866', '#F5B041', '#F7DC6F', '#1F618D', '#F0B27A', '#EC7063']

export default async function Districtmap (map, enablePolygon = false, getDataByPolygon) {
  const layer = new VectorLayer('districtmap').addTo(map)
  layer.setOptions({ cursor: 'pointer' }) // 마우스를 올렸을 때 클릭 가능한 것처럼 손가락 모양으로 변경

  const apiList = await districtmapApi.list()
  const configStr = localStorage.getItem('districtmapConfig')
  const savedConfig = configStr ? JSON.parse(configStr) : []

  const districtmapList = apiList.map((name, index) => {
    const existing = savedConfig.find(d => d.name === name)
    return {
      name: name,
      show: existing !== undefined ? existing.show : true,
      color: hexColor[index % hexColor.length]
    }
  })

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

  // 1. 툴팁으로 사용할 공용 마커 생성
  const hoverLabel = new ui.UIMarker([0, 0], {
    content: '',
    single: true
  })

  async function draw () {
    const list = districtmapList.map(async (d) => {
      const data = await districtmapApi.get(d.name)
      const geometry = GeoJSON.toGeometry(data, g => {
        g.setSymbol({
          lineColor: d.color,
          lineOpacity: 1,
          lineWidth: 1.5,
          polygonFill: d.color,
          polygonOpacity: 0.4
        })

        // 2. 마우스가 구역에 들어왔을 때 (Hover)
        g.on('mouseenter', () => {
          // 마우스가 올라간 폴리곤만 투명도를 올려서 진하게 강조
          g.updateSymbol({ polygonOpacity: 0.7 })

          // 폴리곤의 정중앙 좌표 계산
          const center = g.getCenter()

          // 표시할 라벨 디자인 및 텍스트 (pointer-events: none 으로 마우스 간섭 및 깜빡임 방지)
          const htmlContent = `
            <div style="
              background: rgba(0, 0, 0, 0.85);
              color: #fff;
              padding: 6px 14px;
              border-radius: 20px;
              font-family: 'SUIT', sans-serif;
              font-weight: 600;
              font-size: 14px;
              white-space: nowrap;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              transform: translate(-50%, -50%);
              pointer-events: none;
            ">
              ${d.name}
            </div>
          `

          hoverLabel.setCoordinates(center)
          hoverLabel.setContent(htmlContent)
          hoverLabel.addTo(map).show()
        })

        // 3. 마우스가 구역에서 나갔을 때
        g.on('mouseout', () => {
          // 강조했던 폴리곤 투명도 원상복구
          g.updateSymbol({ polygonOpacity: 0.4 })
          // 라벨 숨김
          hoverLabel.remove()
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
      const target = geometries.find(g => g.name === name)
      if (!target) return

      if (show) target.geometry.forEach(g => g.show())
      else target.geometry.forEach(g => g.hide())
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
