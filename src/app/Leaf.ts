import { Mesh, Color, MeshStandardMaterial  } from 'three';
import { Shape, ShapeBufferGeometry, MeshPhongMaterial, DoubleSide} from 'three';

export function GenerateLeafColor(): Color {
    let r1 = Math.random();
    let r2 = Math.random();
    let r3 = Math.random();
    return new Color(r1 * 0.4, r2 * 0.4 + 0.6, r3 * 0.4);
}

export class LeafGenerator {

    constructor() {}

    makeLeafMesh(color: Color): Mesh {
        var x = 0, y = 0;
        var leafShape = new Shape();
        let mat = new MeshStandardMaterial({color: color, flatShading: true});
        leafShape.moveTo( x, y);
        leafShape.bezierCurveTo( x - 15, y - 15, x+15, y - 15, x, y);
        //leafShape.bezierCurveTo(x, y + 15, x, y + 15, x, y);
        var geo = new ShapeBufferGeometry(leafShape);
        var mesh = new Mesh(geo, mat);
        mesh.scale.set(0.05,0.05,0.05);

        return mesh;
    }

    ShowLeaf(): void{
        
        /*var x = 0, y = 0;
                var leafShape = new Shape();
               leafShape.moveTo( x, y);
                leafShape.bezierCurveTo( x + 15, y + 15, x-15, y + 15, x, y);
                //leafShape.bezierCurveTo(x, y + 15, x, y + 15, x, y);
                var geo = new ShapeBufferGeometry(leafShape);
        var mesh = new Mesh(geo, new MeshPhongMaterial({side: DoubleSide}));
        return mesh;*/
        
        /*
        Strong basis
         var x = 0, y = 0;
                var leafShape = new Shape();
                leafShape.moveTo( x, y);
                leafShape.bezierCurveTo(x + 30, y + 30, x - 30, y + 30, x, y);
        *//*
               var x = 0, y = 0;
                var leafShape = new Shape();
                leafShape.moveTo( x + 25, y + 25 );
                leafShape.bezierCurveTo( x + 25, y + 25, x + 25, y, x, y );
                leafShape.bezierCurveTo( x - 25, y, x - 25, y + 25, x + 25, y + 25);
                //leafShape.lineTo( x, y + 75);
                */
    }

   }