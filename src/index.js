// Styles
import './index.scss';
import { instances } from './store';
import Time from './utils/time';

instances.time = new Time();

// Components
// import WebGL from './components/webgl/webgl';
import WebGL from './components/webgl/webgl';

// WebGL
let iWebGL = new WebGL();
iWebGL.init();
