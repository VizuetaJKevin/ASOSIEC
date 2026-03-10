import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/Api.service';
import { LoginService } from 'src/app/services/login.service';
import { passwordStrengthValidator } from 'src/app/validators/password-strength.validator';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerStateService } from 'src/app/components/misc/spinner/services/spinner-state.service';
import Swal from 'sweetalert2';
import { Subscription, interval } from 'rxjs';

// Pasos del flujo de recuperación
type Paso = 'email' | 'codigo' | 'password';

@Component({
    selector: 'app-recuperar',
    templateUrl: './recuperar.component.html',
    styleUrls: ['./recuperar.component.css'],
    standalone: false,
    animations: [
      trigger('fadeInUp', [
        transition(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          animate('600ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ]),
      trigger('fadeIn', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('400ms ease-in', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          animate('400ms ease-out', style({ opacity: 0 }))
        ])
      ]),
      trigger('slideDown', [
        transition(':enter', [
          style({ height: 0, opacity: 0, overflow: 'hidden' }),
          animate('300ms ease-out', style({ height: '*', opacity: 1 }))
        ]),
        transition(':leave', [
          animate('300ms ease-in', style({ height: 0, opacity: 0 }))
        ])
      ]),
      trigger('pulse', [
        transition(':enter', [
          style({ transform: 'scale(0.8)', opacity: 0 }),
          animate('500ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({ transform: 'scale(1)', opacity: 1 }))
        ])
      ])
    ]
})
export class RecuperarComponent implements OnDestroy {

  // ────────────────────────────────────────────
  // Estado del flujo
  // ────────────────────────────────────────────
  public pasoActual: Paso = 'email';
  public isLoading: boolean = false;

  // Datos temporales del flujo
  public emailVerificado: string = '';
  private codigoVerificado: string = '';

  // Visibilidad de contraseñas
  public mostrarPassword: boolean = false;
  public mostrarConfirmPassword: boolean = false;
  public passwordValue: string = '';
  public confirmPasswordValue: string = '';

  // Temporizador de reenvío (segundos)
  public tiempoReenvio: number = 0;
  private timerSub?: Subscription;

  private _sso = inject(LoginService);
  private spinner = inject(NgxSpinnerService);
  private spinnerState = inject(SpinnerStateService);
  public mensajeSpinner: string = '';

  // ── Blur helpers ──
  private setBlur(on: boolean): void {
    const el = document.querySelector('.recovery-container');
    if (el) el.classList.toggle('is-loading', on);
  }

  private showSpinner(msg: string): void {
    this.mensajeSpinner = msg;
    this.spinnerState.skip(true);
    this.spinner.show();
    this.setBlur(true);
  }

  private hideSpinner(): void {
    this.spinnerState.skip(false);
    this.spinner.hide();
    this.setBlur(false);
  }

  // ────────────────────────────────────────────
  // Formularios
  // ────────────────────────────────────────────

  // Paso 1: Email
  FormularioEmail: FormGroup = this.fb.group({
    email: ['', [Validators.email, Validators.required]]
  });

  // Paso 2: Código de 6 dígitos
  FormularioCodigo: FormGroup = this.fb.group({
    d1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d6: ['', [Validators.required, Validators.pattern(/^\d$/)]]
  });

  // Paso 3: Nueva contraseña
  FormularioPassword: FormGroup = this.fb.group({
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      passwordStrengthValidator()
    ]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor(private fb: FormBuilder, private router: Router) {
    this.FormularioPassword.get('password')?.valueChanges.subscribe(v => {
      this.passwordValue = v || '';
    });
    this.FormularioPassword.get('confirmPassword')?.valueChanges.subscribe(v => {
      this.confirmPasswordValue = v || '';
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  // ────────────────────────────────────────────
  // Utilidades
  // ────────────────────────────────────────────

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const p = control.get('password');
    const c = control.get('confirmPassword');
    if (!p || !c) return null;
    return p.value === c.value ? null : { passwordMismatch: true };
  }

  valido(form: FormGroup, campo: string): boolean {
    return !!(form.get(campo)?.invalid && form.get(campo)?.touched);
  }

  get codigoCompleto(): string {
    const v = this.FormularioCodigo.value;
    return `${v.d1}${v.d2}${v.d3}${v.d4}${v.d5}${v.d6}`;
  }

  private iniciarTemporizador(): void {
    this.timerSub?.unsubscribe();
    this.tiempoReenvio = 60;
    this.timerSub = interval(1000).subscribe(() => {
      this.tiempoReenvio--;
      if (this.tiempoReenvio <= 0) {
        this.timerSub?.unsubscribe();
        this.tiempoReenvio = 0;
      }
    });
  }

  // ────────────────────────────────────────────
  // PASO 1: Enviar código al correo
  // ────────────────────────────────────────────

  enviarCodigo(): void {
    if (this.FormularioEmail.invalid) {
      this.FormularioEmail.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido',
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const email = this.FormularioEmail.value.email;
    this.isLoading = true;
    this.showSpinner('Enviando código de verificación...');

    this._sso.EnviarCodigoRecuperacion(email).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        this.hideSpinner();
        // Siempre avanzamos (respuesta genérica por seguridad)
        this.emailVerificado = email;
        this.pasoActual = 'codigo';
        this.iniciarTemporizador();

        Swal.fire({
          icon: 'success',
          title: '¡Código enviado!',
          html: `<p>Hemos enviado un código de 6 dígitos a <strong>${email}</strong>.</p>
                 <p class="mt-2" style="font-size:13px;color:#6c757d;">Revisa tu bandeja de entrada y carpeta de spam. El código expira en 15 minutos.</p>`,
          confirmButtonColor: '#667eea',
          confirmButtonText: 'Ingresar código'
        });
      },
      error: () => {
        this.isLoading = false;
        this.hideSpinner();
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo enviar el código. Por favor, intenta de nuevo.',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  // ────────────────────────────────────────────
  // PASO 1b: Reenviar código
  // ────────────────────────────────────────────

  reenviarCodigo(): void {
    if (this.tiempoReenvio > 0) return;
    this.FormularioCodigo.reset();
    this.isLoading = true;
    this.showSpinner('Reenviando código...');

    this._sso.EnviarCodigoRecuperacion(this.emailVerificado).subscribe({
      next: () => {
        this.isLoading = false;
        this.hideSpinner();
        this.iniciarTemporizador();
        Swal.fire({
          icon: 'info',
          title: 'Código reenviado',
          text: `Un nuevo código fue enviado a ${this.emailVerificado}`,
          confirmButtonColor: '#667eea',
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: () => {
        this.isLoading = false;
        this.hideSpinner();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo reenviar el código. Intenta de nuevo.',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  // ────────────────────────────────────────────
  // PASO 2: Verificar código
  // ────────────────────────────────────────────

  verificarCodigo(): void {
    if (this.FormularioCodigo.invalid) {
      this.FormularioCodigo.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Código incompleto',
        text: 'Por favor, ingresa los 6 dígitos del código',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const codigo = this.codigoCompleto;
    this.isLoading = true;
    this.showSpinner('Verificando código...');

    this._sso.VerificarCodigoRecuperacion(this.emailVerificado, codigo).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        this.hideSpinner();

        if (resp.statusok) {
          this.codigoVerificado = codigo;
          this.timerSub?.unsubscribe();

          Swal.fire({
            icon: 'success',
            title: '¡Código verificado!',
            html: `
              <div style="text-align:center; padding: 8px 0;">
                <p style="color:#2c3e50; font-size:15px; margin:0 0 8px;">
                  ✅ Tu identidad ha sido confirmada correctamente.
                </p>
                <p style="color:#6c757d; font-size:13px; margin:0;">
                  En un momento podrás crear tu nueva contraseña.
                </p>
              </div>
            `,
            showConfirmButton: false,
            timer: 2200,
            timerProgressBar: true,
            background: '#ffffff',
            iconColor: '#22c55e'
          }).then(() => {
            this.pasoActual = 'password';
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Código incorrecto',
            html: `<p>${resp.mensaje || 'El código es incorrecto o ya expiró.'}</p>
                   <p class="mt-2" style="font-size:13px;color:#6c757d;">Revisa el código en tu correo o solicita uno nuevo.</p>`,
            confirmButtonColor: '#667eea'
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.hideSpinner();
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo verificar el código. Intenta de nuevo.',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  // ────────────────────────────────────────────
  // PASO 3: Cambiar contraseña
  // ────────────────────────────────────────────

  cambiarPassword(): void {
    if (this.FormularioPassword.invalid) {
      this.FormularioPassword.markAllAsTouched();

      if (this.FormularioPassword.hasError('passwordMismatch')) {
        Swal.fire({ icon: 'error', title: 'Las contraseñas no coinciden', confirmButtonColor: '#667eea' });
        return;
      }

      if (this.FormularioPassword.get('password')?.hasError('passwordStrength')) {
        Swal.fire({
          icon: 'warning',
          title: 'Contraseña débil',
          html: `<ul class="text-start">
            <li>Mínimo 8 caracteres</li>
            <li>Al menos una mayúscula</li>
            <li>Al menos una minúscula</li>
            <li>Al menos un número</li>
            <li>Al menos un carácter especial (!@#$%...)</li>
          </ul>`,
          confirmButtonColor: '#667eea'
        });
        return;
      }

      Swal.fire({ icon: 'warning', title: 'Completa todos los campos', confirmButtonColor: '#667eea' });
      return;
    }

    this.isLoading = true;
    this.showSpinner('Actualizando contraseña...');

    this._sso.CambiarPasswordConCodigo(
      this.emailVerificado,
      this.codigoVerificado,
      this.FormularioPassword.value.password
    ).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        this.hideSpinner();

        if (resp.statusok) {
          Swal.fire({
            icon: 'success',
            title: '¡Contraseña actualizada!',
            html: `<p>Tu contraseña ha sido cambiada exitosamente.</p>
                   <p class="mt-2">Ya puedes iniciar sesión con tu nueva contraseña.</p>`,
            confirmButtonColor: '#667eea',
            confirmButtonText: 'Ir a Login',
            timer: 4000,
            timerProgressBar: true
          }).then(() => {
            this.router.navigateByUrl('login');
            this.resetForm();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: resp.mensaje || 'No se pudo actualizar la contraseña.',
            confirmButtonColor: '#667eea'
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.hideSpinner();
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo actualizar la contraseña. Intenta de nuevo.',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  // ────────────────────────────────────────────
  // Navegación
  // ────────────────────────────────────────────

  volverAlEmail(): void {
    this.pasoActual = 'email';
    this.emailVerificado = '';
    this.FormularioCodigo.reset();
    this.timerSub?.unsubscribe();
    this.tiempoReenvio = 0;
  }

  cancelar(): void {
    const tieneDatos = this.FormularioEmail.value.email || this.emailVerificado;
    if (tieneDatos) {
      Swal.fire({
        icon: 'question',
        title: '¿Cancelar recuperación?',
        text: 'Se perderá el progreso actual',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar aquí',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#667eea'
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigateByUrl('login');
          this.resetForm();
        }
      });
    } else {
      this.router.navigateByUrl('login');
    }
  }

  // Navegación entre inputs del código OTP
  moverFoco(event: any, siguiente: string | null, anterior: string | null): void {
    const valor = event.target.value;
    if (valor && siguiente) {
      const el = document.getElementById(siguiente);
      el?.focus();
    }
    if (!valor && anterior) {
      const el = document.getElementById(anterior);
      el?.focus();
    }
  }

  onPegado(event: ClipboardEvent): void {
    event.preventDefault();
    const texto = event.clipboardData?.getData('text')?.replace(/\D/g, '').substring(0, 6) || '';
    if (texto.length === 6) {
      const campos = ['d1','d2','d3','d4','d5','d6'];
      campos.forEach((c, i) => this.FormularioCodigo.get(c)?.setValue(texto[i]));
    }
  }

  toggleMostrarPassword(): void { this.mostrarPassword = !this.mostrarPassword; }
  toggleMostrarConfirmPassword(): void { this.mostrarConfirmPassword = !this.mostrarConfirmPassword; }

  private resetForm(): void {
    this.pasoActual = 'email';
    this.emailVerificado = '';
    this.codigoVerificado = '';
    this.FormularioEmail.reset();
    this.FormularioCodigo.reset();
    this.FormularioPassword.reset();
    this.mostrarPassword = false;
    this.mostrarConfirmPassword = false;
    this.passwordValue = '';
    this.confirmPasswordValue = '';
    this.timerSub?.unsubscribe();
    this.tiempoReenvio = 0;
  }
}
