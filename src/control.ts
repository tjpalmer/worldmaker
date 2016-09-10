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
  }

  active: boolean;

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
    // Make sure we don't lose altitude over time.
    position.normalize().multiplyScalar(this.radius);
    // console.log('position', this.stage.camera.position);
    this.stage.camera.lookAt(new Vector3());
    this.stage.camera.updateMatrix();
    this.stage.camera.updateProjectionMatrix();
    this.stage.render();
    // And remember where we were again.
    this.last.set(event.screenX, event.screenY);
  }

  mouseUp(event: MouseEvent) {
    this.active = false;
  }

  radius: number;

  stage: Stage;

}
