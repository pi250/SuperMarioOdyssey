export const FIXED_DT = 1 / 120;
export class GameLoop {
  private acc = 0;
  private last = 0;
  private running = false;
  constructor (
    private readonly update: (dt: number) => void,
    private readonly render: (alpha: number) => void,
  ) {}
  start() {
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.frame);
  }
  stop() { this.running = false; }
  private frame = (now: number) => {
    if (!this.running) return;
    requestAnimationFrame(this.frame);
    const elapsed = Math.min((now - this.last) / 1000, 0.25);
    this.last = now;
    this.acc += elapsed;
    let guard = 0;
    while (this.acc >= FIXED_DT && guard++ < 8) {
      this.update(FIXED_DT);
      this.acc -= FIXED_DT;
    }
    this.render(this.acc / FIXED_DT);
  };
}