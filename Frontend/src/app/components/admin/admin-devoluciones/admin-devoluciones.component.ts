import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from 'src/app/services/Api.service';
import { LoginService } from 'src/app/services/login.service';
import { Devolucion, EstadoDevolucion, ItemDevolucion } from 'src/app/interfaces/devolucion.interface';
import { producto } from 'src/app/interfaces/producto.interface';

@Component({
  selector: 'app-admin-devoluciones',
  templateUrl: './admin-devoluciones.component.html',
  styleUrls: ['./admin-devoluciones.component.css'],
  standalone: false
})
export class AdminDevolucionesComponent implements OnInit {

  private _apiserv = inject(ApiService);
  private _sso = inject(LoginService);

  // Estados y listas principales
  public ListaDevoluciones: Devolucion[] = [];
  public ListaEstadosDevolucion: EstadoDevolucion[] = [];
  public ListaProductos: producto[] = [];

  // Control de carga
  public cargando: boolean = true;
  public errorCarga: boolean = false;
  public mensajeError: string = '';

  // Filtros
  public filtroNumeroOrden: string = '';
  public filtroCliente: string = '';
  public filtroFechaDesde: string = '';
  public filtroFechaHasta: string = '';
  public filtroEstado: string = '';

  // Modal de detalle
  public mostrarModalDetalle: boolean = false;
  public devolucionSeleccionada: Devolucion | null = null;
  public itemsDevolucion: ItemDevolucion[] = [];
  public cargandoItems: boolean = false;

  // Modal de aprobación/rechazo
  public mostrarModalRespuesta: boolean = false;
  public accionModal: 'APROBAR' | 'RECHAZAR' = 'APROBAR';
  public numeroSeguimiento: string = '';
  public respuestaAdmin: string = '';
  public procesandoRespuesta: boolean = false;

  // Visualización de fotos
  public mostrarModalFotos: boolean = false;
  public fotosActuales: string[] = [];
  public fotoActualIndex: number = 0;

