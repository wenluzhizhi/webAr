import * as THREE from '../libs/three.module.js';

/**
 * Roll correction
 * @param {THREE.Quaternion} quaternion - The quaternion to be corrected
 */
function correctUpVector(quaternion) {
  const zAxis = (new THREE.Vector3(0, 0, 1)).applyQuaternion(quaternion);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const xAxis = (new THREE.Vector3()).crossVectors(yAxis, zAxis).normalize();
  yAxis.crossVectors(zAxis, xAxis).normalize();
  quaternion.setFromRotationMatrix((new THREE.Matrix4()).makeBasis(xAxis, yAxis, zAxis));
}

/**
 * This class allows user to control camera by dragging mouse
 */
class ArcBallControl {
  /**
   * @constructor
   * @param {THREE.Camera}        camera   - The controlled camera
   * @param {THREE.WebGLRenderer} renderer - The renderer
   */
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.rotating = false;
    this.startDirection = new THREE.Vector3();
    this.movingDirection = new THREE.Vector3();
    this.startCamera = new THREE.Camera();
    this.deltaQuaternion = new THREE.Quaternion();

    this.onMouseDown = this.createOnMouseDownHandler();
    this.onMouseMove = this.createOnMouseMoveHandler();
    this.onMouseUp = this.createOnMouseUpHandler();
  }

  /**
   * Calculate a direction going out from camera and pointing to mouse event position,
   * in world space
   * @param {MouseEvent}    event  - A mouse event
   * @param {THREE.Vector3} output - A vector for storing result
   * @return {THREE.Vector3}        The calculated direction
   */
  calcDirection(event, output) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    let ndcX = (event.pageX - rect.left) / rect.width * 2 - 1;
    let ndcY = -(event.pageY - rect.top) / rect.height * 2 + 1;
    return output.set(ndcX, ndcY, 0.5).unproject(this.startCamera)
      .sub(this.startCamera.position).normalize();
  }

  /**
   * Create a callback for mousedown event
   * @return {Function} The created callback function
   */
  createOnMouseDownHandler() {
    return (event) => {
      if (event.ctrlKey || event.button !== 0) {
        return;
      }
      this.rotating = true;
      this.startCamera.copy(this.camera);
      this.calcDirection(event, this.startDirection);
      this.deltaQuaternion.set(0, 0, 0, 1);

      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);

      event.preventDefault();
    };
  }

  /**
   * Create a callback for mousemove event
   * @return {Function} The created callback function
   */
  createOnMouseMoveHandler() {
    return (event) => {
      if (this.rotating) {
        this.calcDirection(event, this.movingDirection);
        this.deltaQuaternion.setFromUnitVectors(
          this.movingDirection, this.startDirection
        );
        event.preventDefault();
      }
    };
  }

  /**
   * Create a callback for mouseup event
   * @return {Function} The created callback function
   */
  createOnMouseUpHandler() {
    return (event) => {
      this.rotating = false;
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
      event.preventDefault();
    };
  }

  /**
   * Start this control
   */
  connect() {
    document.addEventListener('mousedown', this.onMouseDown);
  }

  /**
   * Update camera orientation
   */
  update() {
    if (this.rotating) {
      this.camera.quaternion.copy(this.startCamera.quaternion);
      this.camera.quaternion.premultiply(this.deltaQuaternion);
      correctUpVector(this.camera.quaternion);
    }
  }

  /**
   * Stop this control
   */
  disconnect() {
    document.removeEventListener('mousedown', this.onMouseDown);
  }

  /**
   * Stop this control
   */
  dispose() {
    this.disconnect();
  }
}

/**
 * This class controls camera orientation based on device orientation
 */
class DeviceOrientationControls {
  /**
   * @constructor
   * @param {THREE.Camera}                        camera   - The controlled camera
   * @param {THREE.WebGLRenderer | CSS3DRenderer} renderer - A renderer
   */
  constructor(camera, renderer) {
    this.renderers = [renderer];
    this.canvas = renderer.domElement;
    this.camera = camera;
    this.camera.rotation.reorder('YXZ');
    this.enabled = true;
    this.deviceOrientation = {};
    this.alphaOffsetAngle = 0;
    this.tagOrientation = 0;
    this.tanPerHeight =
      2.0 * Math.tan(THREE.Math.degToRad(0.5 * camera.fov)) / this.canvas.offsetHeight;

    this.deviceOrientationCallback = this.onDeviceOrientation.bind(this);
    this.resizeCallback = this.onResize.bind(this);

    this.fallbackControl = new ArcBallControl(camera, renderer);
  }

