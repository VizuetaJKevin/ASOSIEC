import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Estado } from "src/app/interfaces/estado.interface";
import { Rol } from "src/app/interfaces/rol.interface";
import { Usuario } from "src/app/interfaces/usuario.interface";
import { LoginService } from "src/app/Services/login.service";
import Swal from "sweetalert2";


@Component({
  selector: 'app-adm-usuarios',
  templateUrl: './adm-usuarios.component.html',
  styleUrls: ['./adm-usuarios.component.css']
})
export class AdmUsuariosComponent implements OnInit {

  displayedColumns: string[] = ['Id', 'Nombre', 'Email','Opciones'];
  private _Sso=inject(LoginService);
  private _fb=inject(FormBuilder);
  public ListaEstados:Estado[]=[];
  public ListaRoles:Rol[]=[];
  public ListaUsuarios:Usuario[]=[];
  public usuario!:Usuario|null;
  formulario:FormGroup=this._fb.group({
      id:[0],
      estadoId:[1],
      companiaId:[1],
      rolId:[2],
      nombre:['',[Validators.required]],
      apellido:['conor'],
      email:['rock@gmail.com'],
      password:['1234'],
      maxintentos:[4],
      intentosfallidos:[0],
  })

  formularioRegistro: FormGroup = this._fb.group({
    nombre: ['', [Validators.required]],
    apellido: [''],
    email: [''],
    password: [''],
    estadoId: [1],
    rolId: [2],
  });
  ngOnInit(): void {
      this._Sso.ConsultarUsuarios().subscribe(reps=>{
          this.ListaUsuarios=reps;
      })
      this._Sso.ConsultarEstados().subscribe(reps=>{
          this.ListaEstados=reps.slice(0,3);
      })
      this._Sso.ConsultarRoles().subscribe(reps=>{
          this.ListaRoles=reps;
      })
  }

  registrar(){
     if (this.formulario.invalid) {
      return
     }
     this._Sso.RegistrarUsuario(this.formulario.value).subscribe({
      next:(resp)=>{
          Swal.fire(
              'Registrado!',
              '',
              'success'
          )
          this.formulario.reset();
      }
     })
  }


  editar(user:Usuario){
      this.usuario=user;
      this.formulario.get('id')?.setValue(this.usuario.id);
      this.formulario.get('estadoId')?.setValue(this.usuario.estadoId);
      this.formulario.get('rolId')?.setValue(this.usuario.rolId);
      this.formulario.get('nombre')?.setValue(this.usuario.nombre);
      this.formulario.get('apellido')?.setValue(this.usuario.apellido);
      this.formulario.get('email')?.setValue(this.usuario.email);
      this.formulario.get('password')?.setValue(this.usuario.password);
      this.formulario.get('maxintentos')?.setValue(this.usuario.maxintentos);
      this.formulario.get('intentosfallidos')?.setValue(this.usuario.maxintentos);
  }
  eliminar(id:number){
      if (id!=null) {
          this._Sso.EliminarUsuario(id).subscribe({
              next:(resp)=>{
                  Swal.fire(
                      'Eliminado!',
                      '',
                      'success'
                  )
              }
             })
      }
  }
  Actualizar(){
      if (this.formulario.invalid) {
          return
         }
         this._Sso.ActualizarUsuario(this.formulario.value).subscribe({
          next:(resp)=>{
              Swal.fire(
                  'Actualizado!',
                  '',
                  'success'
              )
              this.formulario.reset();
              this.usuario=null;
          }
         })
  }
}
