import { Mesh } from 'three';
import Prando from 'prando';

export function rotateBase(mesh: Mesh, angle: number) {
    mesh.geometry.computeBoundingBox();
    mesh.translateY(-mesh.geometry.boundingBox.max.y);
    mesh.rotation.z = angle;
    mesh.translateY(mesh.geometry.boundingBox.max.y);
}

/**
 * Plant Graph Data Structure
 */
export class PlantNode {
    private animationTimer = 0;
    public children: PlantNode[] = [];

    public age = 0; // track growth cycles

    constructor(public depth: number,
                public rng: Prando,
                public parentRadius: number,
                public radius: number,
                public mesh: Mesh,
                public offsetAngle: number) {
    }

    // clean up resources not automatically freed (material, geometry)
    dispose() {
    }

    animate() {
        const angle: number = (Math.PI / 60) * Math.sin(this.animationTimer) + this.offsetAngle;
        rotateBase(this.mesh, angle);
        this.children.forEach(n => {
            n.animate();
        });
        this.animationTimer += 0.02;
    }
}
