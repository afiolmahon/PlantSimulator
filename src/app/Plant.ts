import { CylinderBufferGeometry, Mesh, MeshBasicMaterial, Color, Vector3 } from 'three';
import { MeshNormalMaterial } from 'three';


export function GeneratePlantColor(): Color {
    let a = Math.floor(16 * Math.random());
    return new Color(Math.random() * 0.4, Math.random() * 0.3 + 0.7, Math.random() * 0.4);
}

export class Plant {

    public model: Mesh;

    constructor() {
        this.model = new Mesh(new CylinderBufferGeometry(1,1.5,4), new MeshNormalMaterial());
        this.model.rotateOnWorldAxis(new Vector3(1,0,0), Math.PI/2);
        // Randomly generate
    }

    animate() {
        // this.testCube.position.setZ(2 * Math.sin(this.t));
        // this.t += 0.03;
    }

}

export class PlantNode {
    startRadius: number;
}