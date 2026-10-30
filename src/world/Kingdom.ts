import * as THREE from 'three';
import { CollisionWorld } from '../physics/CollisionWorld';
import { Moon } from './Moon';
import { Goomba } from '../capture/Goomba';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const GRASS = new THREE.MeshStandardMaterial({ color: 0x4fa64f, roughness: 0.9 });
const STONE = new THREE.MeshStandardMaterial({ color: 0x8d8f96, roughness: 0.95 });

export interface Kingdom {
  moons: Moon[];
  goombas: Goomba[];
}

export function buildCapKingdom(scene: THREE.Scene, world: CollisionWorld): Kingdom {
  scene.background = new THREE.Color(0x8fc7ff);
  scene.fog = new THREE.Fog(0x8fc7ff, 45, 110);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a5a3a, 1.5));
  
  const sun = new THREE.DirectionalLight(0xfff3d0, 2.2);
  sun.position.set(18, 30, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  scene.add(sun);

  const add = (x: number, y: number, z: number, sx: number, sy: number, sz: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(BOX, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    world.addBox(m.position, new THREE.Vector3(sx, sy, sz));
  };

  // Suelo
  add(0, -1, 0, 60, 2, 60, GRASS);
  // Plataformas
  add(-9, 2.2, 8, 6, 1, 6, STONE);
  add(9, 3.4, 12, 5, 1, 5, STONE);
  add(0, 5.0, 18, 7, 1, 7, STONE);
  add(-14, 4.6, 20, 4, 1, 4, STONE);
  add(14, 6.2, 24, 4, 1, 4, STONE);
  add(0, 8.4, -30, 10, 1, 10, STONE);
  // Muros de contención
  add(0, 3, 30, 30, 6, 1, STONE);

  const moons = [
    new Moon(scene, 9, 3.6, -8),
    new Moon(scene, 9, 4.8, -12),
    new Moon(scene, 0, 6.4, -18),
    new Moon(scene, -14, 6.0, -20),
    new Moon(scene, 14, 7.6, -24),
    new Moon(scene, -4, 9.8, -30),
    new Moon(scene, 4, 9.8, -30),
    new Moon(scene, 20, 1.6, 6),
    new Moon(scene, 0, 1.6, 22),
    new Moon(scene, 16, 1.6, 16),
  ];
  
  const goombas = [
    new Goomba(scene, 5, -4),
    new Goomba(scene, -6, -14),
    new Goomba(scene, 0, -26),
  ];
  
  return { moons, goombas };
}