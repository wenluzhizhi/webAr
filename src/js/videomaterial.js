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
        this.video = $('#myvideo')[0];
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
        // this.camera.add(this.mesh);
        let y = this.height * (window.innerHeight * 0.5 - (top + height * 0.5)) / height;
        let z = -((this.height * window.innerHeight) / (2.0 * height * Math.tan(THREE.Math.degToRad(0.5 * camera.fov))));
        // console.log("y = " + y);
        // console.log("z = " + z);
        // this.mesh.position.set(0, y, z);
        // console.log('camera rotation = ' + this.camera.rotation);
        // console.log(this.mesh.position);
        // let worldPos = this.mesh.position.clone();
        // worldPos = this.camera.localToWorld(worldPos.clone());
        // console.log(worldPos);
        // worldPos = this.mesh.getWorldPosition();
        // console.log(worldPos);
        // // console.log(this.camera.getWorldPosition(this.mesh.position.clone()));
        this.mesh.position.set(0., y, z);
        this.camera.updateMatrixWorld(true);
        this.camera.localToWorld(this.mesh.position);
        this.camera.getWorldQuaternion(this.mesh.quaternion);
        this.mesh.scale.x = this.scale;
        this.scene.add(this.mesh);
        // console.log(this.camera.getWorldPosition(this.mesh.position.clone()));
    }

    /**
     * called each frame
     */
    update() {
        // console.log(this.mesh.getWorldPosition(this.mesh.position));
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.imageContext.drawImage(this.video, 0, 0);
            if (this.texture) this.texture.needsUpdate = true;
        }
    }

}

export default VideoMaterial;