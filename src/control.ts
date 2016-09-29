import {Stage} from './';
import {Raycaster, Vector2, Vector3} from 'three';

export class Control {

  constructor(stage: Stage) {
    this.active = false;
    this.last = new Vector2();
    this.radius = stage.camera.position.length();
    this.stage = stage;
    let canvas = stage.renderer.domElement;
    canvas.addEventListener('mousedown', event => this.mouseDown(event));
    window.addEventListener('mousemove', event => this.mouseMove(event));
    window.addEventListener('mouseup', event => this.mouseUp(event));
    canvas.addEventListener('wheel', event => this.wheel(event));
  }

  active: boolean;

  altitude() {
    return this.radius - this.surface();
  }

  calculateIntersection(point: Vector2) {
    let {origin, direction} = this.calculateRay(point);
    let {x, y, z} = origin;
    let {x: u, y: v, z: w} = direction;
    // Swap a and b out with real values if we vary later.
    let a = 1, b = 1;
    // Calculate distance to intersection.
    // See http://gis.stackexchange.com/questions/20780
    let a2 = a*a, b2 = b*b;
    let c = b2 * (u*u + v*v) + a2 * w*w;
    let d = b2 * (u*x + v*y) + a2 * w*z;
    let e = b2 * (x*x + y*y - a2) + a2 * z*z;
    let t = -1/c * (d + Math.sqrt(d*d - c*e));
    // And now the intersection itself.
    let intersection = Number.isNaN(t) ?
      undefined :
      // This modifies our vectors, but we made them and don't need them later.
      origin.add(direction.multiplyScalar(t));
    // console.log(origin, direction, intersection);
    return intersection;
  }

  calculateRay(point: Vector2) {
    let raycaster = new Raycaster();
    // TODO Extract point transform function.
    point = point.clone().divide(
      new Vector2(
        this.stage.renderer.domElement.offsetWidth,
        this.stage.renderer.domElement.offsetHeight,
      )
    ).multiplyScalar(2).addScalar(-1).multiply(new Vector2(1, -1));
    // console.log(point);
    raycaster.setFromCamera(point, this.stage.camera);
    return raycaster.ray;
  }

  last: Vector2;

  mouseDown(event: MouseEvent) {
    // TODO Different tools by toolbox selection, where this "Control" is a
    // TODO camera and/or rotation tool.
    let intersection =
      this.calculateIntersection(new Vector2(event.offsetX, event.offsetY));
    console.log(intersection);
    // Track for camera rotation.
    this.last.set(event.screenX, event.screenY);
    this.active = true;
  }

  mouseMove(event: MouseEvent) {
    if (!this.active) return;
    let delta = new Vector2(event.screenX, event.screenY).sub(this.last);
    let size = Math.min(window.innerWidth, window.innerHeight);
    delta.divideScalar(size).multiplyScalar(Math.PI);
    // Slow down rotation when zoomed in.
    let deltaScale = new Vector2(1, 1).multiplyScalar(this.altitude() / 3);
    deltaScale.y = Math.min(1.0, deltaScale.y);
    delta.multiply(deltaScale);
    // let lonLat = new Vector2().copy(<Vector2><any>this.cameraStartLlh);
    // lonLat.add(delta);
    // Constrain y rotation to poles.
    // lonLat.y =
    //   Math.min(Math.abs(lonLat.y), 0.5 * Math.PI) * Math.sign(lonLat.y);
    // console.log(this.cameraStartLlh);
    // console.log(delta);
    // console.log(lonLat);
    let position = this.stage.camera.position;
    // Longitude.
    position.applyAxisAngle(new Vector3(0, 1, 0), -delta.x);
    // Latitude.
    let axis = new Vector3(position.x, 0, position.z);
    axis.applyAxisAngle(new Vector3(0, 1, 0), Math.PI * 0.5);
    position.applyAxisAngle(axis, -delta.y);
    // And remember where we were again.
    this.last.set(event.screenX, event.screenY);
    // Done.
    this.update();
  }

  mouseUp(event: MouseEvent) {
    this.active = false;
  }

  radius: number;

  stage: Stage;

  surface() {
    // TODO Work off elevation at current point.
    // TODO Why does below 1.1 go inside the sphere?
    return 1.1;
  }

  update() {
    let position = this.stage.camera.position;
    // Make sure we don't change altitude over time.
    position.normalize().multiplyScalar(this.radius);
    // console.log('position', this.stage.camera.position);
    this.stage.camera.lookAt(new Vector3());
    this.stage.camera.updateMatrix();
    this.stage.camera.updateProjectionMatrix();
    this.stage.render();
  }

  wheel(event: WheelEvent) {
    // Different browsers are different, so just ignore the amount.
    let amount = Math.sign(event.deltaY);
    let surface = this.surface();
    let altitude = this.radius - surface;
    altitude *= 1.0 + amount * 1e-1;
    this.radius = altitude + surface;
    console.log(this.radius);
    // TODO How to avoid noise over time?
    this.update();
  }

}
