import {
  AmbientLight, BackSide, BoxGeometry, Clock, DirectionalLight, DoubleSide,
  FrontSide, Mesh, MeshPhongMaterial, PerspectiveCamera, Scene, SphereGeometry,
  TextureLoader, WebGLRenderer,
} from 'three';

export class Game {

  camera: PerspectiveCamera;

  clock: Clock;

  cube: Mesh;

  render() {
    // Three.js tutorial code for now.
    // Prep next frame first for best fps.
    requestAnimationFrame(() => this.render());
    // Prep this frame.
    // Rotate cube.
    this.cube.rotation.x += 1e-2;
    this.cube.rotation.y += 1e-2;
    // Orbit sphere.
    let orbitTime = this.clock.getElapsedTime() / 2;
    this.sphere.position.
      set(Math.cos(orbitTime), 0, Math.sin(orbitTime)).
      multiplyScalar(2);
    // Render scene.
    // Double-rendering trick: https://github.com/mrdoob/three.js/issues/2476
    // TODO Still doesn't seem to show the back. Try an image map, too?
    this.renderer.clear();
    //this.cube.material.side = BackSide;
    this.sphere.material.side = BackSide;
    this.renderer.render(this.scene, this.camera);
    //this.cube.material.side = FrontSide;
    this.sphere.material.side = FrontSide;
    this.renderer.render(this.scene, this.camera);
  }

  renderer: WebGLRenderer;

  resize() {
    // TODO Use canvas client width and height once I get layout working.
    let size = {x: window.innerWidth, y: window.innerHeight};
    this.camera.aspect = size.x / size.y;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(size.x, size.y);
  }

  scene: Scene;

  sphere: Mesh;

  start() {
    // Three.js tutorial code for now.
    // Renderer.
    let renderer = this.renderer =
      new WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
    this.clock = new Clock();
    // Camera.
    this.camera = new PerspectiveCamera(
      35, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 6;
    // Resize handling after renderer and camera.
    window.addEventListener('resize', () => this.resize());
    this.resize();
    // Scene.
    let scene = this.scene = new Scene();
    // Ambient light.
    let ambient = new AmbientLight(0xFFFFAA, 0.2);
    scene.add(ambient);
    // Directional light.
    let light = new DirectionalLight(0xFFFFFF, 0.75);
    light.position.set(-1, 1, 1);
    scene.add(light);
    // Texture.
    let texture = new TextureLoader().load('image.jpg');
    // Cube.
    let cubeGeometry = new BoxGeometry(1, 1, 1);
    let cubeMaterial = new MeshPhongMaterial({
      color: 0x66FF66, map: texture, opacity: 0.5, side: DoubleSide,
      transparent: true,
    });
    let cube = this.cube = new Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);
    // Sphere.
    let sphereGeometry = new SphereGeometry(0.5, 30, 20);
    let sphereMaterial = new MeshPhongMaterial({
      color: 0xFFFFFF, map: texture, opacity: 0.75, side: DoubleSide,
      transparent: true,
    });
    let sphere = this.sphere = new Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(2, 0, 0);
    scene.add(sphere);
    // Render.
    requestAnimationFrame(() => this.render());
  }

}
