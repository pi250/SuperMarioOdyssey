import * as THREE from 'three';
import { GameLoop } from './core/GameLoop';
import { Input } from './core/Input';
import { CollisionWorld } from './physics/CollisionWorld';
import { Player } from './player/Player';
import { CameraRig } from './player/CameraRig';
import { Cappy } from './player/Cappy';
import { CaptureSystem } from './capture/CaptureSystem';
import { buildCapKingdom } from './world/Kingdom';
import { HUD } from './ui/HUD';

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 400);

const world = new CollisionWorld();
const kingdom = buildCapKingdom(scene, world);

const player = new Player(scene, world);
const cappy = new Cappy(player, scene);
const rig = new CameraRig(camera, world);
const capture = new CaptureSystem(player, cappy);

const input = new Input(renderer.domElement);
const hud = new HUD();

let collected = 0;
const TOTAL = kingdom.moons.length;
hud.setMoons(0, TOTAL);

input.onLockChange((locked) => {
  if (!locked) hud.showOverlay('PAUSA - click para continuar', () => renderer.domElement.requestPointerLock());
});
hud.showOverlay('MARIO ODYSSEY WEB - click para jugar', () => renderer.domElement.requestPointerLock());

const tmp = new THREE.Vector3();
const loop = new GameLoop(
  (dt) => {
    player.update(dt, input, rig.yaw);
    if (input.throwPressed) cappy.throw(rig.yaw);
    cappy.update(dt);
    capture.update(dt, input, rig.yaw, world, kingdom.goombas);
    
    for (const m of kingdom.moons) {
      m.update(dt);
      if (m.collected) continue;
      if (player.position.distanceTo(m.mesh.position) < 1.3) {
        m.collected = true;
        m.mesh.visible = false;
        collected++;
        hud.setMoons(collected, TOTAL);
        if (collected === TOTAL) {
          hud.showOverlay('¡TODAS LAS LUNAS!', () => location.reload());
        }
      }
    }
    
    if (player.position.y < -25) player.respawn();
    tmp.copy(player.position);
    rig.update(dt, tmp, input);
    input.endFrame();
  },
  () => renderer.render(scene, camera)
);
loop.start();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});