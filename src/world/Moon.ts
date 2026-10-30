import * as THREE from 'three';

export class Moon {
  readonly mesh: THREE.Mesh;
  collected = false;

  constructor(scene: THREE.Scene, x: number, y: number, z: number) {
    this.mesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.16, 10, 20),
      new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0x9a6b00, roughness: 0.35 })
    );
    this.mesh.position.set(x, y, z);
    this.mesh.rotation.x = Math.PI / 2.4;
    scene.add(this.mesh);
  }

  update(dt: number) {
    this.mesh.rotation.z += 1.8 * dt;
    this.mesh.position.y += Math.sin(performance.now() * 0.002 + this.mesh.position.x) * 0.004;
  }
}