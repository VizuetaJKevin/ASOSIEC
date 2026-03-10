import { Component, OnInit, inject, ViewChild } from "@angular/core";
import { ApiService } from "src/app/services/Api.service";
import { LoginService } from "src/app/services/login.service";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Item } from "src/app/interfaces/items.interface";
import { producto } from "src/app/interfaces/producto.interface";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
    selector: 'app-admin-comprobantes',
    templateUrl: './admin-comprobantes.component.html',
    styleUrls: ['./admin-comprobantes.component.css'],
    standalone: false
})
export class AdminComprobantesComponent implements OnInit {

  private _apiService = inject(ApiService);
  private _loginService = inject(LoginService);
  private dialog = inject(MatDialog);
  private spinner = inject(NgxSpinnerService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ===== DATOS =====
  ordenesConComprobantes: any[] = [];
  ordenesFiltradasPendientes: any[] = [];
  ordenesFiltradasVerificadas: any[] = [];
  ordenesFiltradasRechazadas: any[] = [];

  // ===== NUEVAS PROPIEDADES PARA PRODUCTOS Y USUARIOS =====
  public ListaProductos: producto[] = [];
  public ListaItem: Item[] = [];
  public listaUsuarios: any[] = [];

  // ===== DROPDOWN PRODUCTOS =====
  productosExpandidos: boolean = false;

  // ===== FILTRADAS Y PAGINADAS (VERIFICADOS) =====
  ordenesVerificadasFiltradas: any[] = [];
  ordenesVerificadasPaginadas: any[] = [];

  // ===== FILTRADAS Y PAGINADAS (RECHAZADOS) =====
  ordenesRechazadasFiltradas: any[] = [];
  ordenesRechazadasPaginadas: any[] = [];

  cargando: boolean = false;

  // ===== FILTROS VERIFICADOS =====
  filtroOrdenVerificada: string = '';
  filtroFechaVerificada: Date | null = null;
  filtroFechaVerificadaStr: string = '';
  filtroIdVerificado: string = ''; // ✅ NUEVO: Filtro por ID

  // ===== FILTROS RECHAZADOS =====
  filtroOrdenRechazada: string = '';
  filtroFechaRechazada: Date | null = null;
  filtroFechaRechazadaStr: string = '';
  filtroIdRechazado: string = ''; // ✅ NUEVO: Filtro por ID

  // ===== PAGINACIÓN =====
  pageSize: number = 10;
  pageIndex: number = 0;

  // Paginación separada para rechazados
  pageSizeRechazados: number = 10;
  pageIndexRechazados: number = 0;

  // ========================================
  // VARIABLES DE MODALES
  // ========================================
  mostrarModalDetalles: boolean = false;
  mostrarModalVerificar: boolean = false;
  mostrarModalRechazar: boolean = false;
  mostrarModalMotivoRechazo: boolean = false;
  mostrarModalMensaje: boolean = false;

  elementoSeleccionado: any = null;
  motivoRechazo: string = '';
  motivoRechazoError: string = '';
  motivoRechazaTexto: string = '';

  // Modal mensaje genérico
  tipoMensaje: string = 'exito'; // 'exito' | 'error' | 'info'
  tituloMensaje: string = '';
  mensajeTexto: string = '';

  // Spinner fullscreen
  mensajeSpinner: string = '';

  // ========================================
  // VARIABLES DE ORDENAMIENTO (SORTABLE)
  // ========================================
  // Verificados
  ordenamientoVerificados: string = 'fecha';
  ordenDescendenteVerificados: boolean = true;

  // Rechazados
  ordenamientoRechazados: string = 'fecha';
  ordenDescendenteRechazados: boolean = true;

  // ========================================
  // PROPIEDADES COMPUTADAS PARA STATS
  // ========================================
  get totalComprobantes(): number {
    return this.ordenesConComprobantes.length;
  }

  get totalPendientes(): number {
    return this.ordenesFiltradasPendientes.length;
  }

  get totalVerificados(): number {
    return this.ordenesFiltradasVerificadas.length;
  }

  get totalRechazados(): number {
    return this.ordenesFiltradasRechazadas.length;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ========================================
  // CARGAR DATOS
  // ========================================
  cargarDatos() {
    this.cargando = true;
    console.log('📋 Cargando datos de comprobantes y productos...');

    // ✅ NUEVO: Cargar usuarios para mostrar nombres de administradores
    this.cargarUsuarios();

    // Cargar productos
    this._apiService.ConsultarProducto().subscribe({
      next: (reps: producto[]) => {
        this.ListaProductos = reps;
        console.log('✅ Productos cargados:', this.ListaProductos.length);
      },
      error: (err: any) => {
        console.error('❌ Error al cargar productos:', err);
      }
    });

    // Cargar items
    this._apiService.ConsultarItems().subscribe({
      next: (reps: Item[]) => {
        this.ListaItem = reps;
        console.log('✅ Items cargados:', this.ListaItem.length);
      },
      error: (err: any) => {
        console.error('❌ Error al cargar items:', err);
      }
    });

    // Cargar órdenes con comprobantes
    this.cargarOrdenes();
  }

  cargarOrdenes() {
    console.log('📋 Cargando órdenes con comprobantes...');

    this._apiService.ConsultarOrdenesConComprobantes().subscribe({
      next: (resp) => {
        console.log('✅ Órdenes recibidas:', resp);
        this.ordenesConComprobantes = resp;
        this.filtrarOrdenes();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar órdenes:', err);
        this.cargando = false;
        this.mostrarMensaje('error', 'Error de Conexión', 'No se pudieron cargar las órdenes con comprobantes. Por favor, verifica tu conexión e intenta nuevamente.');
      }
    });
  }

  // ✅ NUEVO: Método para cargar usuarios
  cargarUsuarios() {
    this._loginService.ConsultarUsuarios().subscribe({
      next: (usuarios) => {
        this.listaUsuarios = usuarios;
        console.log('✅ Usuarios cargados:', this.listaUsuarios.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar usuarios:', err);
        // No es crítico, continuar de todos modos
        this.listaUsuarios = [];
      }
    });
  }

  // ========================================
  // NUEVOS MÉTODOS PARA MANEJAR PRODUCTOS
  // ========================================

  /**
   * Obtiene los items (productos) de una orden específica
   */
  obtenerItems(idOrden: number): Item[] {
    const elementoEncontrado = this.ListaItem.filter(p => p.ordenId === idOrden);
    return elementoEncontrado ? elementoEncontrado : [];
  }

  /**
   * Obtiene el producto completo de un item
   */
  obtenerProducto(productoId: number): producto | null {
    const producto = this.ListaProductos.find(p => p.id === productoId);
    return producto ? producto : null;
  }

  /**
   * ✅ NUEVO: Obtiene el nombre completo del administrador que verificó el comprobante
   */
  obtenerNombreAdmin(adminId: number | null | undefined): string {
    if (!adminId) return 'N/A';

    const admin = this.listaUsuarios.find(u => u.id === adminId);
    if (!admin) return 'Desconocido';

    return `${admin.nombre} ${admin.apellido}`;
  }

  /**
   * Calcula el subtotal de un item (cantidad * precio)
   */
  calcularSubtotal(item: Item): number {
    const producto = this.obtenerProducto(item.productoId);
    if (!producto) {
      return 0;
    }
    return item.cantidad * producto.precio_ahora;
  }

  /**
   * Obtiene la ruta correcta de la imagen del producto
   * ✅ MIGRADO A CLOUDINARY - Soporta URLs de Cloudinary y rutas locales antiguas
   */
  obtenerRutaImagen(producto: producto | null): string {
    if (!producto || !producto.url_Img) {
      return 'assets/Images/productos/placeholder.jpg';
    }

    const nombreImagen = producto.url_Img || 'placeholder.jpg';

    // ✅ Si la URL ya es de Cloudinary (comienza con http/https), devolverla directamente
    if (nombreImagen.startsWith('http')) {
      console.log('✅ Usando imagen de Cloudinary:', nombreImagen);
      return nombreImagen;
    }

    // ✅ Si es una ruta local antigua (fallback)
    console.log('🖼️ Usando ruta local:', nombreImagen);
    return `assets/Images/productos/${nombreImagen}`;
  }

  /**
   * Maneja errores de carga de imagen
   */
  manejarErrorImagen(event: any): void {
    console.warn('⚠️ Error al cargar imagen:', event.target.src);
    event.target.src = 'assets/Images/productos/placeholder.jpg';
  }

  // ========================================
  // FILTRAR ÓRDENES POR ESTADO
  // ========================================
  filtrarOrdenes() {
    console.log('🔍 Filtrando órdenes por estado...');

    const pendientesMayuscula = this.ordenesConComprobantes
      .filter(o => o.Comprobante && o.Comprobante.verificado === false && (o.Orden?.estadoOrdenId !== 9));

    const pendientesMinuscula = this.ordenesConComprobantes
      .filter(o => o.comprobante && o.comprobante.verificado === false && (o.orden?.estadoOrdenId !== 9));

    const verificadasMayuscula = this.ordenesConComprobantes
      .filter(o => o.Comprobante && o.Comprobante.verificado === true);

    const verificadasMinuscula = this.ordenesConComprobantes
      .filter(o => o.comprobante && o.comprobante.verificado === true);

    const rechazadasMayuscula = this.ordenesConComprobantes
      .filter(o => o.Orden && o.Orden.estadoOrdenId === 9);

    const rechazadasMinuscula = this.ordenesConComprobantes
      .filter(o => o.orden && o.orden.estadoOrdenId === 9);

    if (pendientesMayuscula.length > 0 || verificadasMayuscula.length > 0 || rechazadasMayuscula.length > 0) {
      this.ordenesFiltradasPendientes = pendientesMayuscula;
      this.ordenesFiltradasVerificadas = verificadasMayuscula;
      this.ordenesFiltradasRechazadas = rechazadasMayuscula;
    } else {
      this.ordenesFiltradasPendientes = pendientesMinuscula;
      this.ordenesFiltradasVerificadas = verificadasMinuscula;
      this.ordenesFiltradasRechazadas = rechazadasMinuscula;
    }

    console.log(`   ✅ Pendientes: ${this.ordenesFiltradasPendientes.length}`);
    console.log(`   ✅ Verificadas: ${this.ordenesFiltradasVerificadas.length}`);
    console.log(`   ✅ Rechazadas: ${this.ordenesFiltradasRechazadas.length}`);

    this.aplicarFiltrosVerificados();
    this.aplicarFiltrosRechazados();
  }

  // ========================================
  // MÉTODOS DE MODALES
  // ========================================

  // --- Modal Detalles ---
  abrirModalDetalles(item: any) {
    this.elementoSeleccionado = item;
    this.productosExpandidos = false;
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles() {
    this.mostrarModalDetalles = false;
    this.elementoSeleccionado = null;
    this.productosExpandidos = false;
  }

  // --- Modal Verificar ---
  abrirModalVerificar(item: any) {
    this.elementoSeleccionado = item;
    this.mostrarModalVerificar = true;
  }

  cerrarModalVerificar() {
    this.mostrarModalVerificar = false;
  }

  confirmarVerificar() {
    if (!this.elementoSeleccionado) return;

    const comprobante = this.elementoSeleccionado.Comprobante || this.elementoSeleccionado.comprobante;

    this.cerrarModalVerificar();
    this.spinner.show();
    this.mensajeSpinner = 'Verificando comprobante...';

    this._apiService.VerificarComprobante(comprobante.id, this._loginService.usuario.id)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          console.log('✅ Comprobante verificado:', response);
          this.mostrarMensaje('exito', '¡Verificado!', 'El comprobante ha sido aprobado correctamente. El cliente recibirá una notificación por email.');
          this.cargarOrdenes();
        },
        error: (err: any) => {
          this.spinner.hide();
          console.error('❌ Error al verificar:', err);
          this.mostrarMensaje('error', 'Error', 'No se pudo verificar el comprobante. Por favor, intenta nuevamente.');
        }
      });
  }

  // --- Modal Rechazar ---
  abrirModalRechazar(item: any) {
    this.elementoSeleccionado = item;
    this.motivoRechazo = '';
    this.motivoRechazoError = '';
    this.mostrarModalRechazar = true;
  }

  cerrarModalRechazar() {
    this.mostrarModalRechazar = false;
    this.motivoRechazo = '';
    this.motivoRechazoError = '';
  }

  confirmarRechazar() {
    // Validación
    if (!this.motivoRechazo || this.motivoRechazo.trim() === '') {
      this.motivoRechazoError = '¡Debes especificar un motivo para rechazar el comprobante!';
      return;
    }
    if (this.motivoRechazo.trim().length < 10) {
      this.motivoRechazoError = 'El motivo debe tener al menos 10 caracteres.';
      return;
    }

    const comprobante = this.elementoSeleccionado.Comprobante || this.elementoSeleccionado.comprobante;

    // ✅ FIX CRÍTICO: Guardar el motivo en una variable temporal ANTES de cerrar el modal
    // porque cerrarModalRechazar() limpia this.motivoRechazo = ''
    const motivoTemporal = this.motivoRechazo.trim();

    this.cerrarModalRechazar();
    this.spinner.show();
    this.mensajeSpinner = 'Rechazando comprobante...';

    // ✅ Usar la variable temporal en lugar de this.motivoRechazo
    this._apiService.RechazarComprobante(comprobante.id, this._loginService.usuario.id, motivoTemporal)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          console.log('✅ Comprobante rechazado:', response);
          this.mostrarMensaje('exito', 'Comprobante Rechazado', 'El comprobante ha sido rechazado. El cliente recibirá una notificación por email.');
          this.cargarOrdenes();
        },
        error: (err: any) => {
          this.spinner.hide();
          console.error('❌ Error al rechazar:', err);
          this.mostrarMensaje('error', 'Error', 'No se pudo rechazar el comprobante. Por favor, intenta nuevamente.');
        }
      });
  }

  // --- Modal Mensaje Genérico ---
  mostrarMensaje(tipo: string, titulo: string, mensaje: string) {
    this.tipoMensaje = tipo;
    this.tituloMensaje = titulo;
    this.mensajeTexto = mensaje;
    this.mostrarModalMensaje = true;
  }

  cerrarModalMensaje() {
    this.mostrarModalMensaje = false;
  }

  // --- Modal Motivo Rechazo ---
  abrirModalMotivoRechazo(motivoTexto: string) {
    this.motivoRechazaTexto = motivoTexto;
    this.mostrarModalMotivoRechazo = true;
  }

  cerrarModalMotivoRechazo() {
    this.mostrarModalMotivoRechazo = false;
    this.motivoRechazaTexto = '';
  }

  // ========================================
  // UTILIDADES
  // ========================================
  verComprobante(url: string) {
    window.open(url, '_blank');
  }

  obtenerClaseBadgeEstado(item: any): string {
    const orden = item.Orden || item.orden;
    if (orden?.estadoOrdenId === 9) return 'estado-rechazado';
    const comprobante = item.Comprobante || item.comprobante;
    if (comprobante?.verificado) return 'estado-verificado';
    return 'estado-pendiente';
  }

  obtenerEstadoTexto(item: any): string {
    const orden = item.Orden || item.orden;
    if (orden?.estadoOrdenId === 9) return 'Rechazado';
    const comprobante = item.Comprobante || item.comprobante;
    if (comprobante?.verificado) return 'Verificado';
    return 'Pendiente';
  }

  /**
   * ✅ NUEVO: Determina si un comprobante está pendiente
   */
  esPendiente(item: any): boolean {
    const orden = item.Orden || item.orden;
    const comprobante = item.Comprobante || item.comprobante;

    // No está rechazado ni verificado = pendiente
    return orden?.estadoOrdenId !== 9 && !comprobante?.verificado;
  }

  // ========================================
  // SORTABLE - VERIFICADOS
  // ========================================
  cambiarOrdenamientoVerificados(campo: string) {
    if (this.ordenamientoVerificados === campo) {
      this.ordenDescendenteVerificados = !this.ordenDescendenteVerificados;
    } else {
      this.ordenamientoVerificados = campo;
      this.ordenDescendenteVerificados = true;
    }
    this.ordenarVerificados();
    this.actualizarPaginacionVerificados();
  }

  obtenerIconoOrdenVerificados(campo: string): string {
    if (this.ordenamientoVerificados !== campo) return '↕';
    return this.ordenDescendenteVerificados ? '↓' : '↑';
  }

  ordenarVerificados() {
    this.ordenesVerificadasFiltradas.sort((a, b) => {
      let valA: any, valB: any;
      const ordenA = a.Orden || a.orden;
      const ordenB = b.Orden || b.orden;
      const compA = a.Comprobante || a.comprobante;
      const compB = b.Comprobante || b.comprobante;

      switch (this.ordenamientoVerificados) {
        case 'orden':
          valA = (ordenA?.token_orden || '').toLowerCase();
          valB = (ordenB?.token_orden || '').toLowerCase();
          break;
        case 'total':
          valA = ordenA?.total || 0;
          valB = ordenB?.total || 0;
          break;
        case 'fecha':
          valA = new Date(ordenA?.fecha || 0).getTime();
          valB = new Date(ordenB?.fecha || 0).getTime();
          break;
        case 'fechaVerificacion':
          valA = new Date(compA?.fecha_verificacion || 0).getTime();
          valB = new Date(compB?.fecha_verificacion || 0).getTime();
          break;
        default:
          return 0;
      }

      if (valA < valB) return this.ordenDescendenteVerificados ? 1 : -1;
      if (valA > valB) return this.ordenDescendenteVerificados ? -1 : 1;
      return 0;
    });
  }

  // ========================================
  // SORTABLE - RECHAZADOS
  // ========================================
  cambiarOrdenamientoRechazados(campo: string) {
    if (this.ordenamientoRechazados === campo) {
      this.ordenDescendenteRechazados = !this.ordenDescendenteRechazados;
    } else {
      this.ordenamientoRechazados = campo;
      this.ordenDescendenteRechazados = true;
    }
    this.ordenarRechazados();
    this.actualizarPaginacionRechazados();
  }

  obtenerIconoOrdenRechazados(campo: string): string {
    if (this.ordenamientoRechazados !== campo) return '↕';
    return this.ordenDescendenteRechazados ? '↓' : '↑';
  }

  ordenarRechazados() {
    this.ordenesRechazadasFiltradas.sort((a, b) => {
      let valA: any, valB: any;
      const ordenA = a.Orden || a.orden;
      const ordenB = b.Orden || b.orden;
      const compA = a.Comprobante || a.comprobante;
      const compB = b.Comprobante || b.comprobante;

      switch (this.ordenamientoRechazados) {
        case 'orden':
          valA = (ordenA?.token_orden || '').toLowerCase();
          valB = (ordenB?.token_orden || '').toLowerCase();
          break;
        case 'total':
          valA = ordenA?.total || 0;
          valB = ordenB?.total || 0;
          break;
        case 'fecha':
          valA = new Date(ordenA?.fecha || 0).getTime();
          valB = new Date(ordenB?.fecha || 0).getTime();
          break;
        case 'fechaRechazo':
          valA = new Date(compA?.fecha_verificacion || 0).getTime();
          valB = new Date(compB?.fecha_verificacion || 0).getTime();
          break;
        default:
          return 0;
      }

      if (valA < valB) return this.ordenDescendenteRechazados ? 1 : -1;
      if (valA > valB) return this.ordenDescendenteRechazados ? -1 : 1;
      return 0;
    });
  }

  // ============================================
  // FILTROS Y PAGINACIÓN - VERIFICADOS
  // ============================================

  onFechaVerificadaChange(value: string) {
    if (value) {
      this.filtroFechaVerificada = new Date(value + 'T00:00:00');
    } else {
      this.filtroFechaVerificada = null;
    }
    this.aplicarFiltrosVerificados();
  }

  aplicarFiltrosVerificados() {
    let resultado = [...this.ordenesFiltradasVerificadas];

    // ✅ Filtro por código de orden
    if (this.filtroOrdenVerificada && this.filtroOrdenVerificada.trim() !== '') {
      const filtroLower = this.filtroOrdenVerificada.toLowerCase().trim();
      resultado = resultado.filter(orden => {
        const tokenOrden = ((orden.Orden || orden.orden)?.token_orden || '').toLowerCase();
        return tokenOrden.includes(filtroLower);
      });
    }

    // ✅ NUEVO: Filtro por ID de comprobante
    if (this.filtroIdVerificado && this.filtroIdVerificado.trim() !== '') {
      const filtroId = this.filtroIdVerificado.trim();
      resultado = resultado.filter(orden => {
        const comprobanteId = (orden.Comprobante || orden.comprobante)?.id?.toString() || '';
        return comprobanteId.includes(filtroId);
      });
    }

    // ✅ Filtro por fecha
    if (this.filtroFechaVerificada) {
      resultado = resultado.filter(orden => {
        const fechaOrden = new Date((orden.Orden || orden.orden)?.fecha);
        const fechaFiltro = new Date(this.filtroFechaVerificada!);

        return fechaOrden.getFullYear() === fechaFiltro.getFullYear() &&
               fechaOrden.getMonth() === fechaFiltro.getMonth() &&
               fechaOrden.getDate() === fechaFiltro.getDate();
      });
    }

    this.ordenesVerificadasFiltradas = resultado;
    this.ordenarVerificados();
    this.pageIndex = 0;
    this.actualizarPaginacionVerificados();
  }

  limpiarFiltrosVerificados() {
    this.filtroOrdenVerificada = '';
    this.filtroIdVerificado = ''; // ✅ NUEVO
    this.filtroFechaVerificada = null;
    this.filtroFechaVerificadaStr = '';
    this.aplicarFiltrosVerificados();
  }

  actualizarPaginacionVerificados() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.ordenesVerificadasPaginadas = this.ordenesVerificadasFiltradas.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.actualizarPaginacionVerificados();
  }

  // ============================================
  // FILTROS Y PAGINACIÓN - RECHAZADOS
  // ============================================

  onFechaRechazadaChange(value: string) {
    if (value) {
      this.filtroFechaRechazada = new Date(value + 'T00:00:00');
    } else {
      this.filtroFechaRechazada = null;
    }
    this.aplicarFiltrosRechazados();
  }

  aplicarFiltrosRechazados() {
    let resultado = [...this.ordenesFiltradasRechazadas];

    // ✅ Filtro por código de orden
    if (this.filtroOrdenRechazada && this.filtroOrdenRechazada.trim() !== '') {
      const filtroLower = this.filtroOrdenRechazada.toLowerCase().trim();
      resultado = resultado.filter(orden => {
        const tokenOrden = ((orden.Orden || orden.orden)?.token_orden || '').toLowerCase();
        return tokenOrden.includes(filtroLower);
      });
    }

    // ✅ NUEVO: Filtro por ID de comprobante
    if (this.filtroIdRechazado && this.filtroIdRechazado.trim() !== '') {
      const filtroId = this.filtroIdRechazado.trim();
      resultado = resultado.filter(orden => {
        const comprobanteId = (orden.Comprobante || orden.comprobante)?.id?.toString() || '';
        return comprobanteId.includes(filtroId);
      });
    }

    // ✅ Filtro por fecha
    if (this.filtroFechaRechazada) {
      resultado = resultado.filter(orden => {
        const fechaOrden = new Date((orden.Orden || orden.orden)?.fecha);
        const fechaFiltro = new Date(this.filtroFechaRechazada!);

        return fechaOrden.getFullYear() === fechaFiltro.getFullYear() &&
               fechaOrden.getMonth() === fechaFiltro.getMonth() &&
               fechaOrden.getDate() === fechaFiltro.getDate();
      });
    }

    this.ordenesRechazadasFiltradas = resultado;
    this.ordenarRechazados();
    this.pageIndexRechazados = 0;
    this.actualizarPaginacionRechazados();
  }

  limpiarFiltrosRechazados() {
    this.filtroOrdenRechazada = '';
    this.filtroIdRechazado = ''; // ✅ NUEVO
    this.filtroFechaRechazada = null;
    this.filtroFechaRechazadaStr = '';
    this.aplicarFiltrosRechazados();
  }

  actualizarPaginacionRechazados() {
    const startIndex = this.pageIndexRechazados * this.pageSizeRechazados;
    const endIndex = startIndex + this.pageSizeRechazados;
    this.ordenesRechazadasPaginadas = this.ordenesRechazadasFiltradas.slice(startIndex, endIndex);
  }

  onPageChangeRechazados(event: PageEvent) {
    this.pageIndexRechazados = event.pageIndex;
    this.pageSizeRechazados = event.pageSize;
    this.actualizarPaginacionRechazados();
  }
}
