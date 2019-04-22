import { Component, ElementRef, Input, ViewChild, OnInit } from '@angular/core';
import * as THREE from 'three';
import { AmbientLight, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneBufferGeometry, PointLight, Vector3 } from 'three';
import { BranchGene as PlantGene } from './Gene';
import { PlantNode, createNewPlant } from './Plant';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { X_AXIS } from './utility';
import Prando from 'prando';

//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('canvas') private canvasRef: ElementRef;

  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private camera: PerspectiveCamera;

  // 3D components
  private scene: THREE.Scene;
  private pointLight = new PointLight(0xAA8888);
  private floor: Mesh = new Mesh(new PlaneBufferGeometry(80, 80), new MeshLambertMaterial({color: 0x994C00}));
  private plant: PlantNode;

  private cameraRotationX: number = -Math.PI / 2;
  private cameraPoint: Vector3 = new Vector3(0, 40, -40); // orbit center for camera

  private plantGene = new PlantGene(1);

  constructor() {
  }

  private get canvas(): HTMLCanvasElement { return this.canvasRef.nativeElement; }

  getAspectRatio(): number { return window.innerWidth / window.innerHeight; }

  ngOnInit() {
    this.createScene();
    this.startRenderingLoop();
  }

  /**
   * Initialize scene and 3D objects
   */
  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.rotateX(this.cameraRotationX);
    this.scene.background = new THREE.Color(0x54a1ff);
    // Mesh
    this.scene.add(this.floor);
    this.generateNewPlant();
    // Lighting
    this.scene.add(new AmbientLight(0x444444));
    this.pointLight.position.set(20, -50, 50);
    this.scene.add(this.pointLight);
    // Camera
    this.camera = new THREE.PerspectiveCamera(40, this.getAspectRatio(), 1, 1000);
    const nc = this.cameraPoint.negate();
    this.cameraPoint.applyAxisAngle(X_AXIS, this.cameraRotationX);
    this.camera.position.set(nc.x, nc.y, nc.z);
  }

  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Setup Orbit Controls here
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableRotate = true;
    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxPolarAngle = Infinity;

    const component: AppComponent = this;
    (function render() {
      component.plant.animate();
      component.renderer.render(component.scene, component.camera);
      requestAnimationFrame(render);
    }());
  }

  clearPlant() {
    if (this.plant !== undefined) {
      this.plant.dispose();
      if (this.scene !== undefined) {
        this.scene.remove(this.plant.branchMesh);
      }
    }
  }

  /**
   * Button interactions
   */

  updatePlant() { // Rebuild plant reflecting any changes to generator
    const plantWidth = this.plant.radius[0];
    const rng = this.plant.rng;
    const age = this.plant.age;
    rng.reset();
    this.clearPlant();
    this.plant = createNewPlant(this.plantGene, plantWidth, rng);
    this.scene.add(this.plant.branchMesh);
    for (let i = 0; i < age; i++) {
      this.plant.grow();
    }
    console.log('Reload Plant');
  }

  newSpecies() {
    const seed = Math.random() * 100;
    this.plantGene = new PlantGene(seed);
    this.updatePlant();
    console.log('New Plant Generator!');
  }

  onGrow() {
    this.plant.grow();
    console.log('Growing plant!');
  }

  generateNewPlant() {
    this.clearPlant();
    // Regen plant
    this.plant = createNewPlant(this.plantGene, 2, new Prando(Math.random()));
    this.scene.add(this.plant.branchMesh);
    console.log('Generated new Plant!');
  }

  /**
   * UI Event Handlers
   */
  onWindowResize(_: Event) {
    this.camera.aspect = this.getAspectRatio();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.updateProjectionMatrix();
  }
  onMouseMove(e: MouseEvent) {}
  onMouseUp(_: Event) {}
  onMouseDown(_: Event) {}
  onScroll(e: WheelEvent) {
    this.scene.translateZ(e.deltaX);
  }
}

