import {Stage} from './';
import {Vector2, Vector3} from 'three';

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

  last: Vector2;

  mouseDown(event: MouseEvent) {
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
    // My browser gives -100 for up and 100 for down.
    let amount = event.deltaY / 100;
    let surface = this.surface();
    let altitude = this.radius - surface;
    altitude *= 1.0 + amount * 1e-1;
    this.radius = altitude + surface;
    console.log(this.radius);
    // TODO How to avoid noise over time?
    this.update();
  }

}
