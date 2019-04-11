import { Object3D } from "three";
import { Vector3 } from 'three';

// Based on a stackoverflow solution for rotating about a point efficiently
// https://stackoverflow.com/questions/42812861/three-js-pivot-point/42866733#42866733
export function setRotateAroundPoint(object: Object3D, pivotPoint: Vector3, pivotAxis: Vector3, theta: number, pointIsWorld?: boolean) {
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;
    if (pointIsWorld) {
        object.parent.localToWorld(object.position);
    }
    object.position.sub(pivotPoint);
    object.position.applyAxisAngle(pivotAxis, theta);
    object.position.add(pivotPoint);
    if (pointIsWorld) {
        object.parent.worldToLocal(object.position);
    }
    object.rotateOnAxis(pivotAxis, theta);
}