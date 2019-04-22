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
    private animationTimer = 0;
    public children: PlantNode[] = [];

    public age = 0; // track growth cycles

    public BRANCH_COLOR_R: number[] = [0.0, 0.4];
    public BRANCH_COLOR_G: number[] = [0.6, 1.0];
    public BRANCH_COLOR_B: number[] = [0.0, 0.4];
    public mesh: Mesh;

    public gene: BranchGene = new BranchGene();
    LeafGen: LeafGenerator = new LeafGenerator();

    public length: number;

    constructor(public depth: number, public rng: Prando, public parentRadius: number, public radius: number, public offsetAngle: number) {
        this.length = inRange(rng.next(), this.gene.length);
        this.mesh = this.makeBranchMesh(radius, parentRadius, this.length, 'root');
    }

    addSideBranch( branch: Mesh, height: number, radMin: number): void {
        const sideBranchLength = (height / 1.5) * this.rng.next();
        const sideBranchMesh = this.makeBranchMesh(0.08,
             radMin / 4, sideBranchLength, 'side_branch');
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
     * @param parent the parent node
     * @param offsetAngle the angle away from the parent (parallel is zero)
     * @param rotation the rotation of the child about the parent
     */
    addBranchChildNode(zRot: number, yRot: number): void {
        // Add branch geometry
        const topRadius = this.radius * inRange(this.rng.next(), this.gene.reduction);
        const branchLength = inRange(this.rng.next(), this.gene.length);
        const mainBranchMesh = this.makeBranchMesh(topRadius, this.radius, branchLength, 'main_branch');

        // create & add to parent node
        const n = new PlantNode(this.depth + 1, this.rng, this.radius, topRadius, yRot);
        this.children.push(n);
        this.mesh.add(n.mesh);
    }

    makeBranchMesh(radMin: number, radMax: number, length: number, name: string): Mesh {
        const mat = new MeshStandardMaterial({color: this.generatePlantColor(), flatShading: false});
        // Cyliner
        const branchGeometry = new CylinderBufferGeometry(radMin, radMax, length,
                                                          BRANCH_MESH_RADIAL_SEGMENTS,
                                                          BRANCH_MESH_HEIGHT_SEGMENTS, false);
        const branchMesh = new Mesh(branchGeometry, mat);
        branchMesh.name = name;
        branchMesh.geometry.computeBoundingBox();
        // Top piece
        const topGeometry = new SphereBufferGeometry(radMin, BRANCH_MESH_RADIAL_SEGMENTS);
        const topMesh = new Mesh(topGeometry, mat);
        topMesh.translateY(branchMesh.geometry.boundingBox.max.y);
        branchMesh.add(topMesh);
        // Add side twig and leaf
        if (this.rng.next() >= 0.5) {
            this.addSideBranch(branchMesh, length, radMin);
        }
        // TODO: Fix height offset
        branchMesh.translateY(length);
        return branchMesh;
    }

    grow(): void {
        // Try to add a node at all leaves
        this.age += 1;
        console.log(this.age);
        if (this.children.length > 0) {
            this.children.forEach(e => this.grow());
        } else { // At the end of a plant
            const roll = Math.PI / 2;
            const pitch = inRange(this.rng.next(), this.gene.pitch);
            // Check threshold for minimum feature size
            if (this.radius >=  this.gene.minRadius) {
                console.log('grow branches');
                this.addBranchChildNode(-pitch, roll);
                this.addBranchChildNode(pitch, roll);
            }
            console.log('Added Child!');
        }
    }

    generatePlantColor(): Color {
        return new Color(inRange(this.rng.next(), this.BRANCH_COLOR_R),
                         inRange(this.rng.next(), this.BRANCH_COLOR_G),
                         inRange(this.rng.next(), this.BRANCH_COLOR_B));
    }

    // clean up resources not automatically freed (material, geometry)
    dispose() {}

    animate() {
        const angle: number = (Math.PI / 60) * Math.sin(this.animationTimer) + this.offsetAngle;
        rotateBase(this.mesh, angle);
        this.children.forEach(n => {
            n.animate();
        });
        this.animationTimer += 0.02;
    }
}

/**
 * Create a new trunk PlantNode
 * @param lowRadius: radius of plant trunk
 */
export function createNewPlant(lowRadius: number, rng: Prando): PlantNode {
    // Create Root Node
    const topRadius = lowRadius - inRange(rng.next(), [0.3, 0.5]);
    const n = new PlantNode(0, rng, lowRadius, topRadius, 0);
    n.mesh.translateZ(n.length / 2);
    n.mesh.rotateX(Math.PI / 2);
    n.mesh.rotateY(Math.PI / 2);
    // Age
    return n;
}
