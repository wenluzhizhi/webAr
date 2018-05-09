import $ from '../libs/jquery-3.3.1.js';
import * as THREE from '../libs/three.module.js';

/**
 * material to play video
 */
class VideoMaterial {
    constructor(scene) {
        this.scene = scene;
        this.video = $('#myvideo')[0];
        this.image = document.createElement('canvas');
        this.image.width = 256;
        this.image.height = 128;
        this.imageContext = this.image.getContext('2d');
        this.imageContext.fillStyle = '#000000';
        this.imageContext.fillRect(0, 0, 256, 128);
        this.texture = new THREE.Texture(this.image);
        this.material = new THREE.MeshBasicMaterial({ map: this.texture, overdraw: 0.5 });
        this.plane = new THREE.PlaneGeometry(256, 128, 4, 4);
        this.mesh = new THREE.Mesh(this.plane, this.material);
        this.mesh.position.z = -500;
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