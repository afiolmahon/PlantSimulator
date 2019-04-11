import { Component, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { PlantNode, createRootPlantNode, addBranchChildNode } from './Plant';
import { PerspectiveCamera, Mesh, PlaneBufferGeometry, MeshBasicMaterial, PointLight } from 'three';
import { AmbientLight } from 'three';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('canvas') private canvasRef: ElementRef;

  private renderer: THREE.WebGLRenderer;
  // 3D components
  private scene: THREE.Scene;
  pointLight = new PointLight(0xAA8888);

  private floor: Mesh = new Mesh(new PlaneBufferGeometry(40,40), new MeshBasicMaterial({color: 0x994C00}));
  private p: PlantNode;
  private t: number = 0; // animation timer/

  private camera: PerspectiveCamera;

  title = 'PlantSimulator';

  constructor() {
    this.p = createRootPlantNode(2);
  }

  private get canvas(): HTMLCanvasElement { return this.canvasRef.nativeElement; }

  ngOnInit() {
    this.createScene();
    this.startRenderingLoop();
  }

  getAspectRatio(): number { return window.innerWidth / window.innerHeight; }

  private createScene() {
    this.camera = new THREE.PerspectiveCamera(40, this.getAspectRatio(), 1, 1000);
    this.camera.position.set( 0, -40, 40 );
    this.camera.rotateX(Math.PI/4)
    this.scene = new THREE.Scene();
    this.scene.add(this.floor);
    this.scene.add(new AmbientLight(0x444444));
    this.pointLight.position.set(20, -50, 50); 
    this.scene.add(this.pointLight);
    this.scene.background = new THREE.Color(0x54a1ff);
    // Add geometry to scene
    this.p.growBranch();
    addBranchChildNode(this.p.children[0]);
    this.scene.add(this.p.mesh);
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
  
  onRegen() {
    console.log("Regenerating plant!");
    this.p = createRootPlantNode(2);
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

  onScroll(_: Event) {
    console.log("scroll event!");
  }
}

