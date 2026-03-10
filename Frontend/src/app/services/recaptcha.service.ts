import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare const grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {

  private siteKey = environment.recaptcha.siteKey;

  constructor() { }

  /**
   * Ejecuta reCAPTCHA y devuelve el token
   * @param action Nombre de la acción (ej: 'login', 'register')
   */
  async executeRecaptcha(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        grecaptcha.ready(() => {
          grecaptcha.execute(this.siteKey, { action: action })
            .then((token: string) => {
              console.log('✅ reCAPTCHA token generado para:', action);
              resolve(token);
            })
            .catch((error: any) => {
              console.error('❌ Error ejecutando reCAPTCHA:', error);
              reject(error);
            });
        });
      } catch (error) {
        console.error('❌ reCAPTCHA no disponible:', error);
        reject(error);
      }
    });
  }
}
