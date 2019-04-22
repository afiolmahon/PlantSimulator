import Prando from 'prando';
import { inRange } from './utility';

/**
 * Determine Range of Values for generating various plant parameters
 */
export class BranchGene {
    length: number[] = [3, 5];
    pitch: number[] = [0.2, 0.4];
    reduction: number[] = [0.6, 0.7];
    colorR: number[] = [0.0, 0.4];
    colorG: number[] = [0.6, 1.0];
    colorB: number[] = [0.0, 0.4];
    minRadius = 0.2;
    baseRadius = [1, 3];

    constructor(seed: number) {
        const r: Prando = new Prando(seed);
        this.length[1] = inRange(r.next(), [5, 10]);  
    }
}