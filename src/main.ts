import {Stage, Toolbox} from './';
import './index.css';

window.onload = main;

// There's probably a better place for this declaration.
declare function require(name: string): any;

function main() {
  let stage = new Stage();
  new Toolbox(document.body, stage);
  stage.start();
}
