import Prando from 'prando';
import { inRange } from './utility';

/**
 * Determine Range of Values for generating various plant parameters
 */
export class BranchGene {
    length: number[] = [3, 5];
    pitch: number[] = [0.2, 0.4];
    reduction: number[] = [0.6, 0.7];
    color_r: number[] = [0.0, 0.4];
    color_g: number[] = [0.6, 1.0];
    color_b: number[] = [0.0, 0.4];
    minRadius = 0.2;
}

export class PlantGenerator {
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

}
