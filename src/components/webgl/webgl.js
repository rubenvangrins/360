import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  SphereGeometry,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class WebGL {
  constructor() {
    this.raf = 0;

    this.scene = new Scene();

    this.renderer = new WebGLRenderer({
      antialias: true,
    });
  }

  initCamera() {
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 1);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
  }

  events() {
    window.addEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  render = () => {
    this.raf = undefined;

    this.renderer.render(this.scene, this.camera);

    this.start();

    this.controls.update();
  };

  start = () => {
    if (!this.raf) {
      this.raf = window.requestAnimationFrame(this.render);
    }
  };

  stop = () => {
    if (this.raf) {
      window.cancelAnimationFrame(this.raf);
      this.raf = undefined;
    }
  };

  sphere() {
    const geometry = new SphereGeometry(1, 12, 12).scale(-1, 1, 1);
    const material = new MeshBasicMaterial({ wireframe: true });
    const sphere = new Mesh(geometry, material);
    this.scene.add(sphere);
  }

  init() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    this.initCamera();
    this.initControls();

    this.events();

    this.start();

    this.sphere();
  }
}

export default WebGL;
