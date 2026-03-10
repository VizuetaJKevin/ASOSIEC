import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { EstadosService } from "src/app/services/estados.service";
import { EstadoItem } from "src/app/interfaces/estado-item.interface";
import { EstadoOrden } from "src/app/interfaces/estado-oden.interface";
import { EstadoProducto } from "src/app/interfaces/estado-producto.interface";
import { EstadoUsuario } from "src/app/interfaces/estado-usuario.interface";

// Tipo unión para todos los estados
type TodosLosEstados = EstadoItem | EstadoOrden | EstadoProducto | EstadoUsuario;

@Component({
    selector: 'app-admin-estados',
    templateUrl: './admin-estados.component.html',
    styleUrls: ['./admin-estados.component.css'],
    standalone: false
})
export class AdminEstadosComponent implements OnInit {
  private estadosService = inject(EstadosService);
  private _fb = inject(FormBuilder);
  private router = inject(Router);

  // Listas para cada tipo de estado
  listaEstadosItem: EstadoItem[] = [];
  listaEstadosOrden: EstadoOrden[] = [];
  listaEstadosProducto: EstadoProducto[] = [];
  listaEstadosUsuario: EstadoUsuario[] = [];

  // Columnas para las tablas
  displayedColumns: string[] = ['Id', 'Codigo', 'Descripcion', 'Activo', 'Opciones'];
  displayedColumnsOrden: string[] = ['Id', 'Codigo', 'Descripcion', 'Activo', 'OrdenFlujo', 'Opciones'];

  // ✅ Control de modales
  public mostrarModalEditar: boolean = false;
  public mostrarModalAgregar: boolean = false;
  public formularioEdicion: FormGroup;
  public tipoEstadoActual: 'item' | 'orden' | 'producto' | 'usuario' = 'item';
  public tituloModal: string = '';
  public tipoModalAgregar: 'item' | 'orden' | 'producto' | 'usuario' = 'item';

  // Formularios para cada tipo
  formularioItem: FormGroup;
  formularioOrden: FormGroup;
  formularioProducto: FormGroup;
  formularioUsuario: FormGroup;

  constructor() {
    // Inicializar formularios de registro
    this.formularioItem = this._fb.group({
      id: [0],
      codigo: ['', [Validators.required, Validators.maxLength(30)]],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      activo: [true]
    });

    this.formularioOrden = this._fb.group({
      id: [0],
      codigo: ['', [Validators.required, Validators.maxLength(30)]],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      activo: [true],
      orden_flujo: [null]
    });

    this.formularioProducto = this._fb.group({
      id: [0],
      codigo: ['', [Validators.required, Validators.maxLength(30)]],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      activo: [true]
    });

    this.formularioUsuario = this._fb.group({
      id: [0],
      codigo: ['', [Validators.required, Validators.maxLength(30)]],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      activo: [true]
    });

    // Inicializar formulario de edición
    this.formularioEdicion = this._fb.group({
      id: [0],
      codigo: ['', [Validators.required, Validators.maxLength(30)]],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      activo: [true],
      orden_flujo: [null]
    });
  }

  ngOnInit(): void {
    this.cargarTodos();
  }

  // ============================================
  // CARGAR DATOS
  // ============================================
  private cargarTodos() {
    this.cargarEstadosItem();
    this.cargarEstadosOrden();
    this.cargarEstadosProducto();
    this.cargarEstadosUsuario();
  }

  private cargarEstadosItem() {
    this.estadosService.ConsultarEstadosItem().subscribe({
      next: (resp) => {
        this.listaEstadosItem = resp;
        console.log('✅ Estados Item cargados:', resp);
      },
      error: (err) => {
        console.error('❌ Error al cargar estados item:', err);
      }
    });
  }

  private cargarEstadosOrden() {
    this.estadosService.ConsultarEstadosOrden().subscribe({
      next: (resp) => {
        this.listaEstadosOrden = resp;
        console.log('✅ Estados Orden cargados:', resp);
      },
      error: (err) => {
        console.error('❌ Error al cargar estados orden:', err);
      }
    });
  }

  private cargarEstadosProducto() {
    this.estadosService.ConsultarEstadosProducto().subscribe({
      next: (resp) => {
        this.listaEstadosProducto = resp;
        console.log('✅ Estados Producto cargados:', resp);
      },
      error: (err) => {
        console.error('❌ Error al cargar estados producto:', err);
      }
    });
  }

  private cargarEstadosUsuario() {
    this.estadosService.ConsultarEstadosUsuario().subscribe({
      next: (resp) => {
        this.listaEstadosUsuario = resp;
        console.log('✅ Estados Usuario cargados:', resp);
      },
      error: (err) => {
        console.error('❌ Error al cargar estados usuario:', err);
      }
    });
  }

