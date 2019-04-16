import { CylinderBufferGeometry, Mesh, Color, MeshStandardMaterial } from 'three';
import { SphereBufferGeometry } from 'three';
import { X_AXIS, Y_AXIS, Z_AXIS } from './utility';
import { LeafGenerator } from './Leaf';

export function GeneratePlantColor(): Color {
    let r1 = Math.random();
    let r2 = Math.random();
    let r3 = Math.random();
    return new Color(r1 * 0.4, r2 * 0.4 + 0.6, r3 * 0.4);
}

export enum NTYPE {
    BRANCH,
    LEAF
};

export class PlantGenerator {
    // Generator Properties
    LeafGen: LeafGenerator = new LeafGenerator();

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
        let n = new PlantNode(0, lowRadius, topRadius, mesh, 0);
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
            if (Math.random() >= 0.7) {
                this.addBranchChildNode(parent, 0);
            } else { // add double branch
                this.addBranchChildNode(parent, -Math.PI/4);
                this.addBranchChildNode(parent, Math.PI/4);
            }
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
        let leaf = this.LeafGen.makeLeafMesh();
        branch.add(leaf); 
        switch(branchProb){
            case 0:
                branch.position.set(-this.branch_length_max/3, 0, 0);
                branch.rotateOnAxis(Z_AXIS, Math.PI/3);
                let pitch: number = Math.random() * 0.2;
                // let sign: number = Math.random()
                branch.rotateOnAxis(Y_AXIS, pitch);
                //.9 <--> 1.1 && this.branch_length_max/3 - 0.3
                leaf.position.set(branch.position.x + .9, branch.position.y + 0.3, 0.1);
                break;
            case 1:
                branch.position.set(this.branch_length_max/3, 0, 0);
                branch.rotateOnAxis(Z_AXIS, -Math.PI/3);
                let pitch2: number = Math.random() * 0.2;
                // let sign: number = Math.random()
                branch.rotateOnAxis(Y_AXIS, -pitch2); 
                leaf.position.set(branch.position.x - 1.5, branch.position.y + 1.5, 0.1);
                leaf.rotateOnAxis(Z_AXIS, 180);
                leaf.rotateOnAxis(X_AXIS, 180);
                
                break;
            case 2:
                branch.position.set(-this.branch_length_max/3, 0, 0);
                branch.rotateOnAxis(Z_AXIS, Math.PI/2);
                let pitch3: number = Math.random() * 0.2;
                // let sign: number = Math.random()
                branch.rotateOnAxis(Y_AXIS, pitch3);  
                leaf.position.set(branch.position.x +1, branch.position.y + .5, 0.1);
                break;
        }
        leaf.scale.set(0.01,0.01,0.01);
       // leaf.position.set(branch.position.x+.8, branch.position.y, 0);
    }

    addBranchChildNode(parent: PlantNode, offsetAngle: number): void {
        let branchProb = Math.floor(Math.random() * 2); // 0 or 1; 0 == child branch ; 1 == no branch

        let topRadius = parent.endRadius - (Math.random() * this.branch_radius_variable_reduction) - this.branch_radius_constant_reduction;
        // Create branch geometry
        let mainBranchMesh = this.makeBranchMesh(topRadius, parent.endRadius, this.branch_length_max);//new Mesh(mainBranchGeo, mainBranchMat);

        if(branchProb == 0){
            let sideBranchMesh = this.makeBranchMesh(0.08, parent.endRadius/4, this.branch_length_max/1.5);//new Mesh(sideBranchGeo, new MeshLambertMaterial({color: GeneratePlantColor() }));
            // sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI/2);
            sideBranchMesh.position.set(-this.branch_length_max/3, 0, 0);
            sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI/2);
            sideBranchMesh.rotateOnAxis(Y_AXIS, Math.random() * (Math.PI/2));  
            mainBranchMesh.add(sideBranchMesh);
        }
        
        mainBranchMesh.position.set(0, this.branch_length_max, 0);
        // mainBranchMesh.rotateY(Math.random() * Math.PI/2); rotated branches needs to self intersect less

        // create & add to parent node
        let n = new PlantNode(parent.depth + 1, parent.endRadius, topRadius, mainBranchMesh, offsetAngle);
        n.mesh.add(mainBranchMesh);
        parent.children.push(n);
        parent.mesh.add(n.mesh);
    }
}

export function rotateBase(mesh: Mesh, angle: number) {
    mesh.translateY(-mesh.geometry.boundingBox.max.y);
    mesh.rotation.z = angle;
    mesh.translateY(mesh.geometry.boundingBox.max.y);
}

/**
 * Plant Graph Data Structure
 */
export class PlantNode {

    public children: PlantNode[] = []

    constructor(public depth: number, public startRadius: number, public endRadius: number, public mesh: Mesh, public offsetAngle: number) {
    
    }

    // clean up resources not automatically freed (material, geometry)
    dispose() {

    }

    t = 0;
    animate() {
        this.children.forEach(n => {
            let angle: number = (Math.PI/60) * Math.sin(this.t) + this.offsetAngle;
            rotateBase(n.mesh, angle);
            n.animate();
        });
        // this.testCube.position.setZ(2 * Math.sin(this.t));
        this.t += 0.01;
    }

}