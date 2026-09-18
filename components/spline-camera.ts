import type { Application } from '@splinetool/runtime'

type Vector = { x: number; y: number; z: number; set: (x: number, y: number, z: number) => void }
type Camera = {
  isCamera?: boolean
  isPerspectiveCamera?: boolean
  zoom?: number
  updateProjectionMatrix?: () => void
  position: Vector
  rotation: Vector
  updateMatrixWorld: (force?: boolean) => void
}
type Scene = { activeCamera?: Camera; traverse?: (visitor: (object: Camera) => void) => void }
// Spline does not expose camera transforms publicly. Keep its private API
// dependency isolated and validate it before enabling the camera sequence.
type CameraApplication = Application & {
  _camera?: Camera
  _scene?: Scene
  scene?: Scene
  _renderer?: { setPixelRatio?: (ratio: number) => void }
}

const START = { position: [196, -6, 208], rotation: [21, 44.1, -15] }
const END = { position: [-6, 80, 107], rotation: [-6.9, .6, .1] }

export function createCameraDriver(application: Application) {
  const app = application as CameraApplication
  const scene = app._scene ?? app.scene
  let camera = app._camera ?? scene?.activeCamera
  if (!camera) scene?.traverse?.(object => {
    if (!camera && (object.isCamera || object.isPerspectiveCamera)) camera = object
  })
  if (!camera?.position?.set || !camera.rotation?.set) throw new Error('Spline camera is unavailable')
  const activeCamera = camera
  const initialZoom = activeCamera.zoom ?? 1
  const disableControls = () => {
    const controls = application.controls
    if (controls?.orbitControls) controls.orbitControls.enabled = false
    application.pauseGameControls()
  }
  disableControls()
  application.setBackgroundColor('#ffffff')
  return {
    disableControls,
    resize(width: number, height: number) {
      app._renderer?.setPixelRatio?.(Math.min(window.devicePixelRatio || 1, 1.5))
      // Runtime caches CSS dimensions even when the backing ratio changes.
      // Invalidate that cache so canvas and postprocessing targets resize together.
      application.setSize(width - 1, height - 1)
      application.setSize(width, height)
    },
    update(progress: number, push = 0) {
      const p = Math.max(0, Math.min(1, progress))
      const interpolate = (from: number[], to: number[]) => from.map((value, i) => value + (to[i] - value) * p)
      const position = interpolate(START.position, END.position)
      const rotation = interpolate(START.rotation, END.rotation).map(value => value * Math.PI / 180)
      activeCamera.position.set(position[0], position[1] - push * 2, position[2] - push * 17)
      activeCamera.rotation.set(rotation[0], rotation[1], rotation[2])
      activeCamera.zoom = initialZoom * (1 + push * .8)
      activeCamera.updateProjectionMatrix?.()
      activeCamera.updateMatrixWorld(true)
      application.requestRender()
    },
  }
}
