import { Feature } from 'ol'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource, Cluster } from 'ol/source'
import { transform } from 'ol/proj'
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style'
import { Point } from 'ol/geom'
import { vesselIcon, createVesselStyle } from './vessel-style'
import { Select } from 'ol/interaction'
import { pointerMove } from 'ol/events/condition'

const status = {
  normal: '#42a7ff',
  doubt: '#f6ff42',
  illegal: '#ff5542'
}

function selectStyle (f) {
  const styles = [
    new Style({
      image: new CircleStyle({
        radius: 30,
        fill: new Fill({ color: 'rgba(255, 255, 255, 0.01)' })
      })
    })
  ]

  const originalFeatures = f.get('features')
  originalFeatures.forEach(ff => {
    styles.push(createVesselStyle(ff))
  })

  return styles
}

function initSelect (map, layer, callback) {
  const select = new Select({
    layers: [layer],
    style: selectStyle
  })

  select.on('select', (e) => {
    const [l] = e.selected
    if (l) {
      callback(l.get('features').map(f => f.getProperties()), l.getGeometry().getCoordinates())
    }
  })

  map.addInteraction(select)
  return select
}

const circleStyle = (size) => new Style({
  image: new CircleStyle({
    radius: 30,
    fill: new Fill({ color: 'rgba(255, 153, 0, 0.5)' })
  }),
  text: new Text({
    text: size.toString(),
    fill: new Fill({ color: '#fff' }),
    stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.6)', width: 3 })
  })
})

function initPointerMove (map, layer) {
  const select = new Select({
    layers: [layer],
    condition: pointerMove,
    style: (f) => {
      const size = f.get('features').length
      if (size === 1) {
        const style = createVesselStyle(f.get('features')[0], 0.25)
        return style
      } else {
        const style = circleStyle(size).clone()
        style.getImage().setStroke(new Stroke({ color: 'white' }))
        return style
      }
    }
  })

  select.on('select', ({ selected: [l] }) => {
    if (l) {
      map.getViewport().classList.add('pointer-cursor')
    } else {
      map.getViewport().classList.remove('pointer-cursor')
    }
  })

  map.addInteraction(select)
}

function clusterStyle (feature) {
  const size = feature.get('features').length
  if (size > 1) {
    return circleStyle(size).clone()
  } else {
    const originalFeature = feature.get('features')[0]
    return createVesselStyle(originalFeature)
  }
}

export default function drawVessel (map, data, callback) {
  const features = data.map((d) => {
    const coord = transform([d.longitude, d.latitude], 'EPSG:4326', 'EPSG:3857')
    const feature = new Feature(new Point(coord))

    const clone = vesselIcon(status[d.illegalStatus]).clone()
    clone.getImage().setRotation(Math.PI / 180 * d.cog)

    feature.setStyle(clone)
    feature.setProperties(d)
    feature.setId(d.vesselid)
    return feature
  })

  const source = new VectorSource({ features })

  const clusterSource = new Cluster({
    distance: 50,
    source
  })

  const vectorLayer = new VectorLayer({
    source: clusterSource,
    style: clusterStyle,
    zIndex: 2
  })

  map.addLayer(vectorLayer)

  initPointerMove(map, vectorLayer)

  function changeFeatures (f) {
    // create new feature
    // create new source and cluster
    // layer set source
    console.log(f)
  }
  return {
    select: initSelect(map, vectorLayer, callback),
    source: vectorLayer.getSource(),
    changeFeatures
  }
}
