import Emitter from 'tiny-emitter';

class Time {
  constructor() {
    this.emitter = new Emitter();

    this.tick();
  }

  tick = () => {
    window.requestAnimationFrame(this.tick);

    this.emitter.emit('tick');
  }
}

export default Time;
