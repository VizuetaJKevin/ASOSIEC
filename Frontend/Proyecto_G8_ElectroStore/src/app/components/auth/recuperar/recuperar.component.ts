import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/Api.service';
import { LoginService } from 'src/app/Services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css']
})

export class RecuperarComponent {
  public valid: boolean = false;
  private _sso = inject(LoginService);
  FormularioRecuperar: FormGroup = this.formBuilder.group({
    email: ['grupo8@ug.edu.ec', [Validators.email, Validators.required]]
  });
  FormularioCPassword: FormGroup = this.formBuilder.group({
    password: ['', Validators.required]
  });

  constructor(private formBuilder: FormBuilder, private router: Router) { }

  recuperarBtnAceptar() {
    if (this.FormularioRecuperar.invalid) {
      this.FormularioRecuperar.markAllAsTouched();
      return;
    }

    this._sso.VerifcaMail(this.FormularioRecuperar.value.email).subscribe({
      next: (resp) => {
        this.valid = resp;

        if (!this.valid) {
          // Muestra la alerta de que el correo no existe
          Swal.fire({
            icon: 'error',
            title: 'Correo no encontrado',
            text: 'El correo no existe en nuestra base de datos',
          });
        }
      },
    });
  }

  recuperarBtnCancelar() {
    this.router.navigateByUrl('login');
    this.FormularioRecuperar.reset();
  }

  cambiar() {
    if (this.FormularioCPassword.invalid) {
      this.FormularioCPassword.markAllAsTouched();
      return;
    }

    this._sso.Recuperarpsw(this.FormularioRecuperar.value.email, this.FormularioCPassword.value.password)
      .subscribe({
        next: (reps) => {
          // Muestra la alerta de que los datos se actualizaron con éxito
          Swal.fire({
            icon: 'success',
            title: 'Datos actualizados con éxito',
            showConfirmButton: false,
            timer: 1500
          });

          // Redirige a la página de login
          this.router.navigateByUrl('login');
        }
      });
  }

  valido(formulario: FormGroup, campo: string) {
    return formulario.get(campo)?.invalid
      && formulario.get(campo)?.touched;
  }
}
