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

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { instances } from '../../store';

import data from '../../assets/json/data-small';

class WebGL {
  constructor() {
    this.raf = 0;

    this.scenes = [];
    this.dataStages = data.stages;

    this.renderer = new WebGLRenderer({
      antialias: true
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
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

      // Create CanvasTexture
      const canvasTextureEl = document.createElement('canvas');
      const ctx = canvasTextureEl.getContext('2d');

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

      stage.videos.forEach((dataVideo) => {
        // Set-up video element
        const video = document.createElement('video');
        video.src = dataVideo.url;
        video.muted = true;
        video.loop = true;
        video.pause();

        // Draw video element to canvas
        const drawVideo = (videoSource) => {
          ctx.drawImage(
            videoSource,
            dataVideo.x,
            dataVideo.y,
            dataVideo.width,
            dataVideo.height,
          );
          canvasTexture.needsUpdate = true;
        };

        this.scene.userData.videoPlay = drawVideo;
        videos.push(video);
      });

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
  }

  onResize = () => {
    [...this.scenes].forEach((scene) => {
      scene.userData.camera.aspect = window.innerWidth / window.innerHeight;
      scene.userData.camera.updateProjectionMatrix();
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render = () => {
    [...this.scenes].forEach((scene) => {
      scene.userData.videos.forEach((video) => {
        video.play();
        scene.userData.videoPlay(video);
      });

      scene.userData.controls.update();

      const camera = scene.userData.camera;

      this.renderer.render(scene, camera);
    });
  }

  init() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    this.createScenes();
    this.events();

    [...this.scenes].forEach((scene) => {
      if (scene.active) instances.time.emitter.on('tick', this.render);
      instances.time.emitter.off('tick', this.render);
    });
  }
}

export default WebGL;