  // ============================================
  // REGISTRAR
  // ============================================
  registrarEstadoItem() {
    if (this.formularioItem.invalid) {
      this.formularioItem.markAllAsTouched();
      return;
    }

    this.estadosService.RegistrarEstadoItem(this.formularioItem.value).subscribe({
      next: (resp) => {
        if (resp.success) {
          Swal.fire('¡Registrado!', resp.mensaje || 'Estado de item registrado correctamente', 'success');
          this.formularioItem.reset({ id: 0, activo: true });
          this.cargarEstadosItem();
          this.cerrarModalAgregar();
        } else {
          Swal.fire('Error', resp.mensaje || 'No se pudo registrar el estado', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', 'Error al registrar el estado de item', 'error');
      }
    });
  }

  registrarEstadoOrden() {
    if (this.formularioOrden.invalid) {
      this.formularioOrden.markAllAsTouched();
      return;
    }

    this.estadosService.RegistrarEstadoOrden(this.formularioOrden.value).subscribe({
      next: (resp) => {
        if (resp.success) {
          Swal.fire('¡Registrado!', resp.mensaje || 'Estado de orden registrado correctamente', 'success');
          this.formularioOrden.reset({ id: 0, activo: true, orden_flujo: null });
          this.cargarEstadosOrden();
          this.cerrarModalAgregar();
        } else {
          Swal.fire('Error', resp.mensaje || 'No se pudo registrar el estado', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', 'Error al registrar el estado de orden', 'error');
      }
    });
  }

  registrarEstadoProducto() {
    if (this.formularioProducto.invalid) {
      this.formularioProducto.markAllAsTouched();
      return;
    }

    this.estadosService.RegistrarEstadoProducto(this.formularioProducto.value).subscribe({
      next: (resp) => {
        if (resp.success) {
          Swal.fire('¡Registrado!', resp.mensaje || 'Estado de producto registrado correctamente', 'success');
          this.formularioProducto.reset({ id: 0, activo: true });
          this.cargarEstadosProducto();
          this.cerrarModalAgregar();
        } else {
          Swal.fire('Error', resp.mensaje || 'No se pudo registrar el estado', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', 'Error al registrar el estado de producto', 'error');
      }
    });
  }

  registrarEstadoUsuario() {
    if (this.formularioUsuario.invalid) {
      this.formularioUsuario.markAllAsTouched();
      return;
    }

    this.estadosService.RegistrarEstadoUsuario(this.formularioUsuario.value).subscribe({
      next: (resp) => {
        if (resp.success) {
          Swal.fire('¡Registrado!', resp.mensaje || 'Estado de usuario registrado correctamente', 'success');
          this.formularioUsuario.reset({ id: 0, activo: true });
          this.cargarEstadosUsuario();
          this.cerrarModalAgregar();
        } else {
          Swal.fire('Error', resp.mensaje || 'No se pudo registrar el estado', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', 'Error al registrar el estado de usuario', 'error');
      }
    });
  }

  // ============================================
  // MODAL AGREGAR
  // ============================================
  abrirModalAgregar(tipo: 'item' | 'orden' | 'producto' | 'usuario') {
    this.tipoModalAgregar = tipo;

    const titulos = {
      'item': 'Nuevo Estado de Item',
      'orden': 'Nuevo Estado de Orden',
      'producto': 'Nuevo Estado de Producto',
      'usuario': 'Nuevo Estado de Usuario'
    };
    this.tituloModal = titulos[tipo];

    // Resetear el formulario correspondiente
    switch(tipo) {
      case 'item':
        this.formularioItem.reset({ id: 0, activo: true });
        break;
      case 'orden':
        this.formularioOrden.reset({ id: 0, activo: true, orden_flujo: null });
        break;
      case 'producto':
        this.formularioProducto.reset({ id: 0, activo: true });
        break;
      case 'usuario':
        this.formularioUsuario.reset({ id: 0, activo: true });
        break;
    }

    this.mostrarModalAgregar = true;
  }

  cerrarModalAgregar() {
    this.mostrarModalAgregar = false;
  }

  guardarNuevoEstado() {
    switch(this.tipoModalAgregar) {
      case 'item':
        this.registrarEstadoItem();
        break;
      case 'orden':
        this.registrarEstadoOrden();
        break;
      case 'producto':
        this.registrarEstadoProducto();
        break;
      case 'usuario':
        this.registrarEstadoUsuario();
        break;
    }

    // Cerrar modal si el registro fue exitoso
    if (this.getFormularioActual().valid) {
      this.cerrarModalAgregar();
    }
  }

  getFormularioActual(): FormGroup {
    switch(this.tipoModalAgregar) {
      case 'item': return this.formularioItem;
      case 'orden': return this.formularioOrden;
      case 'producto': return this.formularioProducto;
      case 'usuario': return this.formularioUsuario;
      default: return this.formularioItem;
    }
  }

  // ============================================
  // MODAL EDITAR
  // ============================================
  abrirModalEditar(elemento: TodosLosEstados, tipo: 'item' | 'orden' | 'producto' | 'usuario') {
    this.tipoEstadoActual = tipo;

    const titulos = {
      'item': 'Estado de Item',
      'orden': 'Estado de Orden',
      'producto': 'Estado de Producto',
      'usuario': 'Estado de Usuario'
    };
    this.tituloModal = titulos[tipo];

    if (tipo === 'orden') {
      const estadoOrden = elemento as EstadoOrden;
      this.formularioEdicion.patchValue({
        id: estadoOrden.id,
        codigo: estadoOrden.codigo,
        descripcion: estadoOrden.descripcion,
        activo: estadoOrden.activo,
        orden_flujo: estadoOrden.orden_flujo
      });
    } else {
      this.formularioEdicion.patchValue({
        id: elemento.id,
        codigo: elemento.codigo,
        descripcion: elemento.descripcion,
        activo: elemento.activo,
        orden_flujo: null
      });
    }

    this.mostrarModalEditar = true;
  }

  cerrarModal() {
    this.mostrarModalEditar = false;
    this.formularioEdicion.reset({ id: 0, activo: true, orden_flujo: null });
  }

  actualizarEstado() {
    if (this.formularioEdicion.invalid) {
      this.formularioEdicion.markAllAsTouched();
      return;
    }

    const estado = this.formularioEdicion.value;
    let observable;

    switch (this.tipoEstadoActual) {
      case 'item':
        observable = this.estadosService.ActualizarEstadoItem(estado);
        break;
      case 'orden':
        observable = this.estadosService.ActualizarEstadoOrden(estado);
        break;
      case 'producto':
        observable = this.estadosService.ActualizarEstadoProducto(estado);
        break;
      case 'usuario':
        observable = this.estadosService.ActualizarEstadoUsuario(estado);
        break;
      default:
        return;
    }

    observable.subscribe({
      next: (resp: any) => {
        if (resp.success) {
          Swal.fire('¡Actualizado!', resp.mensaje || 'Estado actualizado correctamente', 'success');
          this.cerrarModal();
          this.cargarTodos();
        } else {
          Swal.fire('Error', resp.mensaje || 'No se pudo actualizar el estado', 'error');
        }
      },
      error: (err) => {
        Swal.fire('Error', 'Error al actualizar el estado', 'error');
      }
    });
  }

  // ✅ Alias para compatibilidad
  editarEstado(elemento: TodosLosEstados, tipo: 'item' | 'orden' | 'producto' | 'usuario') {
    this.abrirModalEditar(elemento, tipo);
  }

  // ============================================
  // ELIMINAR
  // ============================================
  eliminarEstado(id: number, tipo: 'item' | 'orden' | 'producto' | 'usuario') {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        let observable;

        switch (tipo) {
          case 'item':
            observable = this.estadosService.EliminarEstadoItem(id);
            break;
          case 'orden':
            observable = this.estadosService.EliminarEstadoOrden(id);
            break;
          case 'producto':
            observable = this.estadosService.EliminarEstadoProducto(id);
            break;
          case 'usuario':
            observable = this.estadosService.EliminarEstadoUsuario(id);
            break;
          default:
            return;
        }

        observable.subscribe({
          next: (resp: any) => {
            if (resp.success) {
              Swal.fire('¡Eliminado!', resp.mensaje || 'El estado ha sido eliminado', 'success');
              this.cargarTodos();
            } else {
              Swal.fire('Error', resp.mensaje || 'No se pudo eliminar. Puede estar en uso.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', 'El estado está en uso y no puede ser eliminado', 'error');
          }
        });
      }
    });
  }

  // ============================================
  // GETTERS
  // ============================================
  get esOrden(): boolean {
    return this.tipoEstadoActual === 'orden';
  }

  // ============================================
  // VALIDACIONES
  // ============================================
  validoItem(campo: string): boolean {
    const control = this.formularioItem.get(campo);
    return control ? control.invalid && control.touched : false;
  }

  validoOrden(campo: string): boolean {
    const control = this.formularioOrden.get(campo);
    return control ? control.invalid && control.touched : false;
  }

  validoProducto(campo: string): boolean {
    const control = this.formularioProducto.get(campo);
    return control ? control.invalid && control.touched : false;
  }

  validoUsuario(campo: string): boolean {
    const control = this.formularioUsuario.get(campo);
    return control ? control.invalid && control.touched : false;
  }
}
