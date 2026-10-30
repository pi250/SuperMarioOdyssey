import * as THREE from 'three';
import { Input } from '../core/Input';
import { CollisionWorld } from '../physics/CollisionWorld';

export class CameraRig {
  yaw = 0;
  private pitch = 0.26;
  private distance = 6.5;

  constructor (private readonly camera: THREE.PerspectiveCamera, private readonly world: CollisionWorld) {}

  update(dt: number, target: THREE.Vector3, input: Input) {
    this.yaw -= input.mouseDX * 0.0026;
    this.pitch = THREE.MathUtils.clamp(this.pitch - input.mouseDY * 0.002, -0.35, 1.1);
    
    const dir = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    );
    
    const origin = target.clone().add(new THREE.Vector3(0, 1.3, 0));
    let dist = this.distance;
    const ray = new THREE.Ray(origin, dir);
    
    for (const b of this.world.boxes) {
      const box = new THREE.Box3(b.min, b.max);
      const p = new THREE.Vector3();
      if (ray.intersectBox(box, p)) {
        dist = Math.min(dist, p.distanceTo(origin) - 0.25);
      }
    }
    dist = Math.max(dist, 1.6);
    
    const desired = origin.clone().addScaledVector(dir, dist);
    this.camera.position.lerp(desired, 1 - Math.pow(0.0008, dt));
    this.camera.lookAt(target.clone().add(new THREE.Vector3(0, 1.1, 0)));
  }
}