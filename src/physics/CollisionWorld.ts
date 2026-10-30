import * as THREE from 'three';
export interface Box { min: THREE.Vector3; max: THREE.Vector3; }
export class CollisionWorld {
  readonly boxes: Box[] = [];
  addBox(center: THREE.Vector3, size: THREE.Vector3) {
    const half = size.clone().multiplyScalar(0.5);
    this.boxes.push({
      min: center.clone().sub(half),
      max: center.clone().add(half),
    });
  }
  resolve(pos: THREE.Vector3, half: THREE.Vector3, axis: 'x' | 'y' | 'z', amount: number): boolean {
    if (amount === 0) return false;
    pos[axis] += amount;
    let hit = false;
    for (const b of this.boxes) {
      const overlap =
        pos.x + half.x > b.min.x && pos.x - half.x < b.max.x &&
        pos.y + half.y > b.min.y && pos.y - half.y < b.max.y &&
        pos.z + half.z > b.min.z && pos.z - half.z < b.max.z;
      if (!overlap) continue;
      hit = true;
      if (amount > 0) pos[axis] = b.min[axis] - half[axis] - 1e-4;
      else pos[axis] = b.max[axis] + half[axis] + 1e-4;
    }
    return hit;
  }
}