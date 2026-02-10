import * as THREE from 'three'
import { GeoJSON, LineString } from 'maptalks'
import { ThreeLayer } from 'maptalks.three'

export default function Trajectory (map) {
  const layer = new ThreeLayer('trajectory-layer', {
    forceRenderOnMoving: true,
    forceRenderOnRotating: true
  }).addTo(map)

  layer.prepareToDraw = (gl, scene, camera) => {
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    camera.add(new THREE.SpotLight(0xffffff, 0.6, 0, Math.PI))
  }

  let frameId = null
  function animate () {
    layer._needsUpdate = !layer._needsUpdate
    if (layer._needsUpdate) {
      layer.redraw()
    }
    frameId = requestAnimationFrame(animate)
  }

  function load (geoJson) {
    cancelAnimationFrame(frameId)
    layer.clear()
    const geometry = GeoJSON.toGeometry(geoJson)

    const material = new THREE.MeshBasicMaterial({
      color: 'red',
      transparent: true
    })
    const coordinates = geometry.getCoordinates().map((v) => [v.x, v.y])
    const lineString = new LineString(coordinates)

    const line = layer.toLine(lineString, {}, new THREE.LineBasicMaterial({
      color: material.color
    }))

    layer.addMesh(line)

    const lineTrail = layer.toExtrudeLineTrail(
      geometry,
      {
        width: 2000,
        speed: 1,
        trail: 5,
        chunkLength: geometry.getLength() / (geometry.getLength() / 1000),
        interactive: true
      },
      material
    )
    layer.addMesh(lineTrail)
    animate()
  }

  return {
    load,
    hide: () => {
      layer.clear()
      cancelAnimationFrame(frameId)
      layer.redraw()
    }
  }
}
