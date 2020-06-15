import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

import data from '../../assets/json/data-small';

class WebGL {
  constructor() {
    this.canvas = undefined;
    this.scenes = [];
    this.renderer = undefined;
    this.dataStages = data.stages;

    this.gui = new dat.GUI();
  }

  createScenes() {
    this.canvas = document.getElementById('c');
    let content = document.getElementById('content');

    this.dataStages.forEach((stage) => {
      const scene = new THREE.Scene();
      scene.name = stage.name;
      scene.active = false;
      // make a list item
      const element = document.createElement('div');
      element.className = 'list-item';

      const sceneElement = document.createElement('div');
      element.appendChild(sceneElement);

      const descriptionElement = document.createElement('div');
      descriptionElement.innerText = 'Scene ' + (stage.name);
      element.appendChild(descriptionElement);

      // the element that represents the area we want to render the scene
      scene.userData.element = sceneElement;
      content.appendChild(element);

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 1);
      scene.userData.camera = camera;

      const controls = new OrbitControls(scene.userData.camera, scene.userData.element);
      scene.userData.controls = controls;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.rotateSpeed = -0.25;

      // Create CanvasTexture
      const canvasTextureEl = document.createElement('canvas');
      const ctx = canvasTextureEl.getContext('2d');

      canvasTextureEl.width = 3840;
      canvasTextureEl.height = 1920;

      const canvasTexture = new THREE.CanvasTexture(canvasTextureEl);
      canvasTexture.minFilter = THREE.LinearFilter;

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

      stage.videos.forEach((dataVideo) => {
        const video = document.createElement('video');
        video.src = dataVideo.url;
        video.muted = true;
        video.loop = true;
        video.play();

        const playVideo = () => {
          ctx.drawImage(
            video,
            dataVideo.x,
            dataVideo.y,
            dataVideo.width,
            dataVideo.height,
          );
          canvasTexture.needsUpdate = true;
        };

        const run = () => {
          setTimeout(() => {
            window.requestAnimationFrame(run.bind(this));
            playVideo();
          }, 1000 / 60);
        };

        run();
      });
      // add one random mesh to each scene
      const geometry = new THREE.SphereBufferGeometry(1, 32, 32).scale(-1, 1, 1);

      const material = new THREE.MeshBasicMaterial({
        map: canvasTexture
      });

      scene.add(new THREE.Mesh(geometry, material));
      this.scenes.push(scene);
    });

    this.scenes[0].active = true;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    [...this.scenes].forEach((scene) => {
      this.activeSwitch = this.gui.addFolder(scene.name);
      this.activeSwitch.add(scene, 'active');
    });
  }

  updateSize() {
    let width = this.canvas.clientWidth;
    let height = this.canvas.clientHeight;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false);
    }
  }

  animate() {
    [...this.scenes].forEach((scene) => {
      if (!scene.active) return;
      window.requestAnimationFrame(this.render);
    });
  }

  render() {
    this.updateSize();

    this.canvas.style.transform = `translateY(${window.scrollY}px)`;

    this.renderer.setClearColor(0xe0e0e0);

    this.renderer.setScissorTest(true);

    this.scenes.forEach((scene) => {
      // get the element that is a place holder for where we want to
      // draw the scene
      let element = scene.userData.element;

      // // get its position relative to the page's viewport
      let rect = element.getBoundingClientRect();

      // // check if it's offscreen. If so skip it
      if (rect.bottom < 0 || rect.top > this.renderer.domElement.clientHeight
       || rect.right < 0 || rect.left > this.renderer.domElement.clientWidth) {
        return; // it's off screen
      }

      // // set the viewport
      let width = rect.right - rect.left;
      let height = rect.bottom - rect.top;
      let left = rect.left;
      let bottom = this.renderer.domElement.clientHeight - rect.bottom;

      this.renderer.setViewport(left, bottom, width, height);
      this.renderer.setScissor(left, bottom, width, height);

      let camera = scene.userData.camera;

      this.renderer.render(scene, camera);
    });
  }


  init() {
    this.createScenes();
    this.animate();
  }
}

export default WebGL;
