import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { LoginService } from 'src/app/Services/login.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'auth-login',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent{

  FormularioRegistro:FormGroup = this.formBuilder.group({
    estadoId:[1],
    companiaId:[1],
    rolId:[2],//cliente
    nombre: ['', Validators.required,],
    apellido: ['', Validators.required],
    email: ['@',[Validators.required,Validators.email]],
    password: ['', Validators.required],
    maxintentos:[4],
    intentosfallidos:[0],
  })
  constructor(private formBuilder: FormBuilder, private router: Router) { }
  private _Sso=inject(LoginService);
  registro() {
    if (this.FormularioRegistro.invalid) {
      this.FormularioRegistro.markAllAsTouched();
      return
    }
    this._Sso.RegistrarUsuario(this.FormularioRegistro.value).subscribe({
      next:(resp)=>{
          if (resp==true) {
            Swal.fire(
              'Registrado!',
              '',
              'success'
            )
            setTimeout(()=>{
              this.router.navigateByUrl('login');
            },500)
          }
      }
    })

  }
  cancelarRegistro() {
    this.router.navigateByUrl('login');
    this.FormularioRegistro.reset();
  }
  valido(campo: string){
    return this.FormularioRegistro.get(campo)?.invalid
    && this.FormularioRegistro.get(campo)?.touched;
  }

}
