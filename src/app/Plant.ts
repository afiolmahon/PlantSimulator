import { Mesh, Color, MeshStandardMaterial, CylinderBufferGeometry, SphereBufferGeometry, Geometry, Material } from 'three';
import Prando from 'prando';
import { Z_AXIS, Y_AXIS, inRange } from './utility';
import { LeafNode } from './Leaf';
import { BranchGene, LeafGene} from './Gene';
import { BufferGeometry } from 'three';

const RAD_SEGMENTS = 20;
const HEIGHT_SEGMENTS = 1;

/**
 * Plant Graph Data Structure
 */
export class PlantNode {
    //private LeafGen: LeafNode = new LeafNode();

    public children: PlantNode[] = [];
    public childrenL: LeafNode[] = [];
    public age = 0; // track growth cycles
    public length: number;
    // Graphics Objects
    public branchMesh: Mesh;

    private mat: Material[] = [];

    // tslint:disable-next-line: deprecation
    private geo: BufferGeometry[] = [];

    constructor(public gene: BranchGene, public depth: number, public rng: Prando,
                public radius: number[], public yRot: number, public parentLength: number) {
        this.length = inRange(rng.next(), this.gene.length);
        this.branchMesh = this.makeBranchMesh(radius, this.length, 'root');
    }

    /**
     * Clean up resources not automatically freed (material, geometry)
     */
    dispose() {
        this.mat.forEach(e => e.dispose());
        this.geo.forEach(e => e.dispose());
        this.children.forEach(e => e.dispose());
        this.childrenL.forEach(e => e.dispose());
    }
    removeLeaves(){
        if (this.children.length > 0) {
            this.children.forEach(e => e.removeLeaves());
            this.childrenL.forEach(e=>e.dispose());
        } else { // At the end of a plant
            this.childrenL.forEach(e=>e.dispose());
        }
    }
    addLeavesToAll(season: LeafGene){
        if (this.children.length > 0) {
            this.children.forEach(e => e.addLeavesToAll(season));
            this.branchMesh = this.addLeafToBranch(this.branchMesh, this.length, 6, 12, season);
        } else { // At the end of a plant
            if(this.childrenL.length == 0)
                this.branchMesh = this.addLeafToBranch(this.branchMesh, this.length, 6, 12, season);
        }
       // this.branchMesh = this.addLeafToBranch(this.branchMesh, this.length, 6, 12, this.Fall);
    }
    addLeafToBranch(branch: Mesh, branchLength: number, branchDepth: number, amountLeaves: number, season: LeafGene) : Mesh{
        // Add leaf
            for(var j = branchLength-1, k = 0; j > -branchLength+1; j--, k++){ //Depth of the branch
            for (var i = 0; i < amountLeaves ; i++) { //Rotation around the branch
                let leaf = new LeafNode(this.generateLeafColor(season), 'leaf');
 
                //Tip of branch
                    //leaf.translateY(sideBranchLength - .4);
                leaf.leafMesh.translateY(j * 0.65);
                leaf.leafMesh.rotateZ((i * this.rng.next(-16, 16)));
                leaf.leafMesh.rotateY((i * this.rng.next(-16, 16)));   

                leaf.leafMesh.position.setX(leaf.leafMesh.position.x * (k * 0.08));
                leaf.leafMesh.position.setZ(leaf.leafMesh.position.z * (k * 0.08));

                branch.add(leaf.leafMesh);
                this.childrenL.push(leaf);
            }
        }
        return branch;
    }
    addSideBranch(branch: Mesh, length: number, radMin: number): void {
        const sideBranchLength = (length / 1.5) * this.rng.next();
        var sideBranchMesh = this.makeBranchMesh([radMin / 4, 0.08], sideBranchLength, 'side_branch');
        // Attach side branch
        sideBranchMesh.rotateZ(Math.PI / 2);
        // sideBranchMesh.rotateY(this.rng.next() * (Math.PI / 2));
        sideBranchMesh.translateY((sideBranchLength / 2) + radMin);
      //  branch.add(sideBranchMesh);

      // sideBranchMesh = this.addLeafToBranch(sideBranchMesh,sideBranchLength,6, 12, this.Fall);

        // Attach side branch
        sideBranchMesh.position.set(-sideBranchLength / 3, 0, 0);
        sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI / 2);
        sideBranchMesh.rotateOnAxis(Y_AXIS, this.rng.next() * (Math.PI / 2));
        // Connect
        branch.add(sideBranchMesh);
        
