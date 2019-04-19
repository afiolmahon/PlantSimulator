import { Mesh } from 'three';

export function rotateAboutBase(mesh: Mesh, angle: number) {
    mesh.translateY(-mesh.geometry.boundingBox.max.y);
    mesh.rotation.z = angle;
    mesh.translateY(mesh.geometry.boundingBox.max.y);
}


/**
 * Plant Graph Data Structure
 */
export class PlantNode {
    
    private animationTimer = 0;
    public children: PlantNode[] = []

    constructor(public depth: number, public startRadius: number, public endRadius: number, public mesh: Mesh, public offsetAngle: number) {}

    // clean up resources not automatically freed (material, geometry)
    dispose() {
    }

    animate() {
        this.children.forEach(n => {
            let angle: number = (Math.PI/60) * Math.sin(this.animationTimer) + this.offsetAngle;
            rotateAboutBase(n.mesh, angle);
            n.animate();
        });
        // this.testCube.position.setZ(2 * Math.sin(this.t));
        this.animationTimer += 0.01;
    }

}