import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  CanvasTexture,
  LinearFilter,
  SphereBufferGeometry,
  MeshBasicMaterial,
  Mesh
} from 'three';

import * as dat from 'dat.gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { instances } from '../../store';

import data from '../../assets/json/data';

class WebGL {
  constructor() {
    this.raf = 0;

    this.scenes = [];
    this.dataStages = data.stages;

    this.renderer = new WebGLRenderer({
      antialias: true
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);

    // this.button = document.querySelector('.js-button');
  }

  createScenes() {
    this.dataStages.forEach((stage) => {
      this.scene = new Scene();

      this.scene.name = stage.name;
      this.scene.active = false;

      const camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 1);
      this.scene.userData.camera = camera;

      const controls = new OrbitControls(this.scene.userData.camera, this.renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.rotateSpeed = -0.25;

      this.scene.userData.controls = controls;

      // Create this.canvasTexture
      const canvasTextureEl = document.createElement('canvas');
      const ctx = canvasTextureEl.getContext('2d');

      this.scene.userData.ctx = ctx;

      canvasTextureEl.width = 3840;
      canvasTextureEl.height = 1920;

      const canvasTexture = new CanvasTexture(canvasTextureEl);
      canvasTexture.minFilter = LinearFilter;

      const img = new Image();
      img.src = stage.outerImage;

      img.onload = () => {
        ctx.drawImage(
          img,
          0,
          0,
          canvasTextureEl.width,
          canvasTextureEl.height
        );
        canvasTexture.needsUpdate = true;
      };

      const videos = [];

      stage.videos.forEach((video) => {
        // Set-up video element
        const videoEl = document.createElement('video');
        videoEl.src = video.url;
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.pause();
        videoEl.vidAttrs = video;
        videos.push(videoEl);
      });

      this.scene.userData.canvasTexture = canvasTexture;

      this.scene.userData.videos = videos;

      const geometry = new SphereBufferGeometry(10, 32, 32).scale(-1, 1, 1);

      const material = new MeshBasicMaterial({
        map: canvasTexture
      });

      this.scene.add(new Mesh(geometry, material));
      this.scenes.push(this.scene);
    });


    this.scenes[0].active = true;
  }

  events() {
    window.addEventListener('resize', this.onResize);

    // this.button.addEventListener('click', this.changeScene);
  }

  changeScene() {
    this.gui = new dat.GUI();

    this.params = {
      name: this.scenes[0].name
    };

    this.gui.add(this.params, 'name', {
      BarA: 'bar-a',
      BarB: 'bar-b',
      ZaalA: 'zaal-a',
      ZaalB: 'zaal-b',
      BrouwerijA: 'brouwerij-a',
      BrouwerijB: 'brouwerij-b'
    }).onFinishChange(() => {
      [...this.scenes].forEach((scene) => {
        scene.active = false;
        scene.visible = false;
        if (scene.name === this.params.name) {
          scene.active = true;
          scene.visible = true;
        }
      });
    }).name('Change Scene');


    // this.gui.add({ BarA: this.scenes[0], BarB: this.scenes[1] }).onFinishChange(() => {
    //   [...this.scenes].forEach((scene) => {
    //     console.log(scene);
    //   });
    // });
  }

  onResize = () => {
    [...this.scenes].forEach((scene) => {
      scene.userData.camera.aspect = window.innerWidth / window.innerHeight;
      scene.userData.camera.updateProjectionMatrix();
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  start = () => {
    instances.time.emitter.on('tick', this.render);
  }

  render = () => {
    [...this.scenes].forEach((scene) => {
      scene.userData.controls.update();

      if (scene.active) {
        scene.userData.videos.forEach((video) => {
          video.play();

          scene.userData.ctx.drawImage(
            video,
            video.vidAttrs.x,
            video.vidAttrs.y,
            video.vidAttrs.width,
            video.vidAttrs.height
          );

          scene.userData.canvasTexture.needsUpdate = true;
        });

        const camera = scene.userData.camera;
        this.renderer.render(scene, camera);
      }
    });
  }

  init() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    this.createScenes();
    this.events();
    this.changeScene();

    this.start();
  }
}

export default WebGL;
