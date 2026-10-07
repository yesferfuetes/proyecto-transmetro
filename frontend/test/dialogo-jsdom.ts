/**
 * jsdom no implementa `showModal` ni `close` de `<dialog>`. Este sustituto reproduce lo que usan
 * los componentes: abrir, cerrar con Esc (evento `cancel`), emitir `close` y devolver el foco.
 * El comportamiento real se verifica en las pruebas E2E.
 */
const focoAnterior = new WeakMap<HTMLDialogElement, Element | null>();

function alPresionarTecla(this: HTMLDialogElement, evento: KeyboardEvent): void {
  if (evento.key !== 'Escape') {
    return;
  }
  const cancelacion = new Event('cancel', { cancelable: true });
  if (this.dispatchEvent(cancelacion)) {
    this.close();
  }
}

export function instalarDialogo(): void {
  if (typeof HTMLDialogElement === 'undefined') {
    return;
  }
  const prototipo: Partial<Pick<HTMLDialogElement, 'showModal' | 'close'>> =
    HTMLDialogElement.prototype;
  if (prototipo.showModal) {
    return;
  }
  prototipo.showModal = function showModal(this: HTMLDialogElement): void {
    focoAnterior.set(this, document.activeElement);
    this.setAttribute('open', '');
    this.addEventListener('keydown', alPresionarTecla);
    // Como el navegador, enfoca el primer elemento enfocable del diálogo.
    this.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus();
  };
  prototipo.close = function close(this: HTMLDialogElement): void {
    if (!this.hasAttribute('open')) {
      return;
    }
    this.removeAttribute('open');
    this.removeEventListener('keydown', alPresionarTecla);
    const anterior = focoAnterior.get(this);
    if (anterior instanceof HTMLElement) {
      anterior.focus();
    }
    this.dispatchEvent(new Event('close'));
  };
}
