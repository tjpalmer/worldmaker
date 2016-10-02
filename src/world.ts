import {Control} from './';
import {
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, Geometry,
  Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  OrthographicCamera, PlaneBufferGeometry, PerspectiveCamera, Scene,
  ShaderMaterial, SphereBufferGeometry, Vector2, Vector3, WebGLRenderer,
  WebGLRenderTarget,
} from 'three';

export class Stage {

  buildTextureTarget() {
    // Texture scene.
    let textureScene = new Scene();
    let textureMaterial = new ShaderMaterial({
      uniforms: {seed: {value: this.seed}},
      vertexShader: positionTextureShader,
    });
    textureScene.add(new Mesh(
      new PlaneBufferGeometry(2 * Math.PI, Math.PI), textureMaterial,
    ));
    let textureCamera = new OrthographicCamera(
      -Math.PI, Math.PI, Math.PI / 2, -Math.PI / 2, -1e5, 1e5,
    );
    textureCamera.position.z = 1;
    // Texture size.
    // TODO(tjp): Change from 0 to 1 for full res.
    let targetRes = 0 + Math.ceil(Math.log(
      Math.max(window.screen.width, window.screen.height)
    ) / Math.log(2));
    let size = new Vector2(2**targetRes, 2**(targetRes-1));
    // Render textures.
    let renderTexture = (name: string, shader: string, toScreen = false) => {
      if (!(<any>this)[name]) {
        (<any>this)[name] = new WebGLRenderTarget(size.x, size.y);
      }
      textureMaterial.fragmentShader = shader;
      textureMaterial.needsUpdate = true;
      this.renderer.render(textureScene, textureCamera, (<any>this)[name]);
      if (toScreen) {
        this.renderer.render(textureScene, textureCamera);
      }
    };
    renderTexture('target', colorTextureShader);
    renderTexture('elevationTarget', elevationTextureShader);
    renderTexture('specularTarget', specularTextureShader);
  }

  camera: PerspectiveCamera;

  elevationTarget: WebGLRenderTarget;

  render() {
    // Prep next frame first for best fps.
    // requestAnimationFrame(() => this.render());
    // Render scene.
    this.renderer.render(this.scene, this.camera);
  }

  renderer: WebGLRenderer;

  resize() {
    this.renderer.setSize(1, 1);
    window.setTimeout(() => {
      let view = document.body.querySelector('.view');
      let size = {x: view.clientWidth, y: view.clientHeight};
      this.camera.aspect = size.x / size.y;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(size.x, size.y);
      if (this.scene) {
        this.render();
      }
    }, 0);
  }

  seed = new Vector3();

  scene: Scene;

  specularTarget: WebGLRenderTarget;

  sphere: Mesh;

  start() {
    // js tutorial code for now.
    // Renderer.
    let renderer = this.renderer = new WebGLRenderer({antialias: true});
    document.body.querySelector('.view').appendChild(renderer.domElement);
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
    this.buildTextureTarget();
    // Ambient light.
    let ambient = new AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambient);
    // Directional light.
    let light = new DirectionalLight(0xFFFFFF, 0.5);
    light.position.set(-1, 1, 1);
    scene.add(light);
    // Sphere.
    let res = 8;
    let sphereGeometry = new SphereBufferGeometry(1, 2**res, 2**(res-1));
    let noiseMaterial = new ShaderMaterial({
      fragmentShader: colorShader,
      vertexShader: positionShader,
    });
    // Chomolungma height vs earth radius.
    let elevationScale = 1.39e-2;
    let textureMaterial = new MeshPhongMaterial({
      bumpMap: this.elevationTarget.texture,
      bumpScale: elevationScale,
      displacementMap: this.elevationTarget.texture,
      displacementScale: elevationScale,
      map: this.target.texture,
      shininess: 90,
      specularMap: this.specularTarget.texture,
    });
    let sphere = this.sphere = new Mesh(sphereGeometry, textureMaterial);
    // let sphere = this.sphere = new Mesh(sphereGeometry, noiseMaterial);
    scene.add(sphere);
    // Rotation axis.
    buildRotationAxis(scene);
    // Render.
    this.render();
    // requestAnimationFrame(() => this.render());
  }

  target: WebGLRenderTarget;

  targetScene: Scene;

}

