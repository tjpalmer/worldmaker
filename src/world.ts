import {Control} from './';
import {
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, Geometry,
  Line, LineBasicMaterial, Mesh, MeshPhongMaterial, PerspectiveCamera, Scene,
  ShaderMaterial, SphereGeometry, Vector3, WebGLRenderer,
} from 'three';

export class Stage {

  camera: PerspectiveCamera;

  render() {
    // js tutorial code for now.
    // Prep next frame first for best fps.
    // requestAnimationFrame(() => this.render());
    // Render scene.
    this.renderer.clear();
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
    // js tutorial code for now.
    // Renderer.
    let renderer = this.renderer =
      new WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
    // Camera.
    this.camera = new PerspectiveCamera(
      35, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 4;
    // Resize handling after renderer and camera.
    window.addEventListener('resize', () => this.resize());
    this.resize();
    // Scene.
    let scene = this.scene = new Scene();
    new Control(this);
    // Ambient light.
    let ambient = new AmbientLight(0xFFFFFF, 0.2);
    scene.add(ambient);
    // Directional light.
    let light = new DirectionalLight(0xFFFFFF, 0.7);
    light.position.set(-1, 1, 1);
    scene.add(light);
    // Sphere.
    let res = 6;
    let sphereGeometry = new SphereGeometry(1, 2**res, 2**(res-1));
    let noiseMaterial = new ShaderMaterial({
      fragmentShader: noiseShader,
      vertexShader: positionShader,
    });
    let sphere = this.sphere = new Mesh(sphereGeometry, noiseMaterial);
    scene.add(sphere);
    // Rotation axis.
    buildRotationAxis(scene);
    // buildWorld(scene);
    // Render.
    this.render();
    // requestAnimationFrame(() => this.render());
  }

}

function buildRotationAxis(scene: Scene) {
  let extent = 1.1;
  let top = new Vector3(0, 1, 0).multiplyScalar(extent);
  let geometry = new Geometry();
  geometry.vertices.push(top, top.clone().multiplyScalar(-1));
  let line = new Line(geometry, new LineBasicMaterial({color: 0xFF0000}));
  scene.add(line);
}

function buildWorld(scene: Scene) {
  // TODO Build basic lat-lon. Use proj4?
  // TODO I left this unfinished, eh?
  let geometry = new BufferGeometry();
  // Make elevations.
  // TODO Extract to subdivide.
  // TODO Make a GPU version of everything.
  let dims = [3, 4];
  let elevations = new Float32Array(dims[0] * dims[1]);
  for (let latIndex = 0; latIndex < dims[0]; ++latIndex) {
    for (let lonIndex = 0; lonIndex < dims[1]; ++lonIndex) {
      elevations[latIndex * dims[1]] = 1;
    }
  }
  // Make points.
  let rowCount = dims[0] - 1;
  let points = new Float32Array(rowCount * dims[1] * 6);
  let index = 0;
  for (let latIndex = 0; latIndex < rowCount; ++latIndex) {
    let lat0 = -0.5 + latIndex / rowCount;
    let lat1 = -0.5 + (latIndex + 1) / rowCount;
    for (let lonIndex = 0; lonIndex < dims[1]; ++lonIndex) {
      // let lon0 = -1 + 
    }
  }
  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.
  let vertices = new Float32Array( [
    -1.0, -1.0,  -1.0,
    1.0, -1.0,  -1.0,
    1.0,  1.0,  -1.0,

    1.0,  1.0,  -1.0,
    -1.0,  1.0,  -1.0,
    -1.0, -1.0,  -1.0
  ] );
  // itemSize = 3 because there are 3 values (components) per vertex
  geometry.addAttribute( 'position', new BufferAttribute( vertices, 3 ) );
  let material = new MeshPhongMaterial( { color: 0xff0000 } );
  let mesh = new Mesh( geometry, material );
  scene.add(mesh);
}

//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 
let noiseFunctions = `
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
      return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v)
    { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

  // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }
`;

let worldFunctions = `
  float worldValue() {
    float value =
      0.5 * snoise(1.0 * position3d)
      + 0.2 * snoise(2.0 * position3d)
      + 0.2 * snoise(4.0 * position3d)
      + 0.1 * snoise(8.0 * position3d)
    ;
    value = 1.0 / (exp(-5.0 * value) + 1.0);
    return 2.0 * value - 1.0;
  }
`;

let noiseShader = `
  varying vec3 position3d;

  ${noiseFunctions}
  ${worldFunctions}

  void main() {
    float value = 0.5 * (worldValue() + 1.0);
    gl_FragColor = vec4(
      0.4 * value, 0.8 * value, 1.0 - value, 1.0
    );
  }
`;

let positionShader = `
  varying vec3 position3d;

  ${noiseFunctions}
  ${worldFunctions}

  void main() {
    position3d = position;
    vec3 shifted = (1.0 + 1e-2 * worldValue()) * position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(shifted, 1.0);
  }
`;
