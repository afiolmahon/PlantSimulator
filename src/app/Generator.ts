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
    public BRANCH_MESH_RADIAL_SEGMENTS = 20;
    public BRANCH_MESH_HEIGHT_SEGMENTS = 1;

    // Branch Properties
    public BRANCH_LENGTH = [3, 4];
    public BRANCH_RADIUS_REDUCTION: number[] = [0.6, 0.7];
    public BRANCH_RADIUS_MIN = 0.2;
    public BRANCH_PITCH_MAX: number = Math.PI / 4;
    public BRANCH_COLOR_R: number[] = [0.0, 0.4];
    public BRANCH_COLOR_G: number[] = [0.6, 1.0];
    public BRANCH_COLOR_B: number[] = [0.0, 0.4];

    // Psuedorandom number
    private rng: Prando;

    constructor() {}

    private rand(): number { return this.rng.next(); }

    generatePlantColor(): Color {
        return new Color(inRange(this.rand(), this.BRANCH_COLOR_R),
                         inRange(this.rand(), this.BRANCH_COLOR_G),
                         inRange(this.rand(), this.BRANCH_COLOR_B));
    }

    makeBranchMesh(radMin: number, radMax: number, height: number, branchColor: Color, name: string): Mesh {
        const mat = new MeshStandardMaterial({color: branchColor, flatShading: false});
        // Cyliner
        const branchGeometry = new CylinderBufferGeometry(radMin, radMax, height,
            this.BRANCH_MESH_RADIAL_SEGMENTS, this.BRANCH_MESH_HEIGHT_SEGMENTS, false);
        const branchMesh = new Mesh(branchGeometry, mat);
        branchMesh.name = name;
        branchMesh.geometry.computeBoundingBox();
        // Top piece
        const topGeometry = new SphereBufferGeometry(radMin, this.BRANCH_MESH_RADIAL_SEGMENTS);
        const topMesh = new Mesh(topGeometry, mat);
        topMesh.translateY(branchMesh.geometry.boundingBox.max.y);
        branchMesh.add(topMesh);
        // Add side twig and leaf
        if (this.rand() >= 0.5) {
            const sideBranchLength = (height / 1.5) * this.rand();
            const sideBranchMesh = this.makeBranchMesh(0.08, radMin / 4, sideBranchLength,
                this.generatePlantColor(), 'side_branch');
            // Add leaf
            const leaf = this.LeafGen.makeLeafMesh();
            leaf.scale.set(0.1, 0.1, 0.1);
            sideBranchMesh.add(leaf);
            leaf.translateY(sideBranchLength / 2);
            // Attach side branch
            sideBranchMesh.position.set(-sideBranchLength / 2, 0, 0);
            sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI / 2);
            sideBranchMesh.rotateOnAxis(Y_AXIS, this.rand() * (Math.PI / 2));
            branchMesh.add(sideBranchMesh);
        }
        branchMesh.position.set(0, height, 0);

        return branchMesh;
    }

    /**
     * Create a new trunk PlantNode
     * @param lowRadius: radius of plant trunk
     */
    createNewPlant(lowRadius: number, seed: number, age: number): PlantNode {
        // Create Root Node
        this.rng = new Prando(seed);
        const topRadius = lowRadius - inRange(this.rand(), [0.3, 0.5]);
        const rootLength = inRange(this.rand(), this.BRANCH_LENGTH);
        const mesh = this.makeBranchMesh(topRadius, lowRadius, rootLength, this.generatePlantColor(), 'root');
        const n = new PlantNode(0, seed, lowRadius, topRadius, mesh, 0);
        n.mesh.translateZ(rootLength / 2);
        n.mesh.rotateX(Math.PI / 2);
        // Age
        for (let i = 0; i < age; ++i) { this.growPlant(n); }
        return n;
    }

    /**
     * Triggers growth of the PlantNode and all of its children, call once on root node and updates
     * will propagate to entire plant.
     */
    growPlant(node: PlantNode): void {
        // Try to add a node at all leaves
        node.age += 1;
        if (node.children.length > 0) {
            node.children.forEach(e => { this.growPlant(e); });
        } else { // At the end of a plant
            const pitch = Math.PI / 4;
            const roll = Math.PI / 2;
            // Check threshold for minimum feature size
            if (node.endRadius >=  this.BRANCH_RADIUS_MIN) {
                console.log('grow branches');
                this.addBranchChildNode(node, -pitch, roll);
                this.addBranchChildNode(node, pitch, roll);
            }
            console.log('Added Child!');
        }
    }

    /**
     * Create a branch to the child and attach it to the parent node
     * @param parent the parent node
     * @param offsetAngle the angle away from the parent (parallel is zero)
     * @param rotation the rotation of the child about the parent
     */
    addBranchChildNode(parent: PlantNode, zRot: number, yRot: number): void {
        // Add branch geometry
        const topRadius = parent.endRadius * inRange(this.rand(), this.BRANCH_RADIUS_REDUCTION);
        const branchLength = inRange(this.rand(), this.BRANCH_LENGTH);
        const mainBranchMesh = this.makeBranchMesh(topRadius, parent.endRadius, branchLength, this.generatePlantColor(), 'main_branch');
        mainBranchMesh.rotateY(yRot);
        // create & add to parent node
        const n = new PlantNode(parent.depth + 1, parent.seed, parent.endRadius, topRadius, mainBranchMesh, zRot);
        parent.children.push(n);
        parent.mesh.add(n.mesh);
    }
}
