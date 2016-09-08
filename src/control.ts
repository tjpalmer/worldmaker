import {Stage} from './';

export class Control {

  constructor(stage: Stage) {
    this.stage = stage;
    this.start = [0, 0];
    let canvas: HTMLElement = stage.renderer.domElement;
    canvas.addEventListener('mousedown', event => this.mouseDown(event));
    window.addEventListener('mousemove', event => this.mouseMove(event));
  }

  mouseDown(event: MouseEvent) {
    this.start = [event.screenX, event.screenY];
    console.log(this.start);
  }

  mouseMove(event: MouseEvent) {
    if (event.buttons) {
      let delta = [
        event.screenX - this.start[0], event.screenY - this.start[1]];
      console.log(delta);
    }
  }

  stage: Stage;

  start: number[];

}
