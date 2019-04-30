import Prando from 'prando';

// Language System components, transitions and characteristics are assigned to symbols
export const PTYPE = {
    ROOT: 0,
    SHURB_TRUNK: 1,
    TALL_TRUNK: 2,
    GRASS: 3,
    BRANCH_LONG: 4,
    BRANCH_SHORT: 5
};

function getBranchOdds(ptype: number, r: Prando): number {
    const rand = r.next();
    if (ptype === PTYPE.GRASS) {
        return 0.0;
    } else if (ptype === PTYPE.SHURB_TRUNK) {
        return 0.7 * (rand * 0.3);
    } else {
        const base = 0.2;
        return base + (rand * (1 - base));
    }
}

function getBranchLength(baseRadius: number[], ptype: number, r: Prando): number[] {
    let radRatio = [1, 1];
    if (ptype === PTYPE.BRANCH_LONG) {
        radRatio = [3, 3];
    } else if (ptype === PTYPE.BRANCH_SHORT) {
        radRatio = [1, 2];
    } else {
        radRatio = [1, 6];
    }
    const lengthMin = baseRadius[0] * (radRatio[0] + (radRatio[1] * r.next()));
    const lengthMax = lengthMin + (4 * r.next());
    return [lengthMin, lengthMax];
}

/**
 * Describes language grammar and what symbols can follow a parent type
 * @param ptype parent type
 * @param rand random value for choosing between possible transitions
 */
function getTypeTransition(ptype: number, rng: Prando): number {
    const rand = rng.next();
    if (ptype === PTYPE.ROOT) {
        if (rand <= 0.33) {
            return PTYPE.GRASS;
        } else if (rand <= 0.66) {
            return PTYPE.TALL_TRUNK;
        } else {
            return PTYPE.SHURB_TRUNK;
        }
    } else if (ptype === PTYPE.SHURB_TRUNK) {
        if (rand <= 0.5) {
            return PTYPE.SHURB_TRUNK;
        } else {
            return PTYPE.BRANCH_SHORT;
        }
    } else if (ptype === PTYPE.TALL_TRUNK) {
        if (rand <= 0.5) {
            return PTYPE.TALL_TRUNK;
        } else if (rand <= 0.75) {
            return PTYPE.BRANCH_LONG;
        } else {
            return PTYPE.BRANCH_SHORT;
        }
    } else if (ptype === PTYPE.GRASS) {
        return PTYPE.GRASS;
    } else if (ptype === PTYPE.BRANCH_LONG) {
        if (rand <= 0.8) {
            return PTYPE.BRANCH_LONG;
        } else {
            return PTYPE.BRANCH_SHORT;
        }
    } else if (ptype === PTYPE.BRANCH_SHORT) {
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
    public rng: Prando;

    constructor(public seed: number, public ptype: number) {
        this.seed = seed;
        this.rng = new Prando(this.seed);
        this.branchOdds = getBranchOdds(ptype, this.rng);
        this.length = getBranchLength(this.baseRadius, ptype, this.rng);
        // Generate branch angle away from parent
        const angleMin = Math.PI / 16;
        const angleMax = angleMin + (Math.PI / 4 * this.rng.next());
        this.parentAngle = [angleMin, angleMax];
    }

    getDescendant(): BranchGene {
        const newType = getTypeTransition(this.ptype, this.rng);
        return new BranchGene(this.seed, newType);
    }
}

export class LeafGene {

    colorR: number[] = [0.6, 0.8];
    colorG: number[] = [0.2, 0.6];
    colorB: number[] = [0.0, 0.4];

    constructor(cR: number[], cG: number[], cB: number[]) {
        this.colorR = cR;
        this.colorG = cG;
        this.colorB = cB;
    }
}
