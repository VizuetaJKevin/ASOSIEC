import { Injectable } from '@angular/core';

/**
 * Servicio coordinador del spinner global.
 *
 * Cuando un componente quiere manejar el spinner manualmente
 * (con mensajes personalizados), llama a skipInterceptorSpinner(true)
 * ANTES de lanzar la petición HTTP. El interceptor lo consulta
 * y no activa el spinner global, evitando que se superpongan.
 *
 * Uso en componentes con spinner manual:
 *   this.spinnerState.skip(true);
 *   this.spinner.show();
 *   this.api.miPeticion().subscribe({
 *     next: () => { this.spinner.hide(); this.spinnerState.skip(false); },
 *     error: () => { this.spinner.hide(); this.spinnerState.skip(false); }
 *   });
 */
@Injectable({ providedIn: 'root' })
export class SpinnerStateService {
  private _skip = false;

  skip(value: boolean): void {
    this._skip = value;
  }

  get shouldSkip(): boolean {
    return this._skip;
  }
}
