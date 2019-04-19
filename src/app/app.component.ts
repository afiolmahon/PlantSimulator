import { Component, ElementRef, Input, ViewChild, OnInit, OnChanges } from '@angular/core';
import * as THREE from 'three';
import { AmbientLight, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneBufferGeometry, PointLight, Vector3 } from 'three';
import { PlantNode } from './Plant';
import { PlantGenerator } from './Generator';
import { setRotateAroundPoint, X_AXIS, Z_AXIS } from './utility';


/*
FROM OrbitControls.js -- we should look into adding this
  controls = new THREE.OrbitControls( camera );
  controls.target.set( 0, 100, 0 );
  controls.update();
*/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Generator Parameters
  @Input() gen_rad_decrement: number = 0.3;

  @ViewChild('canvas') private canvasRef: ElementRef;

  private renderer: THREE.WebGLRenderer;
  // 3D components
  private scene: THREE.Scene;
  
  pointLight = new PointLight(0xAA8888);
  private floor: Mesh = new Mesh(new PlaneBufferGeometry(40,40), new MeshLambertMaterial({color: 0x994C00}));
  private p: PlantNode;


  private camera: PerspectiveCamera;
  private cameraAngle: number = 0;
  private cameraTilt: number = Math.PI/4;
  private cameraPoint: Vector3 = new Vector3(0, 40, -40); // orbit center for camera

  plantGen: PlantGenerator = new PlantGenerator(123);

  title = 'PlantSimulator';
  

  constructor() {
    this.p = this.plantGen.createRootPlantNode(2);
  }

  private get canvas(): HTMLCanvasElement { return this.canvasRef.nativeElement; }

  ngOnInit() {
    this.createScene();
    this.startRenderingLoop();
  }

  getAspectRatio(): number { return window.innerWidth / window.innerHeight; }

  private createScene() {
    this.camera = new THREE.PerspectiveCamera(40, this.getAspectRatio(), 1, 1000);
    let nc = this.cameraPoint.negate()
    this.camera.position.set(nc.x, nc.y, nc.z); 
    this.camera.rotateX(this.cameraTilt);
    this.scene = new THREE.Scene();
    this.scene.add(this.floor);
    this.scene.add(new AmbientLight(0x444444));
    this.pointLight.position.set(20, -50, 50); 
    this.scene.add(this.pointLight);
    this.scene.background = new THREE.Color(0x54a1ff);
    // Add geometry to scene
    // this.p.growBranch();
    this.generateNewPlant();
  }

  private animate() {
    this.p.animate();
  }

  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    let component: AppComponent = this;
    (function render() {
      component.animate();
      component.renderer.render(component.scene, component.camera);
      requestAnimationFrame(render);
    }());
  }
  

  /**
   * Event handlers for webpage
   */
  
  generateNewPlant() {
    console.log("Regenerating new root!");
    this.scene.remove(this.p.mesh);
    this.p.dispose();
    this.p = this.plantGen.createRootPlantNode(2);
    this.scene.add(this.p.mesh);

    let initialGrowth = Math.floor(Math.random() * 10);
    for (let i = 0; i < initialGrowth; ++i) {
      this.plantGen.growPlant(this.p);
    }
  }

  onGrow() {
    console.log("growing plant!");
    this.plantGen.growPlant(this.p);
  }

  onWindowResize(_: Event) {
    this.camera.aspect = this.getAspectRatio();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.updateProjectionMatrix();
  }


  // TODO For Camera Controller
  // dragging: boolean = false;
  // lastMousePos: number[] = [0,0];
  onMouseMove(e: MouseEvent) {
    // let deltaX = this.lastMousePos[0] - e.clientX;
    // this.lastMousePos[0] = e.clientX;
    // console.log(deltaX);
    // if (this.dragging) {
    //   this.cameraAngle += deltaX * 0.0001;
    //   this.camera.rotateX(-this.cameraTilt);
    //   setRotateAroundPoint(this.camera, this.cameraPoint, Z_AXIS, this.cameraAngle);
    //   this.camera.rotateX(this.cameraTilt);
    // }
    //TODO
  }

  onMouseUp(_: Event) {
    // this.dragging = false;
  }

  onMouseDown(_: Event) {
    // this.dragging = true;
  }

  onScroll(e: WheelEvent) {
    this.camera.translateOnAxis(this.scene.up, e.deltaY/10);
    console.log("scroll event!");
  }
}

