import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/Api.service';
import { LoginService } from 'src/app/Services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private _loginS=inject(LoginService);
  private service=inject(ApiService);
  FormularioLogin:FormGroup = this.formBuilder.group({
    email: ['alguien@gmail.com', [Validators.required, Validators.email]],
    password: ['12345', Validators.required]

  })
  constructor(private formBuilder: FormBuilder, private router: Router) { }
  login() {
    if (this.FormularioLogin.invalid) {
      this.FormularioLogin.markAllAsTouched();
      return;
    }
    this._loginS.Login(this.FormularioLogin.value).subscribe({
      next: (resp) => {
        console.log(resp);

        if (resp) {
          this.service.items();
          this.router.navigateByUrl('/');

          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            showConfirmButton: false,
            timer: 1500
          });

        } else {
          Swal.fire(
            'Datos Incorrectos',
            '',
            'error'
          );
        }
      }
    });
  }

  recuperar(){
    this.router.navigateByUrl('recuperar');
  }

  registrar(){
    this.router.navigateByUrl('registro');
  }

  valido(campo: string){
    return this.FormularioLogin.get(campo)?.invalid
    && this.FormularioLogin.get(campo)?.touched;
  }

}
