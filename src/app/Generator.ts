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

const BRANCH_MESH_RADIAL_SEGMENTS = 20;
const BRANCH_MESH_HEIGHT_SEGMENTS = 1;

export class PlantGenerator {

    LeafGen: LeafGenerator = new LeafGenerator();

    // Geometric Properties

    // Branch Properties
    public BRANCH_PITCH: number[] = [0.2, 0.4]; // Larger max pitch -> less stalky
    public BRANCH_LENGTH = [3, 5];
    public BRANCH_RADIUS_REDUCTION: number[] = [0.6, 0.7];
    public BRANCH_RADIUS_MIN = 0.2;
    public BRANCH_COLOR_R: number[] = [0.0, 0.4];
    public BRANCH_COLOR_G: number[] = [0.6, 1.0];
    public BRANCH_COLOR_B: number[] = [0.0, 0.4];

    /**
     * Construct probabilities
     */
    constructor(speciesSeed: number) {
        const r: Prando = new Prando(speciesSeed);
        // this.BRANCH_RADIUS_REDUCTION[0] = inRange(r.next(), [0.3, 0.4]); // largest reduction
        // this.BRANCH_RADIUS_REDUCTION[1] = inRange(r.next(), [0.8, 0.9]); // min reduction
        // this.BRANCH_PITCH[0] = Math.PI / 8;
        // this.BRANCH_PITCH[1] = inRange(r.next(), [Math.PI / 4, (Math.PI / 2) - 0.2]);
        // this.BRANCH_LENGTH[0] = inRange(r.next(), [1, 4]);
        // this.BRANCH_LENGTH[1] = this.BRANCH_LENGTH[0] + inRange(r.next(), [0, 5]);
    }

    generatePlantColor(rng: Prando): Color {
        return new Color(inRange(rng.next(), this.BRANCH_COLOR_R),
                         inRange(rng.next(), this.BRANCH_COLOR_G),
                         inRange(rng.next(), this.BRANCH_COLOR_B));
    }

    addSideBranch(rng: Prando, branch: Mesh, height: number, radMin: number): void {
        const sideBranchLength = (height / 1.5) * rng.next();
        const sideBranchMesh = this.makeBranchMesh(rng, 0.08, radMin / 4, sideBranchLength, this.generatePlantColor(rng), 'side_branch');
        // Add leaf
        const leaf = this.LeafGen.makeLeafMesh();
        leaf.scale.set(0.1, 0.1, 0.1);
        sideBranchMesh.add(leaf);
        leaf.translateY(sideBranchLength / 2);
        // Attach side branch
        sideBranchMesh.position.set(-sideBranchLength / 2, 0, 0);
        sideBranchMesh.rotateOnAxis(Z_AXIS, Math.PI / 2);
        sideBranchMesh.rotateOnAxis(Y_AXIS, rng.next() * (Math.PI / 2));
        branch.add(sideBranchMesh);
    }

    makeBranchMesh(rng: Prando, radMin: number, radMax: number, height: number, branchColor: Color, name: string): Mesh {
        const mat = new MeshStandardMaterial({color: branchColor, flatShading: false});
        // Cyliner
        const branchGeometry = new CylinderBufferGeometry(radMin, radMax, height,
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
        if (rng.next() >= 0.5) {
            this.addSideBranch(rng, branchMesh, height, radMin);
        }
        return branchMesh;
    }

    /**
     * Create a new trunk PlantNode
     * @param lowRadius: radius of plant trunk
     */
    createNewPlant(lowRadius: number, rng: Prando, age: number): PlantNode {
        // Create Root Node
        const topRadius = lowRadius - inRange(rng.next(), [0.3, 0.5]);
        const rootLength = inRange(rng.next(), this.BRANCH_LENGTH);
        const mesh = this.makeBranchMesh(rng, topRadius, lowRadius, rootLength, this.generatePlantColor(rng), 'root');
        const n = new PlantNode(0, rng, lowRadius, topRadius, mesh, 0);
        n.mesh.translateZ(rootLength / 2);
        n.mesh.rotateX(Math.PI / 2);
        n.mesh.rotateY(Math.PI / 2);
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
            const roll = Math.PI / 2;
            const pitch = inRange(node.rng.next(), this.BRANCH_PITCH);
            // Check threshold for minimum feature size
            if (node.radius >=  this.BRANCH_RADIUS_MIN) {
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
        const topRadius = parent.radius * inRange(parent.rng.next(), this.BRANCH_RADIUS_REDUCTION);
        const branchLength = inRange(parent.rng.next(), this.BRANCH_LENGTH);
        const mainBranchMesh = this.makeBranchMesh(parent.rng, topRadius, parent.radius, branchLength,
            this.generatePlantColor(parent.rng), 'main_branch');
        mainBranchMesh.rotateY(yRot);
        // TODO: Fix height offset
        mainBranchMesh.translateY(branchLength);
        // create & add to parent node
        const n = new PlantNode(parent.depth + 1, parent.rng, parent.radius, topRadius, mainBranchMesh, zRot);
        parent.children.push(n);
        parent.mesh.add(n.mesh);
    }
}
