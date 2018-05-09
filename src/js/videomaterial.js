import $ from '../libs/jquery-3.3.1.js';
import * as THREE from '../libs/three.module.js';

/**
 * material to play video
 */
class VideoMaterial {
    constructor(camera, scene, top, height) {
        this.width = 256.0;
        this.height = 512.0;
        this.scale = 368.0 / this.width;
        this.camera = camera;
        this.scene = scene;
        this.video = $('#video')[0];
        this.image = document.createElement('canvas');
        this.image.width = this.width;
        this.image.height = this.height;
        this.imageContext = this.image.getContext('2d');
        this.imageContext.fillStyle = '#000000';
        this.imageContext.fillRect(0, 0, this.width, this.height);
        this.texture = new THREE.Texture(this.image);
        this.material = new THREE.MeshBasicMaterial({ map: this.texture, overdraw: 0.5 });
        this.plane = new THREE.PlaneGeometry(this.width, this.height, 4, 4);
        this.mesh = new THREE.Mesh(this.plane, this.material);

        console.log("screen height =" + window.innerHeight);
        console.log("scan height = " + height);
        this.mesh.position.y = this.height * (window.innerHeight * 0.5 - (top + height * 0.5)) / height;
        this.mesh.position.z = -((this.height * window.innerHeight) / (2.0 * height * Math.tan(THREE.Math.degToRad(0.5 * camera.fov))));
        this.mesh.scale.x = this.scale;
        this.scene.add(this.mesh);
    }

    /**
     * called each frame
     */
    update() {
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.imageContext.drawImage(this.video, 0, 0);
            if (this.texture) this.texture.needsUpdate = true;
        }
    }

}

export default VideoMaterial;