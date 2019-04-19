import { Component, ElementRef, Input, ViewChild, OnInit, OnChanges } from '@angular/core';
import * as THREE from 'three';
import { AmbientLight, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneBufferGeometry, PointLight, Vector3 } from 'three';
import { PlantGenerator } from './Generator';
import { PlantNode } from './Plant';
import { OrbitControls } from 'three-orbitcontrols-ts';

//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

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
  private controls: OrbitControls;
  private camera: PerspectiveCamera;

  // 3D components
  private scene: THREE.Scene;
  private pointLight = new PointLight(0xAA8888);
  private floor: Mesh = new Mesh(new PlaneBufferGeometry(40,40), new MeshLambertMaterial({color: 0x994C00}));
  private plant: PlantNode;

  private cameraRotationX: number = -Math.PI/2;

  private cameraPoint: Vector3 = new Vector3(0, 40, -40); // orbit center for camera

  private plantGen: PlantGenerator = new PlantGenerator(123);

  constructor() {
    this.plant = this.plantGen.createRootPlantNode(2);
  }

  private get canvas(): HTMLCanvasElement { return this.canvasRef.nativeElement; }

  getAspectRatio(): number { return window.innerWidth / window.innerHeight; }
  
  private animate() { this.plant.animate(); }


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
    let nc = this.cameraPoint.negate()
    this.cameraPoint.applyAxisAngle(new Vector3(1,0,0), this.cameraRotationX);
    this.camera.position.set(nc.x, nc.y, nc.z); 
  }


  private startRenderingLoop() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    //Setup Orbit Controls here
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableRotate = true;
    this.controls.minPolarAngle = Math.PI/4;
    this.controls.maxPolarAngle = Infinity;

    let component: AppComponent = this;
    (function render() {
      component.animate();
      component.renderer.render(component.scene, component.camera);
      requestAnimationFrame(render);
    }());
  }
  

  generateNewPlant() {
    console.log("Regenerating new root!");
    this.scene.remove(this.plant.mesh);
    this.plant.dispose();
    this.plant = this.plantGen.createRootPlantNode(2);
    this.scene.add(this.plant.mesh);
    // Grow plant a bit
    let initialGrowth = Math.floor(Math.random() * 10);
    for (let i = 0; i < initialGrowth; ++i) {
      this.plantGen.growPlant(this.plant);
    }
  }

  onGrow() {
    console.log("growing plant!");
    this.plantGen.growPlant(this.plant);
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
  onScroll(e: WheelEvent) {}
}

