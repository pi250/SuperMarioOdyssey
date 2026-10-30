import * as THREE from 'three';
import { CollisionWorld } from '../physics/CollisionWorld';
import { Input } from '../core/Input';
import { TUNING } from './tuning';

type State = 'idle' | 'run' | 'air' | 'dive' | 'pound';
const HALF = new THREE.Vector3(0.35, 0.85, 0.35);
const CHAIN_WINDOW = 0.22;

export class Player {
  readonly position = new THREE.Vector3(0, 1.5, 6);
  readonly velocity = new THREE.Vector3();
  readonly mesh: THREE.Group;
  state: State = 'idle';
  grounded = false;
  captured = false;
  private airJumps = 0;
  private chainTimer = 0;
  private poundTimer = 0;
  private wasGrounded = true;

  constructor (scene: THREE.Scene, private readonly world: CollisionWorld) {
    this.mesh = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.34, 1.05, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0xd42a2a, roughness: 0.6 })
    );
    body.castShadow = true;
    body.position.y = 0.1;
    this.mesh.add(body);
    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x1b1b22, roughness: 0.3 })
    );
    visor.position.set(0, 0.42, -0.16);
    this.mesh.add(visor);
    scene.add(this.mesh);
  }

  get speed2D() { return Math.hypot(this.velocity.x, this.velocity.z); }

  respawn() {
    this.position.set(0, 1.5, 6);
    this.velocity.set(0, 0, 0);
  }

  update(dt: number, input: Input, camYaw: number) {
    if (this.captured) return;
    this.chainTimer = Math.max(0, this.chainTimer - dt);
    if (this.grounded) { this.airJumps = 0; this.chainTimer = CHAIN_WINDOW; }
    
    const ax = input.axis();
    const dir = new THREE.Vector3(ax.x, 0, ax.z);
    if (dir.lengthSq() > 0) dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), camYaw);
    
    const target = dir.clone().multiplyScalar(TUNING.runSpeed);
    const rate = this.grounded ? TUNING.accel : TUNING.airAccel;
    
    this.velocity.x = THREE.MathUtils.damp(this.velocity.x, target.x, rate, dt);
    this.velocity.z = THREE.MathUtils.damp(this.velocity.z, target.z, rate, dt);
    
    if (this.grounded && dir.lengthSq() === 0) {
      const f = Math.max(0, 1 - TUNING.friction * dt);
      this.velocity.x *= f;
      this.velocity.z *= f;
    }
    
    if (this.speed2D > 0.4) {
      const yaw = Math.atan2(this.velocity.x, this.velocity.z);
      this.mesh.rotation.y = THREE.MathUtils.damp(this.mesh.rotation.y, yaw, 14, dt);
    }
    
    this.velocity.y -= TUNING.gravity * dt;
    
    if (input.jumpPressed) {
      if (this.grounded || this.chainTimer > 0) {
        this.airJumps = 0;
        this.chainTimer = 0;
        this.velocity.y = TUNING.jumpImpulse;
        this.grounded = false;
      } else if (this.airJumps < 2) {
        this.airJumps++;
        this.velocity.y = TUNING.jumpImpulse * (1 + this.airJumps * 0.12);
        const boost = 1 + this.airJumps * 0.35;
        this.velocity.x *= boost;
        this.velocity.z *= boost;
      }
      this.state = 'air';
    }
    if (input.jumpHeld && this.velocity.y > 0)
      this.velocity.y += TUNING.jumpHoldForce * dt;
      
    if (input.crouchPressed && !this.grounded) {
      if (this.speed2D > TUNING.runSpeed * 0.55) {
        this.state = 'dive';
        const d = new THREE.Vector3(this.velocity.x, 0, this.velocity.z).normalize();
        this.velocity.addScaledVector(d, TUNING.diveImpulse);
        this.velocity.y = Math.max(this.velocity.y, 2.5);
      } else {
        this.state = 'pound';
        this.poundTimer = 0.12;
        this.velocity.set(0, -TUNING.groundPoundSpeed, 0);
      }
    }
    
    if (this.poundTimer > 0) {
      this.poundTimer -= dt;
      this.velocity.set(0, -TUNING.groundPoundSpeed, 0);
    }
    
    if (this.world.resolve(this.position, HALF, 'x', this.velocity.x * dt)) this.velocity.x = 0;
    if (this.world.resolve(this.position, HALF, 'z', this.velocity.z * dt)) this.velocity.z = 0;
    
    this.grounded = false;
    if (this.world.resolve(this.position, HALF, 'y', this.velocity.y * dt)) {
      if (this.velocity.y < 0) this.grounded = true;
      this.velocity.y = 0;
      this.poundTimer = 0;
      if (this.state === 'dive' || this.state === 'pound') this.state = 'idle';
    }
    
    if (this.grounded) {
      this.state = this.speed2D > 0.6 ? 'run' : 'idle';
    } else if (this.state !== 'dive' && this.state !== 'pound') {
      this.state = 'air';
    }
    
    this.wasGrounded = this.grounded;
    this.mesh.position.copy(this.position);
  }
  
  get wasGroundedLast() { return this.wasGrounded; }
}