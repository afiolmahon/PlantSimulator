import { CylinderBufferGeometry, Mesh, Color, Vector3, MeshStandardMaterial } from 'three';
import { Shape, ShapeBufferGeometry, MeshPhongMaterial, DoubleSide} from 'three';

export function GenerateLeafColor(): Color {
    let r1 = Math.random();
    let r2 = Math.random();
    let r3 = Math.random();
    return new Color(r1 * 0.4, r2 * 0.4 + 0.6, r3 * 0.4);
}

var X_AXIS: Vector3 = new Vector3(1, 0, 0);
var Y_AXIS: Vector3 = new Vector3(0, 1, 0);
var Z_AXIS: Vector3 = new Vector3(0, 0, 1);

export class LeafGenerator {
    // Generator Properties
    public branch_mesh_radial_segments: number = 20;
    public branch_mesh_height_segments: number = 1;
    public branch_length_max = 4;
    public branch_radius_constant_reduction: number = 0.3;
    public branch_radius_variable_reduction: number = 0.2
    public branch_radius_min: number = 0.2;
    public branch_pitch_max: number = Math.PI/4;

    constructor() {}

    makeLeafMesh(): Mesh {
                        var x = 0, y = 0;
                var heartShape = new Shape(); // From http://blog.burlock.org/html5/130-paths
                heartShape.moveTo( x + 25, y + 25 );
                heartShape.bezierCurveTo( x + 25, y + 25, x + 25, y, x, y );
                heartShape.bezierCurveTo( x - 25, y, x - 25, y + 25, x + 25, y + 25);
                //heartShape.lineTo( x, y + 75);
                
               


                var geo = new ShapeBufferGeometry(heartShape);
        var mesh = new Mesh(geo, new MeshPhongMaterial({side: DoubleSide}));
        return mesh;
    }
    ShowLeaf(): void{

    }

   }