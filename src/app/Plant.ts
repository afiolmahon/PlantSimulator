import { Mesh, Color, MeshStandardMaterial, CylinderBufferGeometry, SphereBufferGeometry } from 'three';
import Prando from 'prando';
import { Z_AXIS, Y_AXIS, inRange, X_AXIS } from './utility';
import { LeafGenerator } from './Leaf';
import { BranchGene } from './Gene';

const BRANCH_MESH_RADIAL_SEGMENTS = 20;
const BRANCH_MESH_HEIGHT_SEGMENTS = 1;

/**
 * Plant Graph Data Structure
 */
export class PlantNode {
    private LeafGen: LeafGenerator = new LeafGenerator();
    public children: PlantNode[] = [];
    public age = 0; // track growth cycles
    // Geometric Properties
    public branchMesh: Mesh;
    public length: number;

    constructor(public gene: BranchGene, public depth: number, public rng: Prando,
                public radius: number[], public yRot: number, public parentLength: number) {
        this.length = inRange(rng.next(), this.gene.length);
        this.branchMesh = this.makeBranchMesh(radius, this.length, 'root');
    }

    addSideBranch(branch: Mesh, length: number, radMin: number): void {
        const sideBranchLength = (length / 1.5) * this.rng.next();
        const sideBranchMesh = this.makeBranchMesh([radMin / 4, 0.08], sideBranchLength, 'side_branch');
        // Add leaf
        const leaf = this.LeafGen.makeLeafMesh();
        leaf.scale.set(0.1, 0.1, 0.1);
        leaf.translateY(sideBranchLength / 2);
        // Attach side branch
        sideBranchMesh.position.set(-sideBranchLength / 2, 0, 0);
        sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI / 2);
        sideBranchMesh.rotateOnAxis(Y_AXIS, this.rng.next() * (Math.PI / 2));
        sideBranchMesh.add(leaf);
        // Connect
        branch.add(sideBranchMesh);
    }

    /**
     * Create a branch to the child and attach it to the parent node
     */
    addChildNode(yRot: number): void {
        const topRadius = this.radius[1] * inRange(this.rng.next(), this.gene.reduction);
        // Create & add to parent node
        const n = new PlantNode(this.gene, this.depth + 1, this.rng, [this.radius[1], topRadius], yRot, this.length);
        // Add side twig and leaf
        if (this.rng.next() >= 0.5) { this.addSideBranch(n.branchMesh, length, this.radius[1]); }
        // Position & connect to graph
        n.branchMesh.translateY(n.parentLength / 2);
        n.branchMesh.rotation.z = yRot;
        n.branchMesh.translateY(n.length / 2);
        this.branchMesh.add(n.branchMesh);
        this.children.push(n);
    }

    makeBranchMesh(radius: number[], length: number, name: string): Mesh {
        const mat = new MeshStandardMaterial({ color: this.generatePlantColor(), flatShading: false });
        // Cyliner
        const branchGeometry = new CylinderBufferGeometry(radius[1], radius[0], length,
            BRANCH_MESH_RADIAL_SEGMENTS,
            BRANCH_MESH_HEIGHT_SEGMENTS, false);
        const branchMesh = new Mesh(branchGeometry, mat);
        branchMesh.geometry.computeBoundingBox();
        branchMesh.name = name;
        // Top piece
        const topGeometry = new SphereBufferGeometry(radius[1], BRANCH_MESH_RADIAL_SEGMENTS);
        const topMesh = new Mesh(topGeometry, mat);
        topMesh.translateY(length / 2);
        branchMesh.add(topMesh);
        return branchMesh;
    }

    grow(): void {
        // Try to add a node at all leaves
        this.age += 1;
        console.log(this.age);
        if (this.children.length > 0) {
            this.children.forEach(e => e.grow());
        } else { // At the end of a plant
            const yRotation = inRange(this.rng.next(), this.gene.pitch);
            // Check threshold for minimum feature size
            if (this.radius[1] >= this.gene.minRadius) {
                console.log('grow branches');
                this.addChildNode(-yRotation);
                this.addChildNode(yRotation);
            }
            console.log('Added Child!');
        }
    }

    generatePlantColor(): Color {
        return new Color(inRange(this.rng.next(), this.gene.colorR),
                         inRange(this.rng.next(), this.gene.colorG),
                         inRange(this.rng.next(), this.gene.colorB));
    }

    // clean up resources not automatically freed (material, geometry)
    dispose() { }

    animate(timer: number) {
        const angle: number = (Math.PI / 60) * Math.sin(timer);
        this.branchMesh.translateY(-this.length / 2);
        this.branchMesh.rotation.z = angle + this.yRot;
        this.branchMesh.translateY(this.length / 2);
        // rotateBase(this.branchMesh, angle);
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
    // Create Root Node
    const topRadius = bottomRadius - inRange(rng.next(), [0.3, 0.5]);
    const n = new PlantNode(gene, 0, rng, [bottomRadius, topRadius], 0, 0);
    n.branchMesh.translateZ(n.length / 2);
    n.branchMesh.rotateX(Math.PI / 2); // Set plant upright
    // n.branchMesh.rotateY(Math.PI / 2);
    return n;
}
