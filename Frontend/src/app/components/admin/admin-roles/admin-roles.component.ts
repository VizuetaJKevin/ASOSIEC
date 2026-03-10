import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Rol } from "src/app/interfaces/rol.interface";
import { LoginService } from "src/app/services/login.service";
import Swal from "sweetalert2";

@Component({
    selector: 'app-admin-roles',
    templateUrl: './admin-roles.component.html',
    styleUrls: ['./admin-roles.component.css'],
    standalone: false
})
export class AdminRolesComponent implements OnInit {

  private _soo = inject(LoginService);
  public listaRoles: Rol[] = [];
  displayedColumns: string[] = ['Id', 'Descripcion', 'Opciones'];
  private _fb = inject(FormBuilder);

  // ✅ Control de modal
  public mostrarModalEditar: boolean = false;
  public formularioEdicion: FormGroup;

  Formulario: FormGroup = this._fb.group({
    id: [0, [Validators.required]],
    descripcion: ['', [Validators.required]]
  });

  constructor() {
    // Inicializar formulario de edición
    this.formularioEdicion = this._fb.group({
      id: [0],
      descripcion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  private cargar() {
    this._soo.ConsultarRoles().subscribe({
      next: (resp) => {
        console.log("Roles cargados:", resp);
        this.listaRoles = resp;
      }
    });
  }

  agregarDescripcion() {
    if (this.Formulario.invalid) {
      this.Formulario.markAllAsTouched();
      return;
    }

    console.log("Rol a agregar:", this.Formulario.value);
    this._soo.RegistrarRol(this.Formulario.value).subscribe({
      next: (resp) => {
        console.log("Nuevo rol creado:", resp);
        Swal.fire('¡Registrado!', 'El rol ha sido creado exitosamente', 'success');
        this.Formulario.reset({ id: 0, descripcion: '' });
        this.cargar();
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo crear el rol', 'error');
      }
    });
  }

  // ✅ ABRIR MODAL EDITAR
  abrirModalEditar(rol: Rol) {
    this.formularioEdicion.patchValue({
      id: rol.id,
      descripcion: rol.descripcion
    });

    this.mostrarModalEditar = true;
  }

  // ✅ CERRAR MODAL
  cerrarModal() {
    this.mostrarModalEditar = false;
    this.formularioEdicion.reset({ id: 0, descripcion: '' });
  }

  // ✅ ACTUALIZAR ROL
  actualizarRol() {
    if (this.formularioEdicion.invalid) {
      this.formularioEdicion.markAllAsTouched();
      return;
    }

    this._soo.ActualizarRol(this.formularioEdicion.value).subscribe({
      next: (resp) => {
        Swal.fire('¡Actualizado!', 'El rol ha sido actualizado correctamente', 'success');
        this.cerrarModal();
        this.cargar();
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo actualizar el rol', 'error');
      }
    });
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._soo.EliminarRol(id).subscribe({
          next: (resp) => {
            Swal.fire('¡Eliminado!', 'El rol ha sido eliminado', 'success');
            this.cargar();
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar el rol. Puede estar en uso.', 'error');
          }
        });
      }
    });
  }

  valido(campo: string) {
    return this.Formulario.get(campo)?.invalid && this.Formulario.get(campo)?.touched;
  }

  // ✅ Alias para compatibilidad
  abrirDialogoEditar(rol: Rol) {
    this.abrirModalEditar(rol);
  }
}
