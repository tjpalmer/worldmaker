import {Game} from './';
import './index.css';

window.onload = main;

// There's probably a better place for this declaration.
declare function require(name: string): any;

function main() {
  let game = new Game();
  game.start();
}
