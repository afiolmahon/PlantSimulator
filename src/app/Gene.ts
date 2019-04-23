import Prando from 'prando';

/**
 * Determine Range of Values for generating various plant parameters
 */
export class BranchGene {
    length: number[];
    parentAngle: number[];
    reduction: number[] = [0.6, 0.7];
    colorR: number[] = [0.0, 0.4];
    colorG: number[] = [0.6, 1.0];
    colorB: number[] = [0.0, 0.4];
    minRadius = 0.2;
    baseRadius = [1, 5];
    branchOdds: number;

    constructor(seed: number) {
        const r: Prando = new Prando(seed);
        // Generate branching probability
        const base = 0.2;
        this.branchOdds = base + (Math.random() * (1 - base));
        // Generate Length
        const lengthMin = this.baseRadius[0] * (1 + (6 * r.next()));
        const lengthMax = lengthMin + (4 * r.next());
        this.length = [lengthMin, lengthMax];
        // Generate branch angle away from parent
        const angleMin = Math.PI / 16;
        const angleMax = angleMin + (Math.PI / 4 * r.next());
        this.parentAngle = [angleMin, angleMax];

    }
}
