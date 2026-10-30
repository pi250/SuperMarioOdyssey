import * as THREE from 'three';
import { CollisionWorld } from '../physics/CollisionWorld';
import { Input } from '../core/Input';
import type { Capturable } from './CaptureSystem';

export class Goomba implements Capturable {
  readonly mesh: THREE.Group;
  readonly radius = 0.6;
  captured = false;
  private dir = 1;
  private timer = 0;
  private vely = 0;

  constructor(scene: THREE.Scene, private readonly world: CollisionWorld, x: number, z: number) {
    this.mesh = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.85 })
    );
    body.scale.set(1, 0.75, 1);
    body.castShadow = true;
    this.mesh.add(body);
    
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      eye.position.set(s * 0.16, 0.14, -0.42);
      this.mesh.add(eye);
    }
    
    this.mesh.position.set(x, 0.5, z);
    scene.add(this.mesh);
  }

  onCapture() { this.mesh.scale.setScalar(1.15); }
  onRelease() { this.mesh.scale.setScalar(1); }

  update(dt: number, input: Input, camYaw: number, world: CollisionWorld) {
    this.timer += dt;
    const ax = input.axis();
    const moving = ax.x !== 0 || ax.z !== 0;
    
    if (moving) {
      const v = new THREE.Vector3(ax.x, 0, ax.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), camYaw);
      v.normalize().multiplyScalar(4.2 * dt);
      world.resolve(this.mesh.position, new THREE.Vector3(0.45, 0.4, 0.45), 'x', v.x);
      world.resolve(this.mesh.position, new THREE.Vector3(0.45, 0.4, 0.45), 'z', v.z);
      this.mesh.rotation.y = Math.atan2(v.x, v.z);
    } else {
      if (this.timer > 1.4) { this.timer = 0; this.dir *= -1; }
      world.resolve(this.mesh.position, new THREE.Vector3(0.45, 0.4, 0.45), 'x', this.dir * 1.4 * dt);
    }
    
    this.vely += -34 * dt;
    if (world.resolve(this.mesh.position, new THREE.Vector3(0.45, 0.4, 0.45), 'y', this.vely * dt))
      this.vely = 0;
  }
}