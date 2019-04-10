import { PerspectiveCamera } from 'three';

export class CameraController {
    
    constructor(public camera: PerspectiveCamera) {
        this.setCamera('bird');
    }

    setCamera(pos: 'bird' | 'ground') {
        if (pos == 'bird') {
            this.camera.position.z = 30;
            this.camera.position.y = -40;
            this.camera.position.x = 0;
            this.camera.rotation.x = 1.0;
        } else if (pos == 'ground') {
            this.camera.position.z = 0;
            this.camera.position.y = -14;
            this.camera.rotation.x = Math.PI / 2;
        }
    }

    zoom(deltaZoom: number): string {
        let maxFOV = 40;
        let minFOV = 10;
        let newFOV = this.camera.fov + (deltaZoom * 0.2);
        if (newFOV > maxFOV) {
            this.camera.fov = maxFOV;
        } else if (newFOV < minFOV) {
            this.camera.fov = minFOV;
        } else {
            this.camera.fov = newFOV;
        }
        this.camera.updateProjectionMatrix();
        return this.camera.fov.toString();
    }

    dolly(deltaX:number): string {
        let maxX = 16;
        let newX = this.camera.position.x + deltaX;
        if (newX > maxX) {
            this.camera.position.setX(maxX);
        } else if (newX < -maxX) {
            this.camera.position.setX(-maxX);
        } else {
            this.camera.position.setX(newX);
        }
        return newX.toString();
    }

    updateCamera(): void {
        this.camera.updateProjectionMatrix();
    }
}