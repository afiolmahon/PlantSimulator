import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import * as THREE from 'three';
import { PlantNode, PlantGenerator } from './Plant';
import { PerspectiveCamera, Mesh, PlaneBufferGeometry, PointLight } from 'three';
import { AmbientLight } from 'three';
import { MeshLambertMaterial } from 'three';
import * as OrbitControls from 'three-orbitcontrols';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Generator Parameters
  @Input() gen_width_decrement_const: number = 0.4;
  @Input() gen_width_decrement_var: number = 0.2;

  @ViewChild('canvas') private canvasRef: ElementRef;

  private renderer: THREE.WebGLRenderer;
  // 3D components
  private scene: THREE.Scene;
  
  pointLight = new PointLight(0xAA8888);
  private floor: Mesh = new Mesh(new PlaneBufferGeometry(40,40), new MeshLambertMaterial({color: 0x994C00}));
  private p: PlantNode;

  private camera: PerspectiveCamera;
  private controls: OrbitControls;

  plantGen: PlantGenerator = new PlantGenerator();

  

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
    this.camera.position.set( 0, -40, 40);
    this.camera.rotateX(Math.PI/4)
    this.scene = new THREE.Scene();
    this.scene.add(this.floor);
    this.scene.add(new AmbientLight(0x444444));
    this.pointLight.position.set(20, -50, 50); 
    this.scene.add(this.pointLight);
    this.scene.background = new THREE.Color(0x54a1ff);
    // Add geometry to scene
    // this.p.growBranch();
    //this.scene.add(this.LeafGen.makeLeafMesh());
    this.generateRoot();
  }

  private animate() {
    this.p.animate();
  }
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move
  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    //Setup Orbit Controls here
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.minPolarAngle = Math.PI/4;
    this.controls.maxPolarAngle = Infinity;
    //this.controls.enableRotate = false;
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
  
  generateRoot() {
    console.log("Regenerating new root!");
    this.scene.remove(this.p.mesh);
    this.p.dispose();
    this.p = this.plantGen.createRootPlantNode(2);
    this.scene.add(this.p.mesh);
    this.plantGen.growPlant(this.p);
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
  onMouseMove(_: Event) {
    //TODO
  }

  onMouseUp(_: Event) {
    console.log("mouse up event!");
  }

  onMouseDown(_: Event) {
    console.log("mouse down event!");
  }

  onScroll(e: WheelEvent) {
    this.camera.translateOnAxis(this.scene.up, e.deltaY/10);
    console.log("scroll event!");
  }
}

