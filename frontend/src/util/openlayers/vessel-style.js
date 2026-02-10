import { Style, Icon } from 'ol/style'

const ICON_SIZE = 20
const ICON_OFFSET = 4

function createTriangle (fill = 'red', stroke = 'black') {
  const triangleCanvas = document.createElement('canvas')
  triangleCanvas.width = ICON_SIZE
  triangleCanvas.height = ICON_SIZE

  const context = triangleCanvas.getContext('2d')

  context.beginPath()
  context.moveTo(ICON_SIZE / 2, 0) // 삼각형 꼭짓점
  context.lineTo(ICON_SIZE - ICON_OFFSET, ICON_SIZE) // 오른쪽 아래 점
  context.lineTo(ICON_OFFSET, ICON_SIZE) // 왼쪽 아래 점
  context.closePath()

  context.fillStyle = fill
  context.fill()
  context.strokeStyle = stroke
  context.lineWidth = 1
  context.stroke()

  return triangleCanvas
}

const vesselIcon = (color = '#42a7ff') => new Style({
  // image: new Icon({ img: createTriangle() })
  image: new Icon({
    src: 'shape/triangle.png',
    color,
    scale: 0.2
  })
})

const status = {
  normal: '#42a7ff',
  doubt: '#f6ff42',
  illegal: '#ff5542'
}

function createVesselStyle (feature, scale = 0.2) {
  const { illegalStatus } = feature.getProperties()
  const style = new Style({
    image: new Icon({
      src: 'shape/triangle.png',
      color: status[illegalStatus],
      scale
    })
  })
  style.setGeometry(feature.getGeometry())
  style.getImage().setRotation(feature.getStyle().getImage().getRotation())
  return style
}

export { createVesselStyle, vesselIcon, createTriangle }
