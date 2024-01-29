import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Rol } from "src/app/interfaces/rol.interface";
import { LoginService } from "src/app/Services/login.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-adm-roles',
  templateUrl: './adm-roles.component.html',
  styleUrls: ['./adm-roles.component.css']
})
export class AdmRolesComponent implements OnInit {

  private _soo=inject(LoginService);
  public listaRoles: Rol[] = [];
  displayedColumns: string[] = ['Id', 'Descripcion', 'Opciones'];
  private _fb = inject(FormBuilder);
  Formulario: FormGroup = this._fb.group({
    id: [0, [Validators.required]],
    descripcion:['',[Validators.required]]
  })
  ngOnInit(): void {
    this.cargar();
  }
  private cargar(){
    this._soo.ConsultarRoles().subscribe({
      next:(resp)=>{
        this.listaRoles=resp;
      }
    })
  }
  agregarDescripcion(){
    if (this.Formulario.invalid) {
      this.Formulario.markAllAsTouched();
      return
    }
    this._soo.RegistrarRol(this.Formulario.value).subscribe({
      next:(resp)=>{
        Swal.fire(
          'Registrado!',
          '',
          'success'
       )
       this.cargar();
      }
    })
  }
  public edit: boolean = false;
  editar(elemento: any) {
    this.Formulario.get("descripcion")?.setValue(elemento.descripcion);
    this.Formulario.get("id")?.setValue(elemento.id);
    this.edit = true;
  }
  eliminar(id: number) {
    this._soo.EliminarRol(id).subscribe({
      next:(resp)=>{
        Swal.fire(
          'Eliminado!',
          '',
          'success'
        )
        this.cargar();
      }
    })
  }

  valido(campo: string){
    return this.Formulario.get(campo)?.invalid
    && this.Formulario.get(campo)?.touched;
  }

  guardar(){
    this.edit=false;
    if (this.Formulario.invalid) {
      return
     }
    this._soo.ActualizarRol(this.Formulario.value).subscribe({
      next:(resp)=>{
        Swal.fire(
          'Actualizado!',
          '',
          'success'
        )
        this.cargar();
      }
    })
  }

}
