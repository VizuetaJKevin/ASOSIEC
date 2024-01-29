import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { LoginService } from '../../../Services/login.service';

@Component({
  selector: 'client-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private _sso=inject(LoginService);
  private _fb=inject(FormBuilder);

  formulario:FormGroup=this._fb.group({
    id:[0],
    estadoId:[1],
    companiaId:[1],
    rolId:[2],
    nombre:['',[Validators.required]],
    apellido:['',[Validators.required]],
    email:[''],
    password:['',[Validators.required]],
    maxintentos:[4],
    intentosfallidos:[0],
  })
  ngOnInit(): void {
    if (this._sso.usuario.id!=0) {
      this._sso.ConsultarUsuarios().subscribe({
        next:(resp)=>{
          const usuario=resp.find(p=>p.id===this._sso.usuario.id)!;
          this.formulario.get('id')?.setValue(usuario.id);
          this.formulario.get('estadoId')?.setValue(usuario.estadoId);
          this.formulario.get('rolId')?.setValue(usuario.rolId);
          this.formulario.get('nombre')?.setValue(usuario.nombre);
          this.formulario.get('apellido')?.setValue(usuario.apellido);
          this.formulario.get('email')?.setValue(usuario.email);
          this.formulario.get('password')?.setValue(usuario.password);
          this.formulario.get('maxintentos')?.setValue(usuario.maxintentos);
          this.formulario.get('intentosfallidos')?.setValue(usuario.maxintentos);
        }
      })

    }
  }


  Actualizar(){
    if (this.formulario.invalid) {
      return
     }
     this._sso.ActualizarUsuario(this.formulario.value).subscribe({
      next:(resp)=>{
          Swal.fire(
              'Actualizado!',
              '',
              'success'
          )
      }
     })
  }



}
