import * as THREE from 'three';
import { Player } from './Player';
import { TUNING } from './tuning';

type CappyState = 'idle' | 'thrown' | 'returning';

export class Cappy {
  private state: CappyState = 'idle';
  private life = 0;
  readonly mesh: THREE.Mesh;
  readonly velocity = new THREE.Vector3();

  constructor (private readonly player: Player, scene: THREE.Scene) {
    this.mesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 0.52, 12),
      new THREE.MeshStandardMaterial({ color: 0xd42a2a, roughness: 0.5 })
    );
    this.mesh.rotation.z = Math.PI / 2;
    this.mesh.castShadow = true;
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  throw(camYaw: number) {
    if (this.state !== 'idle') return;
    const forward = new THREE.Vector3(-Math.sin(camYaw), 0.06, Math.cos(camYaw)).normalize();
    this.state = 'thrown';
    this.life = 0.55;
    this.mesh.visible = true;
    this.mesh.position.copy(this.player.position).addScaledVector(forward, 0.9);
    this.velocity.copy(forward).multiplyScalar(TUNING.capThrowSpeed);
  }

  get active() { return this.state !== 'idle'; }
  get position() { return this.mesh.position; }

  update(dt: number) {
    if (this.state === 'idle') return;
    
    if (this.state === 'thrown') {
      this.life -= dt;
      this.velocity.y -= 6 * dt;
      if (this.life <= 0) this.state = 'returning';
    } else {
      const toPlayer = this.player.position.clone().add(new THREE.Vector3(0, 1.1, 0)).sub(this.mesh.position);
      this.velocity.lerp(toPlayer.normalize().multiplyScalar(TUNING.capReturnSpeed), 0.35);
    }
    
    this.mesh.position.addScaledVector(this.velocity, dt);
    this.mesh.rotation.y += 14 * dt;
    
    if (this.player.velocity.y < 0 && this.mesh.position.distanceTo(this.player.position) < 0.95) {
      this.player.velocity.y = TUNING.capJumpImpulse;
      this.state = 'returning';
    }
    
    if (this.state === 'returning' && this.mesh.position.distanceTo(this.player.position) < 0.6) {
      this.state = 'idle';
      this.mesh.visible = false;
    }
  }
}