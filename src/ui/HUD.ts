export class HUD {
  private readonly moonsEl = document.getElementById('moons')!;
  private readonly overlay = document.getElementById('overlay')!;

  setMoons(n: number, total: number) {
    this.moonsEl.textContent = `${n} / ${total}`;
  }

  showOverlay(text: string, onClick?: () => void) {
    this.overlay.textContent = text;
    this.overlay.classList.add('show');
    this.overlay.onclick = () => {
      this.overlay.classList.remove('show');
      onClick?.();
    };
  }

  hideOverlay() { this.overlay.classList.remove('show'); }
}