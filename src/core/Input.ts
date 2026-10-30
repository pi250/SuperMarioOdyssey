export class Input {
  readonly keys = new Set<string>();
  jumpPressed = false;
  jumpHeld = false;
  crouchPressed = false;
  crouchHeld = false;
  throwPressed = false;
  capturePressed = false;
  mouseDX = 0;
  mouseDY = 0;
  locked = false;
  constructor (private readonly dom: HTMLElement) {
    addEventListener('keydown', this.onKeyDown);
    addEventListener('keyup', this.onKeyUp);
    dom.addEventListener('click', this.onClick);
    addEventListener('mousemove', this.onMouseMove);
    addEventListener('contextmenu', (e) => e.preventDefault());
  }
  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.code;
    if (this.keys.has(k)) return;
    this.keys.add(k);
    if (k === 'Space') this.jumpPressed = true;
    if (k === 'ControlLeft' || k === 'KeyC') this.crouchPressed = true;
    if (k === 'KeyE') this.capturePressed = true;
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  private onClick = () => {
    if (!this.locked) { this.dom.requestPointerLock(); return; }
    this.throwPressed = true;
  };
  private onMouseMove = (e: MouseEvent) => {
    if (!this.locked) return;
    this.mouseDX += e.movementX;
    this.mouseDY += e.movementY;
  };
  axis(): {x: number; z: number } {
    let x = 0, z = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) z -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) z += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    const len = Math.hypot(x, z);
    return len > 0 ? {x: x / len, z: z / len } : {x: 0, z: 0 };
  }
  endFrame() {
    this.jumpHeld = this.keys.has('Space');
    this.crouchHeld = this.keys.has('ControlLeft') || this.keys.has('KeyC');
    this.jumpPressed = false;
    this.crouchPressed = false;
    this.throwPressed = false;
    this.capturePressed = false;
    this.mouseDX = 0;
    this.mouseDY = 0;
  }
  onLockChange(fn: (locked: boolean) => void) {
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.dom;
      fn(this.locked);
    });
  }
}