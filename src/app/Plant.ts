import { Mesh, Color, MeshStandardMaterial, CylinderBufferGeometry, SphereBufferGeometry } from 'three';
import Prando from 'prando';
import { Z_AXIS, Y_AXIS, inRange } from './utility';
import { LeafGenerator } from './Leaf';
import { BranchGene } from './Gene';

const BRANCH_MESH_RADIAL_SEGMENTS = 20;
const BRANCH_MESH_HEIGHT_SEGMENTS = 1;

export function rotateBase(mesh: Mesh, angle: number) {
    mesh.geometry.computeBoundingBox();
    mesh.translateY(-mesh.geometry.boundingBox.max.y);
    mesh.rotation.z = angle;
    mesh.translateY(mesh.geometry.boundingBox.max.y);
}

/**
 * Plant Graph Data Structure
 */
export class PlantNode {
    private LeafGen: LeafGenerator = new LeafGenerator();
    public children: PlantNode[] = [];
    public age = 0; // track growth cycles
    private animationTimer = 0;
    // Geometric Properties
    public mesh: Mesh;
    public length: number;
    public yRotation = 0; // yOffset from parent axis

    constructor(public gene: BranchGene, public depth: number, public rng: Prando, public radius: number[]) {
        this.length = inRange(rng.next(), this.gene.length);
        this.mesh = this.makeBranchMesh(radius, this.length, 'root');
    }

    addSideBranch(branch: Mesh, length: number, radMin: number): void {
        const sideBranchLength = (length / 1.5) * this.rng.next();
        const sideBranchMesh = this.makeBranchMesh([radMin / 4, 0.08], sideBranchLength, 'side_branch');
        // Add leaf
        const leaf = this.LeafGen.makeLeafMesh();
        leaf.scale.set(0.1, 0.1, 0.1);
        sideBranchMesh.add(leaf);
        leaf.translateY(sideBranchLength / 2);
        // Attach side branch
        sideBranchMesh.position.set(-sideBranchLength / 2, 0, 0);
        sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI / 2);
        sideBranchMesh.rotateOnAxis(Y_AXIS, this.rng.next() * (Math.PI / 2));
        branch.add(sideBranchMesh);
    }

    /**
     * Create a branch to the child and attach it to the parent node
     */
    addChildNode(yRot: number): void {
        const topRadius = this.radius[1] * inRange(this.rng.next(), this.gene.reduction);
        // create & add to parent node
        const n = new PlantNode(this.gene, this.depth + 1, this.rng, [this.radius[1], topRadius]);
        n.yRotation = yRot;
        this.children.push(n);
        // Add side twig and leaf
        if (this.rng.next() >= 0.5) {
            this.addSideBranch(n.mesh, length, this.radius[1]);
        }
        n.mesh.rotateY(Math.PI / 4);
        this.mesh.add(n.mesh);
    }

    makeBranchMesh(radius: number[], length: number, name: string): Mesh {
        const mat = new MeshStandardMaterial({ color: this.generatePlantColor(), flatShading: false });
        // Cyliner
        const branchGeometry = new CylinderBufferGeometry(radius[1], radius[0], length,
            BRANCH_MESH_RADIAL_SEGMENTS,
            BRANCH_MESH_HEIGHT_SEGMENTS, false);
        const branchMesh = new Mesh(branchGeometry, mat);
        branchMesh.name = name;
        branchMesh.geometry.computeBoundingBox();
        // Top piece
        const topGeometry = new SphereBufferGeometry(radius[1], BRANCH_MESH_RADIAL_SEGMENTS);
        const topMesh = new Mesh(topGeometry, mat);
        topMesh.translateY(branchMesh.geometry.boundingBox.max.y);
        branchMesh.add(topMesh);
        // TODO: Fix height offset
        branchMesh.translateY(length);
        return branchMesh;
    }

    grow(): void {
        // Try to add a node at all leaves
        this.age += 1;
        console.log(this.age);
        if (this.children.length > 0) {
            this.children.forEach(e => e.grow());
        } else { // At the end of a plant
            const pitch = inRange(this.rng.next(), this.gene.pitch);
            // Check threshold for minimum feature size
            if (this.radius[1] >= this.gene.minRadius) {
                console.log('grow branches');
                this.addChildNode(-pitch);
                this.addChildNode(pitch);
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

    animate() {
        const angle: number = (Math.PI / 60) * Math.sin(this.animationTimer) + this.yRotation;
        rotateBase(this.mesh, angle);
        this.children.forEach(n => {
            n.animate();
        });
        this.animationTimer += 0.02;
    }
}

/**
 * Create a new trunk PlantNode
 * @param bottomRadius: radius of plant trunk
 */
export function createNewPlant(gene: BranchGene, bottomRadius: number, rng: Prando): PlantNode {
    // Create Root Node
    const topRadius = bottomRadius - inRange(rng.next(), [0.3, 0.5]);
    const n = new PlantNode(gene, 0, rng, [bottomRadius, topRadius]);
    n.mesh.translateZ(n.length / 2);
    n.mesh.rotateX(Math.PI / 2);
    n.mesh.rotateY(Math.PI / 2);
    return n;
}
