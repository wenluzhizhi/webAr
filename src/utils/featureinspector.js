class FeatureInspector {
  constructor() {
    this.features = {};
    // checke browser
    this.features.agent = navigator.userAgent;
    // check WebGL
    if (!window.WebGLRenderingContext) {
      this.features.webgl = false;
    } else {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (ctx) {
        this.features.webgl = true;
      } else {
        this.features.webgl = false;
      }
    }
    // check WebAssembly
    if (typeof WebAssembly === "undefined") {
      this.features.wasm = false;
    } else {
      this.features.wasm = true;
    }
    const mediaDevices = window.mediaDevices || window.navigator.mediaDevices;
    // check WebRTC and decide api
    if (mediaDevices && mediaDevices.getUserMedia && mediaDevices.enumerateDevices) {
      this.features.webrtc = true;
      this.features.getUserMedia = function(constraints, callback, error) {
        mediaDevices.getUserMedia(constraints).then(
          callback).catch(error);
      };
      this.features.enumerateDevices = function(callback, error) {
        mediaDevices.enumerateDevices().then(callback).catch(error);
      };
    } else {
      let getUserMedia = window.navigator.getUserMedia ||
        window.navigator.mozGetUserMedia ||
        window.navigator.webkitGetUserMedia ||
        window.navigator.msGetUserMedia;
      let enumerateDevices = window.navigator.enumerateDevices ||
        window.navigator.mozEnumerateDevices ||
        window.navigator.webkitEnumerateDevices ||
        window.navigator.msEnumerateDevices;
      if (getUserMedia && enumerateDevices) {
        this.features.webrtc = true;
        this.features.getUserMedia = function(constraints, callback, error) {
          getUserMedia.call(window.navigator, constraints, callback, error);
        };
        this.features.enumerateDevices = function(callback, error) {
          enumerateDevices.call(window.navigator, callback, error);
        };
      } else {
        this.features.webrtc = false;
      }
    }
    // sensor availability can't be checked now
    this.features.sensor = undefined;
  }

  inspect(callback) {
    let inspector = this;
    let onDeviceOrientation = function(event) {
      if (event && event.alpha && event.beta && event.gamma) {
        inspector.features.sensor = true;
      } else {
        inspector.features.sensor = false;
      }
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      callback(inspector.features);
    };

    window.addEventListener('deviceorientation', onDeviceOrientation);
  }
}

let featureInspector = new FeatureInspector();
export default featureInspector;