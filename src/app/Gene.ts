import Prando from 'prando';

// Language System components, transitions and characteristics are assigned to symbols
export const PTYPE = {
    ROOT: 0,
    SHURB_TRUNK: 1,
    TALL_TRUNK: 2,
    GRASS: 3,
    BRANCH_LONG: 4,
    BRANCH_SHORT: 5
}

// Describes transitions between the symbols of the language
export const TREE_LANG = {

}

function getBranchOdds(ptype: number, r: Prando): number {
    const rand = r.next();
    if (ptype == PTYPE.GRASS) {
        console.log("grass!");
        return 0.0;
    } else if (ptype == PTYPE.SHURB_TRUNK) {
        console.log("shrub!");

        return 0.7 * (rand * 0.3);
    } else {
        console.log("default!");
        const base = 0.2;
        return base + (rand * (1 - base)); 
    }
}

function getBranchLength(baseRadius: number[], ptype: number, r: Prando): number[] {
    var radRadio = [1, 1];
    if (ptype == PTYPE.BRANCH_LONG) {
        radRadio = [3, 3];
    } else if (ptype == PTYPE.BRANCH_SHORT) {
        radRadio = [1, 2];
    } else {
        radRadio = [1,6]
    }
    const lengthMin = baseRadius[0] * (radRadio[0] + (radRadio[1] * r.next()));
    const lengthMax = lengthMin + (4 * r.next());
    return [lengthMin, lengthMax];
}

/**
 * Describes language grammar and what symbols can follow a parent type
 * @param ptype parent type
 * @param rand random value for choosing between possible transitions
 */
export function getTypeTransition(ptype: number, rng: Prando): number {
    const rand = rng.next();
    if (ptype == PTYPE.ROOT) {
        if (rand <= 0.33) {
            return PTYPE.GRASS;
        } else if (rand <= 0.66) {
            return PTYPE.TALL_TRUNK;
        } else {
            return PTYPE.SHURB_TRUNK;
        }
    } else if (ptype == PTYPE.SHURB_TRUNK) {
        if (rand <= 0.5) {
            return PTYPE.SHURB_TRUNK;
        } else {
            return PTYPE.BRANCH_SHORT;
        }
    } else if (ptype == PTYPE.TALL_TRUNK) {
        if (rand <= 0.5) {
            return PTYPE.TALL_TRUNK;
        } else if (rand <= 0.75) {
            return PTYPE.BRANCH_LONG;
        } else {
            return PTYPE.BRANCH_SHORT;
        }
    } else if (ptype == PTYPE.GRASS) {
        return PTYPE.GRASS;
    } else if (ptype == PTYPE.BRANCH_LONG) {
        if (rand <= 0.8) {
            return PTYPE.BRANCH_LONG;
        } else {
            return PTYPE.BRANCH_SHORT;
        }
    } else if (ptype == PTYPE.BRANCH_SHORT) {
        return PTYPE.BRANCH_SHORT;
    } else {
        return PTYPE.ROOT;
    }
}

/**
 * Determine Range of Values for generating various plant parameters
 */
export class BranchGene {
    public length: number[];
    public parentAngle: number[];
    public reduction: number[] = [0.6, 0.7];
    public colorR: number[] = [0.0, 0.4];
    public colorG: number[] = [0.6, 1.0];
    public colorB: number[] = [0.0, 0.4];
    public minRadius = 0.2;
    public baseRadius = [1, 5];
    public branchOdds: number;

    constructor(public seed: number, public ptype: number) {
        this.seed = seed;
        const r: Prando = new Prando(this.seed);
        this.branchOdds = getBranchOdds(ptype, r)
        this.length = getBranchLength(this.baseRadius, ptype, r);
        // Generate branch angle away from parent
        const angleMin = Math.PI / 16;
        const angleMax = angleMin + (Math.PI / 4 * r.next());
        this.parentAngle = [angleMin, angleMax];
    }
}

export class LeafGene{

    colorR: number[] = [0.6, 0.8];
    colorG: number[] = [0.2, 0.6];
    colorB: number[] = [0.0, 0.4];

    constructor(cR: number[], cG: number[], cB: number[]) {
        this.colorR = cR;
        this.colorG = cG;
        this.colorB = cB;
    }
}
