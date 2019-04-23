import { Vector3 } from 'three';

export const X_AXIS: Vector3 = new Vector3(1, 0, 0);
export const Y_AXIS: Vector3 = new Vector3(0, 1, 0);
export const Z_AXIS: Vector3 = new Vector3(0, 0, 1);

/**
 * Interpolate value from range, 0 gives range min, 1 gives range max, 0.5 would give range mean
 * @param position: position in range 0 corresponds to min value and 1 to max value
 * @param range: 2 values specifying a range min and max
 */
export function inRange(position: number, range: number[]): number {
    return range[0] + ( (range[1] - range[0]) * position);
}