      /*  const leaf = this.LeafGen.makeLeafMesh(this.generateLeafColor(this.Fall));
        leaf.scale.set(0.1, 0.1, 0.1);
        sideBranchMesh.add(leaf);*/
    }

    /**
     * Create a branch to the child and attach it to the parent node
     */
    addChildNode(yRot: number): void {
        const topRadius = this.radius[1] * inRange(this.rng.next(), this.gene.reduction);
        // Create & add to parent node
        const n = new PlantNode(this.gene, this.depth + 1, this.rng, [this.radius[1], topRadius], yRot, this.length);
        // Add side twig and leaf
        if (this.rng.next() >= 0.5) {
            this.addSideBranch(n.branchMesh, length, this.radius[1]);
        }
        // Position & connect to graph
        n.branchMesh.rotateY((Math.PI / 2) - (0.2 * this.rng.next()));
        n.branchMesh.translateY(n.parentLength / 2);
        n.branchMesh.rotation.z = yRot;
        n.branchMesh.translateY(n.length / 2);
        this.branchMesh.add(n.branchMesh);
        this.children.push(n);
    }

    makeBranchMesh(radius: number[], length: number, name: string): Mesh {
        // Allocate Resources
        const mat = new MeshStandardMaterial({ color: this.generatePlantColor(), flatShading: false });
        const geometryBranch = new CylinderBufferGeometry(radius[1], radius[0], length, RAD_SEGMENTS, HEIGHT_SEGMENTS, false);
        const geometryBranchTop = new SphereBufferGeometry(radius[1], RAD_SEGMENTS);
        this.mat.push(mat);
        this.geo.push(geometryBranch);
        this.geo.push(geometryBranchTop);
        // Create Mesh
        const branchMesh = new Mesh(geometryBranch, mat);
        const topMesh = new Mesh(geometryBranchTop, mat);
        branchMesh.name = name;
        topMesh.translateY(length / 2);
        branchMesh.add(topMesh);
        return branchMesh;
    }

    grow(): void {
        // Try to add a node at all leaves
        this.age += 1;
        if (this.children.length > 0) {
            this.children.forEach(e => e.grow());
        } else { // At the end of a plant
            const yRotation = inRange(this.rng.next(), this.gene.parentAngle);
            // Check threshold for minimum feature size
            if (this.radius[1] >= this.gene.minRadius) {
                if (this.rng.next() > this.gene.branchOdds) {
                    this.addChildNode(yRotation / 2);
                } else {
                    this.addChildNode(-yRotation);
                    this.addChildNode(yRotation);
                }
            }
        }
    }

    generatePlantColor(): Color {
        return new Color(inRange(this.rng.next(), this.gene.colorR),
                         inRange(this.rng.next(), this.gene.colorG),
                         inRange(this.rng.next(), this.gene.colorB));
    }
    generateLeafColor(season: LeafGene): Color{
        return new Color(inRange(this.rng.next(), season.colorR),
                         inRange(this.rng.next(), season.colorG),
                         inRange(this.rng.next(), season.colorB));   
    }

    animate(timer: number) {
        const angle: number = (Math.PI / 60) * Math.sin(timer);
        this.branchMesh.translateY(-this.length / 2);
        this.branchMesh.rotation.z = angle + this.yRot;
        this.branchMesh.translateY(this.length / 2);
        this.children.forEach(n => {
            n.animate(timer);
        });
    }
}

/**
 * Create a new trunk PlantNode
 * @param bottomRadius: radius of plant trunk
 */
export function createNewPlant(gene: BranchGene, bottomRadius: number, rng: Prando): PlantNode {
    // Create root node for tree
    const topRadius = bottomRadius - inRange(rng.next(), [0.3, 0.5]);
    const n = new PlantNode(gene, 0, rng, [bottomRadius, topRadius], 0, 0);
    n.branchMesh.translateZ(n.length / 2);          // Adjust Position
    n.branchMesh.rotateX(Math.PI / 2);              // Set plant upright
    return n;
}