  // Estadísticas
  public estadisticas = {
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    en_proceso: 0,
    completadas: 0
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Carga todos los datos necesarios
   */
  cargarDatos(): void {
    this.cargando = true;
    this.errorCarga = false;

    // Cargar estados de devolución
    this._apiserv.ConsultarEstadosDevolucion().subscribe({
      next: (estados) => {
        this.ListaEstadosDevolucion = estados.filter(e => e.activo);
        console.log('✅ Estados de devolución cargados:', this.ListaEstadosDevolucion.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar estados:', err);
        this.errorCarga = true;
        this.mensajeError = 'Error al cargar estados de devolución';
      }
    });

    // Cargar productos
    this._apiserv.ConsultarProducto().subscribe({
      next: (productos) => {
        this.ListaProductos = productos;
        console.log('✅ Productos cargados:', this.ListaProductos.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
      }
    });

    // Cargar todas las devoluciones
    this._apiserv.ConsultarTodasDevoluciones().subscribe({
      next: (devoluciones) => {
        this.ListaDevoluciones = devoluciones;
        this.calcularEstadisticas();
        this.cargando = false;
        console.log('✅ Devoluciones cargadas:', this.ListaDevoluciones.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar devoluciones:', err);
        this.cargando = false;
        this.errorCarga = true;
        this.mensajeError = 'Error al cargar las devoluciones';
      }
    });
  }

  /**
   * Calcula las estadísticas de devoluciones
   */
  calcularEstadisticas(): void {
    // Solo cuenta estados visibles en el panel
    const visibles = this.ListaDevoluciones.filter(
      d => !['CANCELADO', 'EN_PROCESO', 'COMPLETADO'].includes(d.estado_codigo ?? '')
    );
    this.estadisticas.total = visibles.length;
    this.estadisticas.pendientes = this.obtenerDevolucionesPorEstado('PENDIENTE').length;
    this.estadisticas.aprobadas = this.obtenerDevolucionesPorEstado('APROBADO').length;
    this.estadisticas.rechazadas = this.obtenerDevolucionesPorEstado('RECHAZADA').length;
    this.estadisticas.en_proceso = 0;
    this.estadisticas.completadas = 0;
  }

  /**
   * Obtiene devoluciones filtradas por estado
   */
  obtenerDevolucionesPorEstado(codigoEstado: string): Devolucion[] {
    return this.ListaDevoluciones.filter(d => d.estado_codigo === codigoEstado);
  }

  /**
   * Aplica todos los filtros a las devoluciones
   */
  // Estados que NO deben aparecer en el panel de admin
  private readonly ESTADOS_OCULTOS = ['CANCELADO', 'EN_PROCESO', 'COMPLETADO'];

  get devolucionesFiltradas(): Devolucion[] {
    return this.ListaDevoluciones.filter(dev => {
      // Excluir estados ocultos (canceladas por cliente, en proceso, completadas)
      if (this.ESTADOS_OCULTOS.includes(dev.estado_codigo ?? '')) return false;

      const coincideOrden = !this.filtroNumeroOrden ||
        dev.token_orden?.toLowerCase().includes(this.filtroNumeroOrden.toLowerCase());

      const coincideCliente = !this.filtroCliente ||
        dev.nombre_usuario?.toLowerCase().includes(this.filtroCliente.toLowerCase()) ||
        dev.apellido_usuario?.toLowerCase().includes(this.filtroCliente.toLowerCase()) ||
        dev.email_usuario?.toLowerCase().includes(this.filtroCliente.toLowerCase());

      const coincideFechaDesde = !this.filtroFechaDesde ||
        new Date(dev.fecha_solicitud) >= new Date(this.filtroFechaDesde);

      const coincideFechaHasta = !this.filtroFechaHasta ||
        new Date(dev.fecha_solicitud) <= new Date(this.filtroFechaHasta);

      const coincideEstado = !this.filtroEstado ||
        dev.estado_codigo === this.filtroEstado;

      return coincideOrden && coincideCliente && coincideFechaDesde &&
             coincideFechaHasta && coincideEstado;
    });
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtroNumeroOrden = '';
    this.filtroCliente = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.filtroEstado = '';
  }

  /**
   * Abre el modal de detalle de una devolución
   */
  verDetalle(devolucion: Devolucion): void {
    this.devolucionSeleccionada = devolucion;
    this.mostrarModalDetalle = true;
    this.cargarItemsDevolucion(devolucion.id);
  }

  /**
   * Carga los items de una devolución específica
   */
  cargarItemsDevolucion(devolucionId: number): void {
    this.cargandoItems = true;
    this._apiserv.ConsultarItemsDevolucion(devolucionId).subscribe({
      next: (items) => {
        this.itemsDevolucion = items;
        this.cargandoItems = false;
        console.log('✅ Items de devolución cargados:', items.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar items:', err);
        this.cargandoItems = false;
      }
    });
  }

  /**
   * Cierra el modal de detalle
   */
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.devolucionSeleccionada = null;
    this.itemsDevolucion = [];
  }

  /**
   * Abre el modal para aprobar una devolución
   */
  abrirModalAprobar(devolucion: Devolucion): void {
    this.devolucionSeleccionada = devolucion;
    this.accionModal = 'APROBAR';
    this.mostrarModalRespuesta = true;
    this.numeroSeguimiento = '';
    this.respuestaAdmin = '';
  }

  /**
   * Abre el modal para rechazar una devolución
   */
  abrirModalRechazar(devolucion: Devolucion): void {
    this.devolucionSeleccionada = devolucion;
    this.accionModal = 'RECHAZAR';
    this.mostrarModalRespuesta = true;
    this.numeroSeguimiento = '';
    this.respuestaAdmin = '';
  }

  /**
   * Cierra el modal de respuesta
   */
  cerrarModalRespuesta(): void {
    this.mostrarModalRespuesta = false;
    this.devolucionSeleccionada = null;
    this.numeroSeguimiento = '';
    this.respuestaAdmin = '';
  }

  procesarRespuesta(): void {
    if (!this.devolucionSeleccionada) return;

    // Validaciones
    if (this.accionModal === 'APROBAR' && !this.numeroSeguimiento.trim()) {
      this.numeroSeguimiento = `REF-${this.devolucionSeleccionada!.id}-${new Date().toISOString().slice(0,10)}`;
    }

    if (this.accionModal === 'RECHAZAR' && !this.respuestaAdmin.trim()) {
      alert('Por favor ingrese el motivo del rechazo');
      return;
    }

    this.procesandoRespuesta = true;

    if (this.accionModal === 'APROBAR') {
      const datosAprobacion = {
        NumeroSeguimiento: this.numeroSeguimiento,
        RespondidoPor: this._sso.usuario.id,
        RespuestaAdmin: this.respuestaAdmin.trim() || ''
      };

      this._apiserv.AprobarDevolucion(this.devolucionSeleccionada.id, datosAprobacion).subscribe({
        next: (response: any) => {
          if (response.exito) {
            alert('Devolución aprobada exitosamente. El cliente ha sido notificado por email.');
            this.cerrarModalRespuesta();
            this.cerrarModalDetalle();
            this.cargarDatos(); // Recargar datos
          } else {
            alert('Error al aprobar la devolución');
          }
          this.procesandoRespuesta = false;
        },
        error: (err) => {
            console.error('❌ Error al aprobar devolución:', err);
            alert('Error: ' + (err.error?.mensaje || err.message || 'Error desconocido'));
            this.procesandoRespuesta = false;
        }
      });
    } else {
      // RECHAZAR
      const datosRechazo = {
        RespondidoPor: this._sso.usuario.id,
        RespuestaAdmin: this.respuestaAdmin.trim()
      };

      this._apiserv.RechazarDevolucion(this.devolucionSeleccionada.id, datosRechazo).subscribe({
        next: (response: any) => {
          if (response.exito) {
            alert('Devolución rechazada exitosamente. El cliente ha sido notificado por email.');
            this.cerrarModalRespuesta();
            this.cerrarModalDetalle();
            this.cargarDatos(); // Recargar datos
          } else {
            alert('Error al rechazar la devolución');
          }
          this.procesandoRespuesta = false;
        },
        error: (err) => {
          console.error('❌ Error al rechazar devolución:', err);
          alert('Error al rechazar la devolución');
          this.procesandoRespuesta = false;
        }
      });
    }
  }

  /**
   * Abre el modal de visualización de fotos
   */
  verFotos(devolucion: Devolucion): void {
    this.fotosActuales = [];

    if (devolucion.url_foto_1) this.fotosActuales.push(devolucion.url_foto_1);
    if (devolucion.url_foto_2) this.fotosActuales.push(devolucion.url_foto_2);
    if (devolucion.url_foto_3) this.fotosActuales.push(devolucion.url_foto_3);

    if (this.fotosActuales.length > 0) {
      this.fotoActualIndex = 0;
      this.mostrarModalFotos = true;
    } else {
      alert('No hay fotos adjuntas en esta devolución');
    }
  }

  /**
   * Cierra el modal de fotos
   */
  cerrarModalFotos(): void {
    this.mostrarModalFotos = false;
    this.fotosActuales = [];
    this.fotoActualIndex = 0;
  }

  /**
   * Navega a la siguiente foto
   */
  siguienteFoto(): void {
    if (this.fotoActualIndex < this.fotosActuales.length - 1) {
      this.fotoActualIndex++;
    }
  }

  /**
   * Navega a la foto anterior
   */
  anteriorFoto(): void {
    if (this.fotoActualIndex > 0) {
      this.fotoActualIndex--;
    }
  }

  /**
   * Obtiene el producto por ID
   */
  obtenerProducto(productoId: number): producto | null {
    return this.ListaProductos.find(p => p.id === productoId) || null;
  }

  /**
   * Calcula el total de una devolución
   */
  calcularTotalDevolucion(): number {
    return this.itemsDevolucion.reduce((total, item) =>
      total + (item.cantidad * item.precio_unitario), 0
    );
  }

  /**
   * Formatea una fecha
   */
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'N/A';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  getClaseEstado(codigo: string | undefined): string {
    if (!codigo) return 'badge-secondary';

    const clases: { [key: string]: string } = {
      'PENDIENTE': 'badge-warning',
      'APROBADO': 'badge-success',
      'RECHAZADA': 'badge-danger',
      'EN_PROCESO': 'badge-info',
      'COMPLETADO': 'badge-primary',
      'CANCELADO': 'badge-dark'
    };

    return clases[codigo] || 'badge-secondary';
  }

  /**
   * Obtiene el icono según el estado
   */
  getIconoEstado(codigo: string | undefined): string {
    if (!codigo) return 'help_outline';

    const iconos: { [key: string]: string } = {
      'PENDIENTE': 'schedule',
      'APROBADO': 'check_circle',
      'RECHAZADA': 'cancel',
      'EN_PROCESO': 'autorenew',
      'COMPLETADO': 'verified',
      'CANCELADO': 'block'
    };

    return iconos[codigo] || 'help_outline';
  }

  /**
   * Verifica si una devolución puede ser procesada
   */
  puedeProcesar(devolucion: Devolucion): boolean {
    return devolucion.estado_codigo === 'PENDIENTE';
  }

  /**
   * Obtiene el nombre del tipo de devolución
   */
  getTipoDevolucionNombre(tipo: string): string {
    return tipo === 'REEMBOLSO' ? 'Reembolso' : 'Cambio';
  }

  /**
   * Obtiene el icono del tipo de devolución
   */
  getTipoDevolucionIcono(tipo: string): string {
    return tipo === 'REEMBOLSO' ? 'payment' : 'swap_horiz';
  }

  /**
   * ✅ HELPER: Verifica si devolucionSeleccionada no es null para evitar errores de TypeScript
   */
  get devolucionActual(): Devolucion | undefined {
    return this.devolucionSeleccionada ?? undefined;
  }
}
