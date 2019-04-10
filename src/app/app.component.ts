import { Component, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { Plant } from './Plant';

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
  private p: Plant;
  private t: number = 0; // animation timer/

  private camera : THREE.PerspectiveCamera;
  title = 'PlantSimulator';

  constructor() {
    this.p = new Plant();
  }

  ngOnInit() {
    this.createScene();
    this.startRenderingLoop();
  }

  getAspectRatio(): number { return window.innerWidth / window.innerHeight; }

  private createScene() {
    this.camera = new THREE.PerspectiveCamera(40, this.getAspectRatio(), 1, 1000);
    this.camera.position.setY(-10);
    this.camera.position.setZ(10);
    this.camera.rotateX(Math.PI/4)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x54a1ff);
    // Add geometry to scene
    this.scene.add(this.p.model);
  }

  private get canvas(): HTMLCanvasElement { return this.canvasRef.nativeElement; }
// onWindowResize(_: Event) {
//   this.cameraControl.camera.aspect = this.getAspectRatio();
//   this.renderer.setSize(window.innerWidth, window.innerHeight);
//   this.cameraControl.updateCamera();
// }

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
}

