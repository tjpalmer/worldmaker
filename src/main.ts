import {Stage, Toolbox} from './';
import './index.css';

window.onload = main;

// There's probably a better place for this declaration.
declare function require(name: string): any;

function main() {
  new Toolbox(document.body);
  let stage = new Stage();
  stage.start();
}
