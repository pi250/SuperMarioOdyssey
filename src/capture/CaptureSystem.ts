import * as THREE from 'three';
import { Input } from '../core/Input';
import { Player } from '../player/Player';
import { Cappy } from '../player/Cappy';
import { CollisionWorld } from '../physics/CollisionWorld';

export interface Capturable {
  mesh: THREE.Object3D;
  radius: number;
  captured: boolean;
  onCapture(): void;
  onRelease(): void;
  update(dt: number, input: Input, camYaw: number, world: CollisionWorld): void;
}

export class CaptureSystem {
  private target: Capturable | null = null;
  private active: Capturable | null = null;

  constructor (private readonly player: Player, private readonly cappy: Cappy) {}

  update(dt: number, input: Input, camYaw: number, world: CollisionWorld, list: Capturable[]) {
    if (this.cappy.active) {
      for (const c of list) {
        if (c.captured) continue;
        if (this.cappy.position.distanceTo(c.mesh.position) < c.radius + 0.5) {
          this.target = c;
          this.cappy['state'] = 'returning';
        }
      }
    }
    
    if (input.capturePressed && this.target && !this.active) {
      this.active = this.target;
      this.active.captured = true;
      this.active.onCapture();
      this.player.captured = true;
      this.player.mesh.visible = false;
      this.target = null;
    }
    
    if (this.active) {
      if (input.jumpPressed && this.active.mesh.position.distanceTo(this.player.position) < 2) {
        this.release();
      } else {
        this.active.update(dt, input, camYaw, world);
        this.player.position.copy(this.active.mesh.position);
      }
    }
  }

  release() {
    if (!this.active) return;
    this.active.onRelease();
    this.active.captured = false;
    this.active = null;
    this.player.captured = false;
    this.player.mesh.visible = true;
    this.player.position.y += 1.2;
    this.player.velocity.set(0, 3, 0);
  }
}