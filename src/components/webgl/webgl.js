import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import data from '../../assets/json/data';

class WebGL {
  constructor() {
    this.canvas = undefined;
    this.scenes = [];
    this.renderer = undefined;
    this.dataStages = data.stages;
  }

  createScenes() {
    this.canvas = document.getElementById('c');
    let content = document.getElementById('content');

    this.dataStages.forEach((stage) => {
      const scene = new THREE.Scene();
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

      const camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
      camera.position.z = 2;
      scene.userData.camera = camera;

      const controls = new OrbitControls(scene.userData.camera, scene.userData.element);
      scene.userData.controls = controls;

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

      scene.userData.outerImage = img;

      stage.videos.forEach((dataVideo) => {
        const video = document.createElement('video');
        video.src = dataVideo.url;
        video.muted = true;
        video.loop = true;

        ctx.drawImage(
          video,
          dataVideo.x,
          dataVideo.y,
          dataVideo.width,
          dataVideo.height,
        );
        canvasTexture.needsUpdate = true;

        scene.userData.videos = video;
      });

      scene.userData.ctx = ctx;

      // add one random mesh to each scene
      const geometry = new THREE.SphereBufferGeometry(0.5, 32, 32);

      const material = new THREE.MeshBasicMaterial({
        map: canvasTexture
      });

      scene.add(new THREE.Mesh(geometry, material));
      this.scenes.push(scene);
    });

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  updateSize() {
    let width = this.canvas.clientWidth;
    let height = this.canvas.clientHeight;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false);
    }
  }

  animate() {
    this.render();
    window.requestAnimationFrame(this.animate.bind(this));
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
