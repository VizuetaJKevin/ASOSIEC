import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

import { ApiService }                          from 'src/app/services/Api.service';
import { LoginService, LoginResponse }         from 'src/app/services/login.service';
import { RecaptchaService }                    from 'src/app/services/recaptcha.service';

import Swal from 'sweetalert2';

@Component({
  selector:    'app-login',
  templateUrl: './login.component.html',
  styleUrls:   ['./login.component.css'],
  standalone:  false,
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(32px) scale(.97)' }),
        animate('620ms cubic-bezier(.22,.68,0,1.2)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ]
})
export class LoginComponent {

  private _loginS        = inject(LoginService);
  private service        = inject(ApiService);
  private router         = inject(Router);
  private formBuilder    = inject(FormBuilder);
  private recaptchaService = inject(RecaptchaService);

  isLoading        = false;
  mostrarPassword  = false;

  FormularioLogin: FormGroup = this.formBuilder.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  /** Toggle eye icon */
  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  /** Fallback si el logo no carga */
  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Muestra un placeholder en base64 (cuadrado blanco con inicial)
    img.style.display = 'none';
  }

  async login(): Promise<void> {
    if (this.FormularioLogin.invalid) {
      this.FormularioLogin.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff5722'
      });
      return;
    }

    this.isLoading = true;

    try {
      const recaptchaToken = await this.recaptchaService.executeRecaptcha('login');

      const credenciales = {
        email:          this.FormularioLogin.value.email,
        password:       this.FormularioLogin.value.password,
        recaptchaToken
      };

      this._loginS.Login(credenciales).subscribe({
        next: (resp: LoginResponse) => {
          this.isLoading = false;

          if (resp?.statusok) {
            this.service.items();
            this.router.navigateByUrl('/');
            Swal.fire({
              icon: 'success',
              title: '¡Bienvenido!',
              showConfirmButton: false,
              timer: 1500
            });
          } else {
            this.mostrarErrorLogin(resp);
          }
        },
        error: (err: any) => {
          this.isLoading = false;

          if (err.error?.mensaje) {
            this.mostrarErrorLogin(err.error);
          } else if (err.status === 429) {
            Swal.fire({
              icon: 'warning',
              title: 'Demasiados intentos',
              html: `<p>Has excedido el límite de intentos.</p>
                     <p><strong>Por favor, espera 5 minutos e intenta de nuevo.</strong></p>`,
              confirmButtonColor: '#ff5722',
              confirmButtonText: 'Entendido'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error de conexión',
              text: 'No se pudo conectar con el servidor. Intenta de nuevo.',
              confirmButtonColor: '#ff5722'
            });
          }
        }
      });

    } catch (error) {
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error de verificación',
        html: `<p>Hubo un problema con la verificación de seguridad.</p>
               <p><strong>Por favor, recarga la página e intenta de nuevo.</strong></p>`,
        confirmButtonColor: '#ff5722',
        confirmButtonText: 'Recargar',
        allowOutsideClick: false
      }).then(r => { if (r.isConfirmed) window.location.reload(); });
    }
  }

  private mostrarErrorLogin(respuesta: any): void {
    let titulo = 'No se pudo iniciar sesión';
    let mensaje = 'Email o contraseña incorrectos';
    let icono: any = 'error';

    if (respuesta?.mensaje) {
      mensaje = respuesta.mensaje;

      switch (respuesta.codigoError) {
        case 'PENDIENTE_APROBACION':
          titulo  = 'Cuenta Pendiente de Aprobación';
          icono   = 'info';
          mensaje = `<p>${respuesta.mensaje}</p>
                     <p class="mt-3">Un administrador revisará tu solicitud en las próximas <strong>24-48 horas</strong>.</p>`;
          break;

        case 'RECHAZADO':
          titulo  = 'Solicitud Rechazada';
          mensaje = `<p>${respuesta.mensaje}</p><p class="mt-3">Si crees que esto es un error, contacta al soporte.</p>`;
          break;

        case 'BLOQUEADO':
          titulo  = 'Cuenta Bloqueada';
          icono   = 'warning';
          mensaje = `<p>${respuesta.mensaje}</p>
                     <p class="mt-3"><strong>Contacta al administrador</strong> para resolver este problema.</p>`;
          break;

        case 'CUENTA_BLOQUEADA_POR_INTENTOS':
        case 'USUARIO_BLOQUEADO': {
          titulo  = '🔒 Cuenta Bloqueada Temporalmente';
          icono   = 'warning';
          const t = respuesta.tiempoBloqueoMinutos || respuesta.minutosRestantes || 15;
          mensaje = `<div class="text-center">
                       <p class="mb-3">${respuesta.mensaje || 'Demasiados intentos fallidos.'}</p>
                       <strong>⏱️ Tiempo de bloqueo: ${t} minutos</strong>
                     </div>`;
          break;
        }

        case 'INACTIVO':
          titulo  = 'Cuenta Inactiva';
          icono   = 'warning';
          mensaje = `<p>${respuesta.mensaje}</p>
                     <p class="mt-3">Contacta al administrador para reactivar tu cuenta.</p>`;
          break;

        case 'CREDENCIALES_INVALIDAS':
          titulo = 'Datos Incorrectos';
          if (respuesta.intentosRestantes !== undefined && respuesta.maxIntentos !== undefined) {
            mensaje = `<p>${respuesta.mensaje}</p>
                       <div class="mt-3"><strong>⚠️ Intentos restantes: ${respuesta.intentosRestantes} de ${respuesta.maxIntentos}</strong></div>
                       ${respuesta.intentosRestantes <= 2 ? '<p class="mt-2 text-danger"><small>¡Pocos intentos antes del bloqueo!</small></p>' : ''}`;
          }
          break;

        case 'RECAPTCHA_FAILED':
          titulo  = '🤖 Verificación de Seguridad Falló';
          icono   = 'warning';
          mensaje = `<p>No se pudo verificar que eres humano.</p>
                     <p class="mt-2"><strong>Por favor, recarga la página e intenta de nuevo.</strong></p>`;
          break;

        default:
          titulo = 'Error de Acceso';
          break;
      }
    }

    Swal.fire({
      icon:               icono,
      title:              titulo,
      html:               mensaje,
      confirmButtonColor: '#ff5722',
      confirmButtonText:  'Entendido'
    });
  }

  recuperar(): void { this.router.navigateByUrl('recuperar'); }
  registrar(): void { this.router.navigateByUrl('registro');  }

  valido(campo: string): boolean | undefined {
    return this.FormularioLogin.get(campo)?.invalid
        && this.FormularioLogin.get(campo)?.touched;
  }
}
