import { CylinderBufferGeometry, Mesh, Color, MeshStandardMaterial } from 'three';
import { SphereBufferGeometry } from 'three';
import { X_AXIS, Y_AXIS, Z_AXIS } from './utility';
import Prando from 'prando';
import { PlantNode } from './Plant';



export class PlantGenerator {
    // Geometric Properties
    public branch_mesh_radial_segments: number = 20;
    public branch_mesh_height_segments: number = 1;
    
    // Branch Properties
    public branch_length_max = 3;
    public branch_radius_reduction: number[] = [0.6, 0.7];
    public branch_radius_min: number = 0.2;
    public branch_pitch_max: number = Math.PI/4;
    public branch_color_r: number[] = [0.0, 0.4];
    public branch_color_g: number[] = [0.6, 1.0];
    public branch_color_b: number[] = [0.0, 0.4];

    // Psuedorandom number
    private rng: Prando;

    
    constructor(seed: number) {
        this.rng = new Prando(seed);
    }

    private getRandom(): number {
        return this.rng.next();
    }

    generatePlantColor(): Color {
        let r = this.branch_color_r[0] + ( (this.branch_color_r[1] - this.branch_color_r[0]) * this.getRandom() );
        let g = this.branch_color_g[0] + ( (this.branch_color_g[1] - this.branch_color_g[0]) * this.getRandom() );
        let b = this.branch_color_b[0] + ( (this.branch_color_b[1] - this.branch_color_b[0]) * this.getRandom() );
        return new Color(r, g, b);
    }

    makeBranchMesh(radius_min: number, radius_max: number, height: number): Mesh {
        let material = new MeshStandardMaterial({color: this.generatePlantColor(), flatShading: false});
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
        let topRadius = lowRadius - 0.3 - (this.getRandom() * 0.2);
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
            if (this.getRandom() >= 0.7) {
            } else { // add double branch
                this.addBranchChildNode(parent, -Math.PI/4, 0.2);
                this.addBranchChildNode(parent, Math.PI/4, 0.2);
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

    /**
     * Create a branch to the child and attach it to the parent node
     * @param parent the parent node
     * @param offsetAngle the angle away from the parent (parallel is zero)
     * @param rotation the rotation of the child about the parent
     */
    addBranchChildNode(parent: PlantNode, offsetAngle: number, rotation: number): void {
        let branchProb = Math.floor(this.getRandom() * 2); // 0 or 1; 0 == child branch ; 1 == no branch

        let reduction_var = (this.branch_radius_reduction[1] - this.branch_radius_reduction[0]) * this.getRandom();
        let topRadius = parent.endRadius * (this.branch_radius_reduction[0] + reduction_var);

        // Add branch geometry
        let mainBranchMesh = this.makeBranchMesh(topRadius, parent.endRadius, this.branch_length_max);//new Mesh(mainBranchGeo, mainBranchMat);
        if(branchProb == 0) {
            let sideBranchMesh = this.makeBranchMesh(0.08, parent.endRadius/4, this.branch_length_max/1.5);//new Mesh(sideBranchGeo, new MeshLambertMaterial({color: GeneratePlantColor() }));
            // sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI/2);
            sideBranchMesh.position.set(-this.branch_length_max/3, 0, 0);
            sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI/2);
            sideBranchMesh.rotateOnAxis(Y_AXIS, this.getRandom() * (Math.PI/2));  
            mainBranchMesh.add(sideBranchMesh);
        }
        
        mainBranchMesh.position.set(0, this.branch_length_max, 0);
        // mainBranchMesh.rotateY(this.getRandom() * Math.PI/2); rotated branches needs to self intersect less

        // create & add to parent node
        let n = new PlantNode(parent.depth + 1, parent.endRadius, topRadius, mainBranchMesh, offsetAngle);
        n.mesh.add(mainBranchMesh);
        parent.children.push(n);
        parent.mesh.add(n.mesh);
    }
}