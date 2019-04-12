import { CylinderBufferGeometry, Mesh, Color, Vector3, MeshStandardMaterial } from 'three';
import { SphereBufferGeometry } from 'three';

export function GeneratePlantColor(): Color {
    let r1 = Math.random();
    let r2 = Math.random();
    let r3 = Math.random();
    return new Color(r1 * 0.4, r2 * 0.4 + 0.6, r3 * 0.4);
}

var X_AXIS: Vector3 = new Vector3(1, 0, 0);
var Y_AXIS: Vector3 = new Vector3(0, 1, 0);
var Z_AXIS: Vector3 = new Vector3(0, 0, 1);


export enum NTYPE {
    BRANCH,
    LEAF
};

export class PlantGenerator {
    // Generator Properties
    public branch_mesh_radial_segments: number = 20;
    public branch_mesh_height_segments: number = 1;
    public branch_length_max = 4;
    public branch_radius_constant_reduction: number = 0.3;
    public branch_radius_variable_reduction: number = 0.2
    public branch_radius_min: number = 0.2;
    public branch_pitch_max: number = Math.PI/4;

    constructor() {}

    makeBranchMesh(radius_min: number, radius_max: number, height: number): Mesh {
        let material = new MeshStandardMaterial({color: GeneratePlantColor(), flatShading: false});
        let geometry_branch = new CylinderBufferGeometry(radius_min, radius_max, height, this.branch_mesh_radial_segments, this.branch_mesh_height_segments, false);
    
        let capGeo = new SphereBufferGeometry(radius_min, this.branch_mesh_radial_segments);
        let geometry_top = new Mesh(capGeo, material);
        let m = new Mesh(geometry_branch, material)
        m.add(geometry_top);
        m.geometry.computeBoundingBox();
        geometry_top.translateY(m.geometry.boundingBox.max.y);
        return m;
    }
    
    createRootPlantNode(lowRadius: number): PlantNode {
        let topRadius = lowRadius - 0.3 - (Math.random() * 0.2);
        let mesh = this.makeBranchMesh(topRadius, lowRadius, this.branch_length_max);
        let n = new PlantNode(0, lowRadius, topRadius, mesh);
        n.mesh.translateZ(this.branch_length_max/2);
        n.mesh.rotateOnWorldAxis(X_AXIS, Math.PI/2);
        return n;
    }

    /**
     * Decides what type of child to add based on constraints and determines what type of child component to create
     * @param parent 
     */
    addChildToNode(parent: PlantNode): void {
        // Check threshold for minimum feature size
        if (parent.endRadius >=  this.branch_radius_min) {
            this.addBranchChildNode(parent);
        }
    }


    growPlant(node: PlantNode): void {
        // Try to add a node at all leaves
        if (node.children.length > 0) {
            node.children.forEach(e => {this.growPlant(e)});
        } else { // At the end of a plant
            this.addChildToNode(node);
        }
    }

    branchPosition(branch: Mesh): void{
        let branchProb = Math.floor(Math.random() * 3);
        switch(branchProb){
            case 0:
                branch.position.set(-this.branch_length_max/3, 0, 0);
                branch.rotateOnAxis(Z_AXIS, Math.PI/3);
                let pitch: number = Math.random() * 0.2;
                // let sign: number = Math.random()
                branch.rotateOnAxis(Y_AXIS, pitch);
                break;
            case 1:
                branch.position.set(this.branch_length_max/3, 0, 0);
                branch.rotateOnAxis(Z_AXIS, -Math.PI/3);
                let pitch2: number = Math.random() * 0.2;
                // let sign: number = Math.random()
                branch.rotateOnAxis(Y_AXIS, -pitch2); 
                break;
            case 2:
                branch.position.set(-this.branch_length_max/3, 0, 0);
                branch.rotateOnAxis(Z_AXIS, Math.PI/2);
                let pitch3: number = Math.random() * 0.2;
                // let sign: number = Math.random()
                branch.rotateOnAxis(Y_AXIS, pitch3);  
                break;
        }
    }

    addBranchChildNode(parent: PlantNode): void {
        let branchProb = Math.floor(Math.random() * 2); // 0 or 1; 0 == child branch ; 1 == no branch

        let topRadius = parent.endRadius - (Math.random() * this.branch_radius_variable_reduction) - this.branch_radius_constant_reduction;
        // Create branch geometry
        let mainBranchMesh = this.makeBranchMesh(topRadius, parent.endRadius, this.branch_length_max);//new Mesh(mainBranchGeo, mainBranchMat);

        if(branchProb == 0){
            let sideBranchMesh = this.makeBranchMesh(0.08, parent.endRadius/4, this.branch_length_max/1.5);//new Mesh(sideBranchGeo, new MeshLambertMaterial({color: GeneratePlantColor() }));
    
            this.branchPosition(sideBranchMesh);
            mainBranchMesh.add(sideBranchMesh);
             
        }
        
        mainBranchMesh.position.set(0, this.branch_length_max, 0);


        // create & add to parent node
        let n = new PlantNode(parent.depth + 1, parent.endRadius, topRadius, mainBranchMesh);
        n.mesh.add(mainBranchMesh);
        parent.children.push(n);
        parent.mesh.add(n.mesh);
    }
}

/**
 * Plant Graph Data Structure
 */
export class PlantNode {

    public children: PlantNode[] = []

    constructor(public depth: number, public startRadius: number, public endRadius: number, public mesh: Mesh) {
    
    }

    // clean up resources not automatically freed (material, geometry)
    dispose() {

    }

    t = 0;
    animate() {
        this.children.forEach(n => {
            let angle: number = (Math.PI/60) * Math.sin(this.t);
            n.rotateBase(angle);
            n.animate();
        });
        // this.testCube.position.setZ(2 * Math.sin(this.t));
        this.t += 0.01;
    }

    rotateBase(angle: number) {
        this.mesh.translateY(-this.mesh.geometry.boundingBox.max.y);
        this.mesh.rotation.z = angle;
        this.mesh.translateY(this.mesh.geometry.boundingBox.max.y);
    }
}