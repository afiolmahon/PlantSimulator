import { CylinderBufferGeometry, Mesh, Color, Vector3, MeshNormalMaterial } from 'three';
import { MeshLambertMaterial } from 'three';

export function GeneratePlantColor(): Color {
    return new Color(Math.random() * 0.4, Math.random() * 0.3 + 0.7, Math.random() * 0.4);
}

var REDUCTION = 0.4;
var NODE_HEIGHT = 4;

var X_AXIS: Vector3 = new Vector3(1, 0, 0);
var Y_AXIS: Vector3 = new Vector3(0, 1, 0);
var Z_AXIS: Vector3 = new Vector3(0, 0, 1);

export enum NTYPE {
    BRANCH,
    LEAF
};

export function createRootPlantNode(lowRadius: number): PlantNode {
    let topRadius = lowRadius - Math.random() * REDUCTION;
    let geo = new CylinderBufferGeometry(topRadius, lowRadius, NODE_HEIGHT);
    let mesh = new Mesh(geo, new MeshLambertMaterial({color: GeneratePlantColor() }));
    let n = new PlantNode(0, lowRadius, topRadius, mesh);
    n.mesh.translateZ(NODE_HEIGHT/2);
    n.mesh.rotateOnWorldAxis(X_AXIS, Math.PI/2);
    return n;
}

export function addBranchChildNode(parent: PlantNode): void {
    let topRadius = parent.endRadius - Math.random() * REDUCTION;
    let top2Radius = parent.endRadius - Math.random() * REDUCTION;
    // Create branch geometry
    let mainBranchGeo = new CylinderBufferGeometry(topRadius, parent.endRadius, NODE_HEIGHT);
    let sideBranchGeo = new CylinderBufferGeometry(top2Radius/4, parent.endRadius/4, NODE_HEIGHT*2,8, 1, false, Math.PI/2);
    let mainBranchMesh = new Mesh(mainBranchGeo, new MeshNormalMaterial);
    let sideBranchMesh = new Mesh(sideBranchGeo, new MeshNormalMaterial);
    mainBranchMesh.add(sideBranchMesh);
    sideBranchMesh.rotateOnAxis(X_AXIS, Math.PI/2);
    let sign: number = ((Math.random() >= 0.5) ? 1 : -1);
    sideBranchMesh.rotateOnAxis(Z_AXIS, sign*(Math.PI/2));
    sideBranchMesh.rotateOnAxis(X_AXIS, -sign*Math.random());
    sideBranchMesh.translateOnAxis(Y_AXIS, sign*NODE_HEIGHT);
    // sideBranchMesh.translateOnAxis(Z_AXIS, 2);
    // create & add to parent node
    let n = new PlantNode(parent.depth + 1, parent.endRadius, topRadius, mainBranchMesh);
    n.mesh.add(mainBranchMesh);
    parent.children.push(n);
    parent.mesh.add(n.mesh);
}

export class PlantNode {
    public children: PlantNode[] = []

    constructor(public depth: number, public startRadius: number, public endRadius: number, public mesh: Mesh) {
        // Create geometry
        // this.geo = new SphereBufferGeometry(0.5);
        if (depth != 0) {
            // this.mesh.rotateOnWorldAxis(Y_AXIS, (Math.random() * (Math.PI/2)) - (Math.PI/4));
        }
    }

    growBranch() {
        let endRad = this.endRadius - (Math.random() * REDUCTION*2);
        let geo = new CylinderBufferGeometry(endRad, this.endRadius, NODE_HEIGHT*2)
        let mesh = new Mesh(geo, new MeshNormalMaterial);
        let n = new PlantNode(this.depth + 1, this.endRadius, endRad, mesh);
        this.children.push(n);
        n.mesh.translateY(NODE_HEIGHT);
        this.mesh.add(n.mesh);
    }

    animate() {
        this.children.forEach(n => {
            let angle = 0;
            // n.mesh.rotateOnWorldAxis(Y_AXIS, angle)
        });
        // this.testCube.position.setZ(2 * Math.sin(this.t));
        // this.t += 0.03;
    }
}