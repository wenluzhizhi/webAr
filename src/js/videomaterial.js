import $ from '../libs/jquery-3.3.1.js';
import * as THREE from '../libs/three.module.js';

/**

 * material to play video

 */

class VideoMaterial {
    constructor(camera, scene) {
        this.width = 256.0;
        this.height = 512.0;
        this.scale = 368.0 / this.width;
        this.camera = camera;
        this.scene = scene;
        this.video = $('#myvideo')[0];
        this.texture = new THREE.VideoTexture(this.video, THREE.UVMapping,
            THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter,
            THREE.LinearFilter, THREE.RGBFormat, THREE.UnsignedByteType);
        this.material = new THREE.MeshBasicMaterial({map: this.texture, overdraw: 0.5});
        this.plane = new THREE.PlaneGeometry(this.width, this.height, 4, 4);
        this.mesh = new THREE.Mesh(this.plane, this.material);
        this.mesh.scale.x = this.scale;

    }



    show(top, height) {
        let y = this.height * (window.innerHeight * 0.5 - (top + height * 0.5)) / height;
        let z = -((this.height * window.innerHeight) / (2.0 * height * Math.tan(THREE.Math.degToRad(0.5 * this.camera.fov))));
        this.mesh.position.set(0., y, z);
        this.camera.updateMatrixWorld(true);
        this.camera.localToWorld(this.mesh.position);
        this.camera.getWorldQuaternion(this.mesh.quaternion);
        this.scene.add(this.mesh);

    }

    hide() {

        this.scene.remove(this.mesh);

    }

}



export default VideoMaterial;