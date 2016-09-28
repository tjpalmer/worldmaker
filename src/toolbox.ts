import {Stage} from './';
import {Vector3} from 'three';

export class Toolbox {

  constructor(body: HTMLElement, stage: Stage) {
    // Toolbox.
    let toolbox = body.querySelector('.toolbox');
    for (let any of <any>toolbox.querySelectorAll('input')) {
      let input: HTMLInputElement = any;
      input.addEventListener('click', () => {
        for (let any of <any>toolbox.querySelectorAll('label')) {
          let other: HTMLInputElement = any;
          other.classList.remove('selected');
        }
        let selected = toolbox.querySelector('input:checked');
        (<HTMLElement>selected.closest('label')).classList.add('selected');
      });
    }
    // Other panels.
    body.querySelector('.shuffle').addEventListener('click', () => {
      // The range of -1e3 to +1e3 is based on manual twiddling for what the
      // noise functions can take.
      let random = Math.random;
      stage.seed.set(
        random(), random(), random()
      ).addScalar(-0.5).multiplyScalar(2e3);
      // Regenerate and render.
      stage.buildTextureTarget();
      stage.sphere.material.needsUpdate = true;
      stage.render();
    });
  }

}