function buildRotationAxis(scene: Scene) {
  let extent = 1.1;
  let top = new Vector3(0, 1, 0).multiplyScalar(extent);
  let geometry = new Geometry();
  geometry.vertices.push(top, top.clone().multiplyScalar(-1));
  let line = new Line(geometry, new LineBasicMaterial({color: 0xFF0000}));
  scene.add(line);
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
  uniform vec3 seed;

  varying vec3 position3d;

  ${noiseFunctions}

  float landValue(vec3 pos);

  float worldValue(vec3 pos, float offset) {
    pos += seed;
    float value =
      0.5 * snoise(1.0 * pos)
      + 0.3 * snoise(2.0 * pos)
      + 0.2 * snoise(4.0 * pos)
      + 0.1 * snoise(8.0 * pos)
      // Make some places noisier than others.
      // TODO Semi-independent noise for height of each frequency.
      + 0.5 * (snoise(4.0 * (pos + 1e3)) + 1.2) * (
        + 0.1 * snoise(16.0 * pos)
        + 0.05 * snoise(32.0 * pos)
        + 0.02 * snoise(64.0 * pos)
      )
    ;
    value += offset;
    // value = 1.0 / (exp(-5.0 * value) + 1.0);
    // value = 2.0 * value - 1.0;
    return value;
  }

  float iceValue(vec3 pos) {
    float pure = 0.95;
    float less = 0.85;
    float none = 0.8;
    float offset = 5.0 * (abs(pos.y) - 0.9);
    // float offset = 1.0 * (smoothstep(less, pure, abs(pos.y)) - 0.5);
    // offset -=
    //   // Below less.
    //   (1.0 - step(less, abs(pos.y))) *
    //   // Gradually make the negative more extreme until none.
    //   (1.0 - smoothstep(none, less, abs(pos.y)));
    float value = worldValue(pos, offset);
    return value;
  }

  vec4 iceColor(vec3 pos) {
    float value = iceValue(pos);
    float low = 0.8;
    float gray = value + low * (1.0 - value);
    vec3 color = vec3(gray);
    float land = landValue(pos);
    float alpha;
    if (land <= 0.0) {
      color *= vec3(0.95, 0.95, 1.0);
      alpha = step(low, gray);
    } else {
      color *= 0.95;
      alpha = smoothstep(-1.0, 1.0, (gray - 0.8) * 1e2);
    }
    return vec4(color, alpha);
  }

  float iceElevation(vec3 pos) {
    // TODO Improve ice for over land vs over water.
    vec4 ice = iceColor(pos);
    // TODO How to avoid knowing the low gray value for ice here?
    // TODO Would it be a uniform?
    float elevation = (ice.x - 0.8) * 5.0;
    float land = landValue(pos);
    if (land <= 0.0) {
      elevation *= 0.4;
    }
    return elevation;
  }

  float landValue(vec3 pos) {
    return worldValue(pos, -0.15);
  }

  float landElevation(vec3 pos) {
    return max(landValue(pos), 0.0);
  }

  vec4 landColor(vec3 pos) {
    // TODO Change this into clear gradients and boundaries.
    float value = landValue(pos);
    float desert = worldValue(pos - 19.0, 0.05);
    desert -= abs(abs(pos.y) - 0.35) * 2.0;
    float forest = worldValue(pos - 39.0, 0.0);
    float unit = 0.5 * (value + 1.0);
    float sub = 0.5 * step(0.0, -value) + step(0.0, value);
    float red = 0.4 * unit * sub;
    float green = 0.8 * unit * sub;
    float blue = 0.7 * step(0.0, -value) + 0.1 * step(0.0, value);
    vec3 color = vec3(red, green, blue);
    if (value > 0.0) {
      // Colors picked from a NASA Blue Marble picture.
      vec3 desertColor = 0.8 * vec3(216, 186, 145) / 255.0;
      vec3 plantColor = vec3(99, 136, 45) / 255.0;
      forest = 0.25 * smoothstep(-0.3, 0.0, forest) + 0.75;
      plantColor *= forest;
      desert = smoothstep(-0.15, 0.15, desert);
      color = mix(plantColor, desertColor, desert);
    } else {
      color += (1.0 - color) * 0.1;
      color *= 0.6;
    }
    return vec4(color, 1.0);
  }

  vec4 worldColor(vec3 pos) {
    vec4 color = landColor(pos);
    vec4 next = iceColor(pos);
    color = vec4(mix(color.xyz, next.xyz, next.w), 1.0);
    return color;
  }

  float worldElevation(vec3 pos) {
    float elevation = landElevation(pos);
    elevation = max(elevation, iceElevation(pos));
    return elevation;
  }

  vec3 calcPosition3d() {
    vec3 pos = position3d;
    // Calculate 3D pos from x lon, y lat.
    // First rotate up.
    float y = sin(pos.y);
    float r = cos(pos.y);
    // Then rotate around.
    vec2 xz = r * vec2(cos(pos.x), sin(pos.x));
    pos = vec3(xz.x, y, xz.y);
    return pos;
  }
`;

let colorShader = `
  ${worldFunctions}

  void main() {
    gl_FragColor = worldColor(position3d);
  }
`;

let colorTextureShader = `
  ${worldFunctions}

  void main() {
    vec3 pos = calcPosition3d();
    gl_FragColor = worldColor(pos);
  }
`;

let elevationTextureShader = `
  ${worldFunctions}

  void main() {
    vec3 pos = calcPosition3d();
    gl_FragColor = vec4(vec3(worldElevation(pos)), 1.0);
  }
`;

let positionShader = `
  ${worldFunctions}

  void main() {
    position3d = position;
    // Chomolungma height vs earth radius.
    float value = 1.39e-3 * landValue(position);
    value = max(value, 0.0);
    vec3 shifted = (1.0 + value) * position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(shifted, 1.0);
  }
`;

let positionTextureShader = `
  ${worldFunctions}

  void main() {
    // Position3d is a misnomer here.
    // We can't calculate 3d until later, or we'd lose the curve.
    // TODO Rename?
    position3d = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

let specularTextureShader = `
  ${worldFunctions}

  void main() {
    vec3 pos = calcPosition3d();
    // TODO Separate explicit water function once we have land below sea.
    float specular = step(0.0, -landValue(pos));
    specular = iceValue(pos) > 0.0 ? 0.5 : specular;
    gl_FragColor = vec4(vec3(specular), 1.0);
  }
`;
