import * as THREE from '../libs/three.module.js';
import DeviceOrientationControls from '../utils/deviceorientationcontrols.js';
import $ from '../libs/jquery-3.3.1.js';
import VideoMaterial from './videomaterial';
import {Mesh, MeshLambertMaterial} from "../libs/three.module";

class FarmerApp {
    constructor() {

        this.canvas = $('#three_container')[0];
        let fov = 80;
        let tanFovPerPixel = 2 * Math.tan(THREE.Math.degToRad(fov / 2)) / Math.max(
            document.documentElement.clientWidth, document.documentElement.clientHeight);
        fov = 2 * THREE.Math.radToDeg(Math.atan(tanFovPerPixel * this.canvas.offsetHeight / 2));
        this.camera = new THREE.PerspectiveCamera(
            fov, this.canvas.offsetWidth / this.canvas.offsetHeight, 0.1, 10000);
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: true, premultipliedAlpha: true });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight, false);

        this.controls = new DeviceOrientationControls(this.camera, this.renderer);
        this.controls.connect();
        this.videoMaterial = new VideoMaterial(this.camer, this.scene, 100.0, 600.0);
    }

    update() {
        window.requestAnimationFrame(() => {
            this.update();
        });
        this.controls.update();
        this.videoMaterial.update();
        this.renderer.render(this.scene, this.camera);

    }

}

export default FarmerApp;