  /**
   * Add a renderer to this control
   * @param {THREE.WebGLRenderer | CSS3DRenderer} renderer - A renderer
   */
  addRenderer(renderer) {
    this.renderers.push(renderer);
    renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight, false);
  }

  /**
   * Callback for deviceorientation event
   * @param {DeviceOrientationEvent} event - A deviceorientation event
   */
  onDeviceOrientation(event) {
    this.deviceOrientation = event;
  }

  /**
   * Callback for resize event
   */
  onResize() {
    this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
    this.camera.fov = 2.0 * THREE.Math.radToDeg(
      Math.atan(this.canvas.offsetHeight * 0.5 * this.tanPerHeight));
    this.camera.updateProjectionMatrix();
    this.renderers.forEach((renderer) => {
      renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight, false);
    });
    if (this.onResizeExt) {
      this.onResizeExt(this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Update camera's orientation based on device orientation and screen orientation
   * @param {Number} alpha  - Device alpha
   * @param {Number} beta   - Device beta
   * @param {Number} gamma  - Device gamma
   * @param {Number} orient - Screen orientation
   */
  updateCamera(alpha, beta, gamma, orient) {
    let zee = new THREE.Vector3(0, 0, 1);
    let euler = new THREE.Euler();
    let q0 = new THREE.Quaternion();
    // - PI/2 around the x-axis
    let q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

    euler.set(beta, alpha, - gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
    this.camera.quaternion.setFromEuler(euler); // orient the device
    this.camera.quaternion.multiply(q1); // camera looks out the back of the device, not the top
    // adjust for screen orientation
    this.camera.quaternion.multiply(q0.setFromAxisAngle(zee, - orient));
  }

  /**
   * Start this control
   */
  connect() {
    window.addEventListener('resize', this.resizeCallback, false);

    window.addEventListener('deviceorientation',
      this.deviceOrientationCallback, false);

    this.enabled = true;

    if (this.fallbackControl) {
      this.fallbackControl.connect();
    }
  }

  /**
   * Stop this control
   */
  disconnect() {
    window.removeEventListener('resize', this.resizeCallback, false);
    window.removeEventListener('deviceorientation',
      this.deviceOrientationCallback, false);
    this.enabled = false;

    if (this.fallbackControl) {
      this.fallbackControl.disconnect();
    }
  }

  /**
   * disable orientation
   */
  disableOrientation() {
    window.removeEventListener('deviceorientation',
      this.deviceOrientationCallback, false);
    this.enabled = false;

    if (this.fallbackControl) {
      this.fallbackControl.disconnect();
    }
  }

  /**
   * Update camera
   */
  update() {
    if (this.enabled === false) return;

    if (this.deviceOrientation.alpha) {
      if (this.fallbackControl) {
        this.fallbackControl.disconnect();
      }

      // Z
      let alpha = THREE.Math.degToRad(
        this.deviceOrientation.alpha + this.alphaOffsetAngle + this.tagOrientation);
      // X'
      let beta = (this.deviceOrientation.beta ?
        THREE.Math.degToRad(this.deviceOrientation.beta) : 1.57);
      // Y''
      let gamma = (this.deviceOrientation.gamma ?
        THREE.Math.degToRad(this.deviceOrientation.gamma) : 0);
      // O
      let orient = window.orientation ? THREE.Math.degToRad(window.orientation) : 0;

      this.updateCamera(alpha, beta, gamma, orient);
    } else if (this.fallbackControl) {
      this.fallbackControl.update();
    }
  }

  /**
   * Set alpha offset angle
   * @param  {Number} angle The alpha offset
   */
  setAlphaOffsetAngle(angle) {
    this.alphaOffsetAngle = angle;
  }

  /**
   * Update tag orientation angle
   * TODO: remove this function, use alpha offset
   * @param  {Number} angle The tag orientation angle
   */
  updateTagOrientation(angle) {
    this.tagOrientation = angle;
  }

  /**
   * Stop this control
   */
  dispose() {
    this.disconnect();
  }
}

export {DeviceOrientationControls as default};
