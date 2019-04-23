import { CylinderBufferGeometry, Mesh, Color, MeshStandardMaterial } from 'three';
import { SphereBufferGeometry } from 'three';
import { X_AXIS, Y_AXIS, Z_AXIS } from './utility';
import Prando from 'prando';
import { PlantNode } from './Plant';
import { LeafGenerator } from './Leaf';

/**
 * Interpolate value from range, 0 gives range min, 1 gives range max, 0.5 would give range mean
 * @param position: position in range 0 corresponds to min value and 1 to max value
 * @param range: 2 values specifying a range min and max
 */
function inRange(position: number, range: number[]): number { return range[0] + ( (range[1] - range[0]) * position); }

export class PlantGenerator {

    LeafGen: LeafGenerator = new LeafGenerator();

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

    public leaf_color_r: number[] = [0.6, 0.8];
    public leaf_color_g: number[] = [0.2, 0.6];
    public leaf_color_b: number[] = [0.0, 0.4];

    // Psuedorandom number
    private rng: Prando;
    
    constructor(seed: number) {
        this.rng = new Prando(seed);
    }

    private rand(): number { return this.rng.next(); }

    generatePlantColor(): Color {
        return new Color(inRange(this.rand(), this.branch_color_r),
                         inRange(this.rand(), this.branch_color_g),
                         inRange(this.rand(), this.branch_color_b));
    }

    generateLeafColor(): Color{
         return new Color(inRange(this.rand(), this.leaf_color_r),
                         inRange(this.rand(), this.leaf_color_g),
                         inRange(this.rand(), this.leaf_color_b));   
    }

    makeBranchMesh(radius_min: number, radius_max: number, height: number, color: Color, name: string): Mesh {
        let mat = new MeshStandardMaterial({color: color, flatShading: false});
        // cylinder
        let branch_geo = new CylinderBufferGeometry(radius_min, radius_max, height, this.branch_mesh_radial_segments, this.branch_mesh_height_segments, false);
        let m = new Mesh(branch_geo, mat)
        m.name = name;
        m.geometry.computeBoundingBox();
        //top
        let top_geo = new SphereBufferGeometry(radius_min, this.branch_mesh_radial_segments);
        let top_mesh = new Mesh(top_geo, mat);
        top_mesh.translateY(m.geometry.boundingBox.max.y);
        m.add(top_mesh);
        return m;
    }
    
    /**
     * Create a new trunk PlantNode
     * @param lowRadius radius of plant trunk
     */
    createRootPlantNode(lowRadius: number): PlantNode {
        let topRadius = lowRadius - inRange(this.rand(), [0.3, 0.5])
        let mesh = this.makeBranchMesh(topRadius, lowRadius, this.branch_length_max, this.generatePlantColor(), "root");
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
        let pitch = Math.PI/4;
        let roll = Math.PI/2;
        // Check threshold for minimum feature size
        if (parent.endRadius >=  this.branch_radius_min) {
            if (this.rand() >= 0.7) {
            } else { // add double branch
                this.addBranchChildNode(parent, -pitch, roll);
                this.addBranchChildNode(parent, pitch, roll);
            }
        }
    }

    /**
     * Triggers growth of the PlantNode and all of its children, call once on root node and updates
     * will propagate to entire plant.
     * @param node node to grow
     */
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
        let branchProb = Math.floor(this.rand() * 2); // 0 or 1; 0 == child branch ; 1 == no branch
        let reduction_var = (this.branch_radius_reduction[1] - this.branch_radius_reduction[0]) * this.rand();
        let topRadius = parent.endRadius * (this.branch_radius_reduction[0] + reduction_var);

        // Add branch geometry
        let mainBranchMesh = this.makeBranchMesh(topRadius, parent.endRadius, this.branch_length_max, this.generatePlantColor(), "main_branch");//new Mesh(mainBranchGeo, mainBranchMat);
        if(branchProb == 0) {
            let sideBranchLength = this.branch_length_max/1.5;
            let sideBranchMesh = this.makeBranchMesh(0.08, parent.endRadius/4, sideBranchLength, this.generatePlantColor(), "side_branch");//new Mesh(sideBranchGeo, new MeshLambertMaterial({color: GeneratePlantColor() }));
            /*// Add leaf
            for(var j = 3; j > 0; j--){ //Depth of the branch
            for (var i = 0; i < 8 ; i++) { //Rotation around the branch
                let leaf = this.LeafGen.makeLeafMesh(this.generateLeafColor());
                sideBranchMesh.add(leaf); 
                //Tip of branch
                    //leaf.translateY(sideBranchLength - .4);
                leaf.translateY(sideBranchLength/2 - (.4 * j));
                leaf.rotateZ(45 + (i * 15));
                //leaf.rotateY(90);   
            }
        }*/
            sideBranchMesh.position.set(-this.branch_length_max/3, 0, 0);
            sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI/2);
            sideBranchMesh.rotateOnAxis(Y_AXIS, this.rand() * (Math.PI/2));  
            mainBranchMesh.add(sideBranchMesh);
        }
        
        mainBranchMesh.position.set(0, this.branch_length_max, 0);
        mainBranchMesh.rotateY(rotation);
        // create & add to parent node
        let n = new PlantNode(parent.depth + 1, parent.endRadius, topRadius, mainBranchMesh, offsetAngle);
        parent.children.push(n);
        parent.mesh.add(n.mesh);
    }

    populateLeaves(node: PlantNode){
        // Add leaf
            for(var j = 3; j > 0; j--){ //Depth of the branch
            for (var i = 0; i < 8 ; i++) { //Rotation around the branch
                let leaf = this.LeafGen.makeLeafMesh(this.generateLeafColor());
                node.mesh.add(leaf); 
                //Tip of branch
                    //leaf.translateY(sideBranchLength - .4);
                leaf.translateY(this.branch_length_max/2 - (.4 * j));
                leaf.rotateZ(45 + (i * 15));
                //leaf.rotateY(90);   
            }
        }
    }

    addLeafNode(node: PlantNode){
        // Try to add a node at all leaves
        /*if(node.mesh.name == "side_branch"){
             // Add leaf
            for(var j = 3; j > 0; j--){ //Depth of the branch
            for (var i = 0; i < 8 ; i++) { //Rotation around the branch
                let leaf = this.LeafGen.makeLeafMesh(this.generateLeafColor());
                node.mesh.add(leaf); 
                //Tip of branch
                    //leaf.translateY(sideBranchLength - .4);
                leaf.translateY(this.branch_length_max/2 - (.4 * j));
                leaf.rotateZ(45 + (i * 15));
                //leaf.rotateY(90);   
            }
        }
        }*/
        if(node.mesh.name == "main_branch"){
             
        }
        if (node.children.length > 0) {
            //this.populateLeaves(node);
            node.children.forEach(e => {this.addLeafNode(e)});
        } else { // Main Branch
            console.log(node.mesh.name + "\n");
        }
    }
}