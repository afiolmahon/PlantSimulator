import { CylinderBufferGeometry, Mesh, Color, Vector3, Object3D } from 'three';
import { MeshLambertMaterial } from 'three';
import { SphereBufferGeometry } from 'three';
import { setRotateAroundPoint } from './utility';

export function GeneratePlantColor(): Color {
    return new Color(Math.random() * 0.4, Math.random() * 0.4 + 0.6, Math.random() * 0.4);
}

var REDUCTION = 0.4; // max branch diameter reduction per node
var MAX_BRANCH_HEIGHT = 4; // Max node length
var MIN_BRANCH_RAD = 0.2; // smallest allowable diameter for branches


var X_AXIS: Vector3 = new Vector3(1, 0, 0);
var Y_AXIS: Vector3 = new Vector3(0, 1, 0);
var Z_AXIS: Vector3 = new Vector3(0, 0, 1);
var RAD_SEGMENTS = 20;
var HEIGHT_SEGS = 1;

export enum NTYPE {
    BRANCH,
    LEAF
};

export function makeBranchMesh(minRad: number, maxRad: number, height: number): Mesh {
    let branchMat = new MeshLambertMaterial({color: GeneratePlantColor() });
    let branchGeo = new CylinderBufferGeometry(minRad, maxRad, height, RAD_SEGMENTS, HEIGHT_SEGS, false);

    let capGeo = new SphereBufferGeometry(minRad, RAD_SEGMENTS);
    let capMesh = new Mesh(capGeo, branchMat);
    let m = new Mesh(branchGeo, branchMat)
    m.add(capMesh);
    m.geometry.computeBoundingBox();
    capMesh.translateY(m.geometry.boundingBox.max.y);
    return m;
}

export function createRootPlantNode(lowRadius: number): PlantNode {
    let topRadius = lowRadius - Math.random() * REDUCTION;
    let mesh = makeBranchMesh(topRadius, lowRadius, MAX_BRANCH_HEIGHT);
    let n = new PlantNode(0, lowRadius, topRadius, mesh);
    n.mesh.translateZ(MAX_BRANCH_HEIGHT/2);
    n.mesh.rotateOnWorldAxis(X_AXIS, Math.PI/2);
    return n;
}

export function addBranchChildNode(parent: PlantNode): void {
    let topRadius = parent.endRadius - Math.random() * REDUCTION;
    // Create branch geometry
    let mainBranchMesh = makeBranchMesh(topRadius, parent.endRadius, MAX_BRANCH_HEIGHT);//new Mesh(mainBranchGeo, mainBranchMat);
    let sideBranchMesh = makeBranchMesh(topRadius/4, parent.endRadius/4, MAX_BRANCH_HEIGHT);//new Mesh(sideBranchGeo, new MeshLambertMaterial({color: GeneratePlantColor() }));

    mainBranchMesh.add(sideBranchMesh);
    mainBranchMesh.position.set(0, MAX_BRANCH_HEIGHT, 0);
    sideBranchMesh.rotateOnAxis(X_AXIS, Math.PI/2);
    let sign: number = ((Math.random() >= 0.5) ? 1 : -1);
    sideBranchMesh.rotateOnAxis(Z_AXIS, sign*(Math.PI/2));
    sideBranchMesh.rotateOnAxis(X_AXIS, -sign*Math.random());
    sideBranchMesh.translateOnAxis(Y_AXIS, sign*MAX_BRANCH_HEIGHT*.75);
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

    addChildNode(): void {
        let topRadius = this.endRadius - (Math.random() * REDUCTION);
        // Create branch geometry
        let mainBranchMesh = makeBranchMesh(topRadius, this.endRadius, MAX_BRANCH_HEIGHT);//new Mesh(mainBranchGeo, mainBranchMat);
        let sideBranchMesh = makeBranchMesh(topRadius/4, this.endRadius/4, MAX_BRANCH_HEIGHT);//new Mesh(sideBranchGeo, new MeshLambertMaterial({color: GeneratePlantColor() }));
    
        mainBranchMesh.add(sideBranchMesh);
        mainBranchMesh.position.set(0, MAX_BRANCH_HEIGHT, 0);
        sideBranchMesh.rotateOnAxis(X_AXIS, Math.PI/2);
        let sign: number = ((Math.random() >= 0.5) ? 1 : -1);
        sideBranchMesh.rotateOnAxis(Z_AXIS, sign*(Math.PI/2));
        sideBranchMesh.rotateOnAxis(X_AXIS, -sign*Math.random());
        sideBranchMesh.translateOnAxis(Y_AXIS, sign*MAX_BRANCH_HEIGHT*.75);
        // create & add to parent node
        let n = new PlantNode(this.depth + 1, this.endRadius, topRadius, mainBranchMesh);
        n.mesh.add(mainBranchMesh);
        this.children.push(n);
        this.mesh.add(n.mesh);
    }

    // clean up resources not automatically freed (material, geometry)
    dispose() {

    }

    grow() {
        if (this.children.length > 0) {
            this.children.forEach(e => e.grow());
        } else {
            if (this.endRadius >=  MIN_BRANCH_RAD) {
                this.addChildNode();
            }
        }
    }

    t = 0;
    animate() {
        this.children.forEach(n => {
            let angle: number = (Math.PI/25) * Math.sin(this.t);
            n.rotateBase(angle);
        });
        // this.testCube.position.setZ(2 * Math.sin(this.t));
        this.t += 0.01;
    }

    rotateBase(angle: number) {
        this.mesh.translateY(-this.mesh.geometry.boundingBox.max.y);
        this.mesh.rotation.z = angle;
        this.mesh.translateY(this.mesh.geometry.boundingBox.max.y);
    }


    // growBranch() {
    //     let endRad = this.endRadius - (Math.random() * REDUCTION*2);
    //     let geo = new CylinderBufferGeometry(endRad, this.endRadius, NODE_HEIGHT*2)
    //     let mesh = new Mesh(geo, new MeshNormalMaterial);
    //     let n = new PlantNode(this.depth + 1, this.endRadius, endRad, mesh);
    //     this.children.push(n);
    //     n.mesh.translateY(NODE_HEIGHT);
    //     this.mesh.add(n.mesh);
    // }
}