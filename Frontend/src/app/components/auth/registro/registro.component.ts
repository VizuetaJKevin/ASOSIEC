import { Component, inject, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { passwordStrengthValidator } from 'src/app/validators/password-strength.validator';
import Swal from 'sweetalert2';

@Component({
    selector: 'auth-login',
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.css'],
    standalone: false
})
export class RegistroComponent implements AfterViewInit {

  private _Sso = inject(LoginService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  tipoUsuario: 'cliente' | 'vendedor' = 'cliente';
  passwordValue: string = '';

  // Controla si los inputs se renderizan — empieza en false para
  // que Chrome no pueda hacer autofill antes de que Angular tome control
  formVisible = false;

  FormularioRegistro: FormGroup = this.formBuilder.group({
    estadoUsuarioId: [1],
    rolId: [2],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      passwordStrengthValidator()
    ]],
    maxintentos: [5],
    intentosfallidos: [0]
  });

  constructor() {
    this.FormularioRegistro.get('password')?.valueChanges.subscribe(value => {
      this.passwordValue = value || '';
    });
  }

  ngAfterViewInit(): void {
    // Mostramos el form tras un tick para evitar el autofill de Chrome,
    // luego hacemos reset para limpiar cualquier valor que haya inyectado
    setTimeout(() => {
      this.formVisible = true;
      setTimeout(() => {
        this.FormularioRegistro.reset({
          estadoUsuarioId: 1,
          rolId: 2,
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          maxintentos: 5,
          intentosfallidos: 0
        });
        this.passwordValue = '';
      }, 100);
    }, 0);
  }

  seleccionarTipo(tipo: 'cliente' | 'vendedor') {
    this.tipoUsuario = tipo;
    if (tipo === 'vendedor') {
      this.FormularioRegistro.patchValue({ rolId: 3, estadoUsuarioId: 4 });
    } else {
      this.FormularioRegistro.patchValue({ rolId: 2, estadoUsuarioId: 1 });
    }
  }

  registro() {
    if (this.FormularioRegistro.invalid) {
      this.FormularioRegistro.markAllAsTouched();

      const passwordControl = this.FormularioRegistro.get('password');
      if (passwordControl?.hasError('passwordStrength')) {
        Swal.fire({
          icon: 'warning',
          title: 'Contraseña débil',
          html: `
            <p>Tu contraseña debe cumplir con los siguientes requisitos:</p>
            <ul class="text-start">
              <li>Mínimo 8 caracteres</li>
              <li>Al menos una letra mayúscula</li>
              <li>Al menos una letra minúscula</li>
              <li>Al menos un número</li>
              <li>Al menos un carácter especial (!@#$%...)</li>
            </ul>
          `,
          confirmButtonColor: '#667eea'
        });
        return;
      }

      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos correctamente.',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    this._Sso.RegistrarUsuario(this.FormularioRegistro.value).subscribe({
      next: (resp) => {
        if (resp.success !== false) {
          if (this.tipoUsuario === 'vendedor') {
            Swal.fire({
              icon: 'info',
              title: '¡Solicitud Enviada!',
              html: `
                <p>Tu solicitud para ser <strong>vendedor</strong> ha sido registrada.</p>
                <p>Un administrador revisará tu solicitud en las próximas <strong>24-48 horas</strong>.</p>
                <p>Recibirás un email de confirmación.</p>
              `,
              confirmButtonColor: '#667eea',
              confirmButtonText: 'Entendido'
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: '¡Registrado!',
              text: 'Tu cuenta ha sido creada exitosamente.',
              confirmButtonColor: '#667eea',
              timer: 2000,
              showConfirmButton: false
            });
          }
          setTimeout(() => { this.router.navigateByUrl('login'); }, 2000);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: resp.mensaje || 'No se pudo completar el registro.',
            confirmButtonColor: '#667eea'
          });
        }
      },
      error: (err) => {
        console.error('❌ Error en registro:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Hubo un problema al procesar tu solicitud. Intenta nuevamente.',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  cancelarRegistro() {
    this.router.navigateByUrl('login');
    this.FormularioRegistro.reset();
  }

  /** Fallback si el logo no carga */
  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  valido(campo: string) {
    return this.FormularioRegistro.get(campo)?.invalid
      && this.FormularioRegistro.get(campo)?.touched;
  }

  get passwordErrors() {
    const control = this.FormularioRegistro.get('password');
    if (!control?.errors) return null;
    return control.errors;
  }
}
