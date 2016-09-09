import {Stage} from './';
import {Vector2, Vector3} from 'three';

export class Control {

  constructor(stage: Stage) {
    this.stage = stage;
    this.start = new Vector2();
    let canvas: HTMLElement = stage.renderer.domElement;
    canvas.addEventListener('mousedown', event => this.mouseDown(event));
    window.addEventListener('mousemove', event => this.mouseMove(event));
  }

  // Geocentric latitude here for the moment.
  cameraStartLlh: Vector3;

  mouseDown(event: MouseEvent) {
    this.start.set(event.screenX, event.screenY);
    let {position} = this.stage.camera;
    let x = new Vector3(1, 0, 0);
    let axis = new Vector3(position.x, 0, position.z);
    let lon = x.angleTo(axis);
    let lat = axis.angleTo(position) * Math.sign(position.y);
    // console.log(lon / Math.PI, lat / Math.PI);
    this.cameraStartLlh = new Vector3(lon, lat, position.length());
  }

  mouseMove(event: MouseEvent) {
    if (event.buttons) {
      let delta = new Vector2(event.screenX, event.screenY).sub(this.start);
      let size = new Vector2(window.innerWidth, window.innerHeight);
      delta.divide(size).multiplyScalar(Math.PI);
      let lonLat = new Vector2().copy(<Vector2><any>this.cameraStartLlh);
      lonLat.add(delta);
      // Constrain y rotation to poles.
      // lonLat.y =
      //   Math.min(Math.abs(lonLat.y), 0.5 * Math.PI) * Math.sign(lonLat.y);
      // console.log(this.cameraStartLlh);
      // console.log(delta);
      // console.log(lonLat);
      let position = this.stage.camera.position;
      position.set(1, 0, 0);
      position.applyAxisAngle(new Vector3(0, 1, 0), -lonLat.x);
      // position.applyAxisAngle(new Vector3(0, 0, 1), lonLat.y);
      let axis = position.clone();
      axis.applyAxisAngle(new Vector3(0, 1, 0), Math.PI * 0.5);
      position.applyAxisAngle(axis, -lonLat.y);
      position.multiplyScalar(this.cameraStartLlh.z);
      // console.log('position', this.stage.camera.position);
      this.stage.camera.lookAt(new Vector3());
      this.stage.camera.updateMatrix();
      this.stage.camera.updateProjectionMatrix();
      this.stage.render();
    }
  }

  stage: Stage;

  start: Vector2;

}
