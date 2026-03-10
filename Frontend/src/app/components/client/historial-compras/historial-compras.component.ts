import { Component, OnInit, inject } from '@angular/core';
import { EstadoOrden } from 'src/app/interfaces/estado-oden.interface';
import { Item } from 'src/app/interfaces/items.interface';
import { vendedorProducto } from 'src/app/interfaces/vendedorProducto.interface';
import { producto } from 'src/app/interfaces/producto.interface';
import { ApiService } from 'src/app/services/Api.service';
import { LoginService } from 'src/app/services/login.service';
import { EstadosService } from 'src/app/services/estados.service';
import { Orden } from 'src/app/interfaces/Orden.interface';
import { ChangeDetectorRef } from '@angular/core';
import { Devolucion, ItemDevolucion, VerificacionDevolucion } from 'src/app/interfaces/devolucion.interface';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-historial-compras',
    templateUrl: './historial-compras.component.html',
    styleUrls: ['./historial-compras.component.css'],
    standalone: false
})
export class HistorialComprasComponent implements OnInit {

  displayedColumns: string[] = ['N_Orden', 'Total', 'Fecha', 'Estado', 'Productos'];
  private service = inject(ApiService);
  public ListaProductos: producto[] = [];
  public ListaItem: Item[] = [];
  public ListaEstadosOrden: EstadoOrden[] = [];
  public ListaVendedores: vendedorProducto[] = [];
  public ListaOrden: Orden[] = [];
  public ListaComprobantes: any[] = [];
  private _apiserv = inject(ApiService);
  private _sso = inject(LoginService);
  private cdr = ChangeDetectorRef  // ✅ AGREGAR ESTA LÍNEA


  private _estadosService = inject(EstadosService);
  private spinner = inject(NgxSpinnerService);

  // ============================================
  // VARIABLES PARA MODALES DE NOTIFICACIÓN
  // ============================================
  public mostrarModalInfo: boolean = false;
  public modalInfoTitulo: string = '';
  public modalInfoMensaje: string = '';
  public modalInfoIcono: string = 'info';
  public modalInfoTipo: 'info' | 'warning' | 'error' | 'success' = 'info';

  public mostrarModalExitoEnvio: boolean = false;

  // Variables para controlar el estado de carga
  public cargando: boolean = true;
  public errorCarga: boolean = false;
  public mensajeError: string = '';

  // Variable para ordenar las compras
  public ordenarPor: 'fecha' | 'total' | 'estado' = 'fecha';
  public ordenDescendente: boolean = true;

  // Variables para el modal de detalles
  public mostrarModalDetalles: boolean = false;
  public ordenSeleccionada: Orden | null = null;

  // Variables para filtros
  public filtroOrdenVerificado: string = '';
  public filtroFechaVerificado: string = '';
  public filtroOrdenRechazado: string = '';
  public filtroFechaRechazado: string = '';

  // ============================================
  // NUEVAS VARIABLES PARA DEVOLUCIONES
  // ============================================
  public mostrarModalDevoluciones: boolean = false;
  public pasoActualDevolucion: number = 1;
  public ordenDevolucion: Orden | null = null;
  public itemsOrdenDevolucion: Item[] = [];
 public itemsSeleccionados: Map<number, ItemDevolucion> = new Map();
  // ✅ GETTER: convierte el Map a array para evitar NG0100
  get itemsSeleccionadosArray(): ItemDevolucion[] {
    return Array.from(this.itemsSeleccionados.values());
  }
  public motivoDevolucion: string = '';
  public tipoDevolucion: 'REEMBOLSO' | 'CAMBIO' = 'REEMBOLSO';
  public descripcionDetallada: string = '';
  public fotosDevolucion: File[] = [];
  public previewFotos: string[] = [];
  public verificacionDevolucion: VerificacionDevolucion | null = null;
  public procesandoDevolucion: boolean = false;
  public mensajeExitoDevolucion: string = '';
  public mensajeErrorDevolucion: string = '';

  // Motivos predefinidos
  public motivosReembolso: string[] = [
    'Producto defectuoso o dañado',
    'No es lo que esperaba',
    'Recibí el producto equivocado',
    'El producto no llegó a tiempo',
    'Cambié de opinión',
    'Otro motivo'
  ];

  public motivosCambio: string[] = [
    'Quiero otra talla o color',
    'Producto defectuoso',
    'Recibí el producto equivocado',
    'Otro motivo'
  ];

  // ============================================
  // HELPER PARA MODALES DE NOTIFICACIÓN
  // ============================================
  mostrarModal(titulo: string, mensaje: string, tipo: 'info' | 'warning' | 'error' | 'success' = 'info'): void {
    const iconos = { info: 'info', warning: 'warning', error: 'error', success: 'check_circle' };
    this.modalInfoTitulo = titulo;
    this.modalInfoMensaje = mensaje;
    this.modalInfoTipo = tipo;
    this.modalInfoIcono = iconos[tipo];
    this.mostrarModalInfo = true;
  }

  cerrarModalInfo(): void {
    this.mostrarModalInfo = false;
  }

  cerrarModalExitoEnvio(): void {
    this.mostrarModalExitoEnvio = false;
  }

  ngOnInit(): void {
    if (this._sso.usuario.id != 0) {
      this.carga();
    } else {
      this.cargando = false;
      this.errorCarga = true;
      this.mensajeError = 'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.';
    }
  }

  private carga() {
    this.cargando = true;
    this.errorCarga = false;

    // Cargar estados de órdenes
    this._estadosService.ConsultarEstadosOrden().subscribe({
      next: (reps) => {
        this.ListaEstadosOrden = reps.filter(e => e.activo === true);
        console.log('✅ Estados de órdenes cargados:', this.ListaEstadosOrden);
      },
      error: (err) => {
        console.error('❌ Error al cargar estados de órdenes:', err);
        this.errorCarga = true;
        this.mensajeError = 'Error al cargar los estados de las órdenes.';
      }
    });

    // Cargar productos
    this._apiserv.ConsultarProducto().subscribe({
      next: (reps) => {
        this.ListaProductos = reps;
        console.log('✅ Productos cargados:', this.ListaProductos.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
      }
    });

    // Cargar vendedores
    this._apiserv.ConsultarVendedorProducto().subscribe({
      next: (reps) => {
        this.ListaVendedores = reps;
        console.log('✅ Vendedores cargados:', this.ListaVendedores.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar vendedores:', err);
      }
    });

    // Cargar items del usuario
    this._apiserv.ConsultarmisproductosUsuarioId(this._sso.usuario.id).subscribe({
      next: (reps) => {
        this.ListaItem = reps;
        console.log('✅ Items del usuario cargados:', this.ListaItem.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar items del usuario:', err);
        this.errorCarga = true;
        this.mensajeError = 'Error al cargar los productos comprados.';
      }
    });

    // Cargar comprobantes de pago
    this._apiserv.ConsultarComprobantes().subscribe({
      next: (reps) => {
        this.ListaComprobantes = reps;
        console.log('✅ Comprobantes cargados:', this.ListaComprobantes.length);
        if (reps.length > 0) {
          console.log('📌 Estructura del primer comprobante:', JSON.stringify(reps[0], null, 2));
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar comprobantes:', err);
      }
    });

    // Cargar órdenes del usuario
    this._apiserv.ConsultarOrdenUsuarioId(this._sso.usuario.id).subscribe({
      next: (reps) => {
        this.ListaOrden = reps;
        console.log('✅ Órdenes del usuario cargadas:', this.ListaOrden.length);
        this.cargando = false;
        this.ordenarCompras();
      },
      error: (err) => {
        console.error('❌ Error al cargar órdenes del usuario:', err);
        this.cargando = false;
        this.errorCarga = true;
        this.mensajeError = 'Error al cargar el historial de compras. Intente nuevamente más tarde.';
      }
    });
  }

  // ============================================
  // MÉTODOS EXISTENTES (sin cambios)
  // ============================================

  obtener(lista: any[], id: number): any {
    const elementoEncontrado = lista.find(p => p.id === id);
    return elementoEncontrado ? elementoEncontrado : null;
  }

  obtenerItems(idOrden: number): Item[] {
    const elementoEncontrado = this.ListaItem.filter(p => p.ordenId === idOrden);
    return elementoEncontrado ? elementoEncontrado : [];
  }

  obtenerProducto(productoId: number): producto | null {
    return this.obtener(this.ListaProductos, productoId);
  }

  obtenerTotalProductos(idOrden: number): number {
    const items = this.obtenerItems(idOrden);
    return items.reduce((total, item) => total + item.cantidad, 0);
  }

  obtenerEstadoOrden(estadoOrdenId: number): string {
    const estado = this.obtener(this.ListaEstadosOrden, estadoOrdenId);

    if (estado && (estado.descripcion.toLowerCase().includes('rechazad') ||
                   estado.descripcion.toLowerCase().includes('cancelad'))) {
      return 'PAGO RECHAZADO';
    }

    return estado ? estado.descripcion : 'Estado desconocido';
  }

  obtenerClaseEstado(estadoOrdenId: number): string {
    const estado = this.obtener(this.ListaEstadosOrden, estadoOrdenId);
    if (!estado) return 'badge-secondary';

    const descripcion = estado.descripcion.toLowerCase();
    if (descripcion.includes('pendiente')) return 'badge-warning';
    if (descripcion.includes('verificad')) return 'badge-success';
    if (descripcion.includes('rechazad') || descripcion.includes('cancelad')) return 'badge-danger';
    if (descripcion.includes('enviado') || descripcion.includes('en proceso')) return 'badge-info';
    if (descripcion.includes('entregad')) return 'badge-primary';

    return 'badge-secondary';
  }

  obtenerClaseBadgeEstado(estadoOrdenId: number): string {
    const estado = this.obtener(this.ListaEstadosOrden, estadoOrdenId);
    if (!estado) return 'bg-secondary';

    const descripcion = estado.descripcion.toLowerCase();
    if (descripcion.includes('verificad')) return 'bg-success';
    if (descripcion.includes('rechazad') || descripcion.includes('cancelad')) return 'bg-danger';
    if (descripcion.includes('pendiente')) return 'bg-warning';
    if (descripcion.includes('enviado')) return 'bg-info';
    if (descripcion.includes('entregad')) return 'bg-primary';

    return 'bg-secondary';
  }

  formatearFecha(fecha: string | undefined): string {
  if (!fecha || fecha === '') return 'Fecha no disponible';

    try {
      const date = new Date(fecha);
      const opciones: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('es-EC', opciones);
    } catch (error) {
      return fecha;
    }
  }

  ordenarCompras(): void {
    this.ListaOrden.sort((a, b) => {
      let comparacion = 0;

      switch (this.ordenarPor) {
        case 'fecha':
          comparacion = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
          break;
        case 'total':
          comparacion = a.total - b.total;
          break;
        case 'estado':
          const estadoA = this.obtenerEstadoOrden(a.estadoOrdenId);
          const estadoB = this.obtenerEstadoOrden(b.estadoOrdenId);
          comparacion = estadoA.localeCompare(estadoB);
          break;
      }

      return this.ordenDescendente ? -comparacion : comparacion;
    });
  }

  cambiarOrdenamiento(criterio: 'fecha' | 'total' | 'estado') {
    if (this.ordenarPor === criterio) {
      this.ordenDescendente = !this.ordenDescendente;
    } else {
      this.ordenarPor = criterio;
      this.ordenDescendente = true;
    }
    this.ordenarCompras();
  }

  obtenerIconoOrden(columna: 'fecha' | 'total' | 'estado'): string {
    if (this.ordenarPor !== columna) return '↕';
    return this.ordenDescendente ? '↓' : '↑';
  }

  tieneCompras(): boolean {
    return this.ListaOrden && this.ListaOrden.length > 0;
  }

  calcularTotalGastado(): number {
    if (!this.ListaOrden || this.ListaOrden.length === 0) {
      return 0;
    }
    return this.ListaOrden.reduce((sum, orden) => sum + orden.total, 0);
  }

  calcularSubtotal(item: Item): number {
    const producto = this.obtenerProducto(item.productoId);
    if (!producto) {
      return 0;
    }
    return item.cantidad * producto.precio_ahora;
  }

  obtenerOrdenesVerificadas(): Orden[] {
    return this.ListaOrden.filter(orden => {
      const estado = this.obtener(this.ListaEstadosOrden, orden.estadoOrdenId);
      return estado && estado.descripcion.toLowerCase().includes('verificad');
    });
  }

  obtenerOrdenesRechazadas(): Orden[] {
    return this.ListaOrden.filter(orden => {
      const estado = this.obtener(this.ListaEstadosOrden, orden.estadoOrdenId);
      return estado && (estado.descripcion.toLowerCase().includes('rechazad') ||
                        estado.descripcion.toLowerCase().includes('cancelad'));
    });
  }

  obtenerOrdenesVerificadasFiltradas(): Orden[] {
    let ordenes = this.obtenerOrdenesVerificadas();

    if (this.filtroOrdenVerificado && this.filtroOrdenVerificado.trim()) {
      const filtro = this.filtroOrdenVerificado.toLowerCase().trim();
      ordenes = ordenes.filter(orden =>
        orden.token_orden.toLowerCase().includes(filtro) ||
        orden.id.toString().includes(filtro)
      );
    }

    if (this.filtroFechaVerificado) {
      ordenes = ordenes.filter(orden => {
        const fechaOrden = new Date(orden.fecha).toISOString().split('T')[0];
        return fechaOrden === this.filtroFechaVerificado;
      });
    }

    return ordenes;
  }

  obtenerOrdenesRechazadasFiltradas(): Orden[] {
    let ordenes = this.obtenerOrdenesRechazadas();

    if (this.filtroOrdenRechazado && this.filtroOrdenRechazado.trim()) {
      const filtro = this.filtroOrdenRechazado.toLowerCase().trim();
      ordenes = ordenes.filter(orden =>
        orden.token_orden.toLowerCase().includes(filtro) ||
        orden.id.toString().includes(filtro)
      );
    }

    if (this.filtroFechaRechazado) {
      ordenes = ordenes.filter(orden => {
        const fechaOrden = new Date(orden.fecha).toISOString().split('T')[0];
        return fechaOrden === this.filtroFechaRechazado;
      });
    }

    return ordenes;
  }

  limpiarFiltrosVerificado(): void {
    this.filtroOrdenVerificado = '';
    this.filtroFechaVerificado = '';
  }

  limpiarFiltrosRechazado(): void {
    this.filtroOrdenRechazado = '';
    this.filtroFechaRechazado = '';
  }

  abrirModalDetalles(orden: Orden): void {
    this.ordenSeleccionada = orden;
    this.mostrarModalDetalles = true;
    console.log('📋 Mostrando detalles de orden:', orden);
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.ordenSeleccionada = null;
  }

  obtenerRutaImagen(producto: producto | null): string {
    if (!producto || !producto.url_Img) {
      return 'assets/Images/productos/placeholder.jpg';
    }

    const nombreImagen = producto.url_Img || 'placeholder.jpg';

    if (nombreImagen.startsWith('http')) {
      console.log('✅ Usando imagen de Cloudinary:', nombreImagen);
      return nombreImagen;
    }

    console.log('🖼️ Usando ruta local:', nombreImagen);
    return `assets/Images/productos/${nombreImagen}`;
  }

  manejarErrorImagen(event: any): void {
    console.warn('⚠️ Error al cargar imagen:', event.target.src);
    event.target.src = 'assets/Images/productos/placeholder.jpg';
  }

  esOrdenRechazada(orden: Orden): boolean {
    const estado = this.obtener(this.ListaEstadosOrden, orden.estadoOrdenId);
    if (!estado) return false;

    const descripcion = estado.descripcion.toLowerCase();
    return descripcion.includes('rechazad') || descripcion.includes('cancelad');
  }

  private obtenerComprobantePorOrden(ordenId: number): any | null {
    return this.ListaComprobantes.find(c =>
      c.orden_id === ordenId ||
      c.ordenId === ordenId ||
      c.id_orden === ordenId ||
      c?.Orden?.id === ordenId ||
      c?.orden?.id === ordenId
    ) || null;
  }

  obtenerMotivoRechazo(orden: Orden): string {
    if (!orden) return '';

    const comprobante = this.obtenerComprobantePorOrden(orden.id);

    if (!comprobante) {
      console.warn(`⚠️ No se encontró comprobante para orden ID: ${orden.id}`);
      return 'No se encontró información del comprobante para esta orden.';
    }

    if (comprobante.motivo_rechazo && comprobante.motivo_rechazo.trim() !== '') {
      return comprobante.motivo_rechazo;
    }

    return 'No se especificó un motivo para el rechazo de este comprobante.';
  }

  // ============================================
  // NUEVOS MÉTODOS PARA DEVOLUCIONES
  // ============================================

  /**
   * Abre el modal de devoluciones desde el modal de detalles
   */
abrirModalDevoluciones(orden: Orden): void {
  console.log('🔄 Iniciando proceso de devolución para orden:', orden.id);

  // ✅ NUEVO: Usar el endpoint específico para items de la orden
  this._apiserv.ConsultarItemsPorOrden(orden.id).subscribe({
    next: (itemsDeEstaOrden) => {
      console.log('📦 Items de la orden:', itemsDeEstaOrden.length);

      if (itemsDeEstaOrden.length === 0) {
        this.mostrarModal('Sin productos', 'No se encontraron productos en esta orden.', 'warning');
        console.error('❌ No hay items para ordenId:', orden.id);
        return;
      }

      // Verificar si puede devolver
      this._apiserv.VerificarPuedeDevolver(orden.id).subscribe({
        next: (verificacion: VerificacionDevolucion) => {
          console.log('✅ Verificación:', verificacion);
          this.verificacionDevolucion = verificacion;

          if (verificacion.puede_devolver) {
            // ✅ PRIMERO: Resetear para limpiar todo
            this.resetearFormularioDevolucion();

            // ✅ SEGUNDO: Asignar los valores nuevos
            this.ordenDevolucion = orden;
            this.itemsOrdenDevolucion = itemsDeEstaOrden;
            this.pasoActualDevolucion = 1;

            // ✅ TERCERO: Abrir el modal
            this.mostrarModalDevoluciones = true;
            this.mostrarModalDetalles = false;

            console.log('✅ Modal abierto con', this.itemsOrdenDevolucion.length, 'items');
            console.log('✅ ordenDevolucion:', this.ordenDevolucion);
          } else {
            this.mostrarModal('Devolución no disponible', verificacion.motivo_no_puede || 'No se puede solicitar devolución', 'warning');
          }
        },
        error: (err) => {
          console.error('❌ Error al verificar devolución:', err);
          this.mostrarModal('Error', 'Error al verificar si se puede realizar la devolución', 'error');
        }
      });
    },
    error: (err) => {
      console.error('❌ Error al cargar items de la orden:', err);
      this.mostrarModal('Error', 'Error al cargar los productos de la orden', 'error');
    }
  });
}

  /**
   * Cierra el modal de devoluciones
   */
  cerrarModalDevoluciones(): void {
    this.mostrarModalDevoluciones = false;
    this.resetearFormularioDevolucion();
  }

  /**
   * Resetea todo el formulario de devolución
   */
  resetearFormularioDevolucion(): void {
    this.pasoActualDevolucion = 1;
    this.ordenDevolucion = null;
    this.itemsOrdenDevolucion = [];
    this.itemsSeleccionados.clear();
    this.motivoDevolucion = '';
    this.tipoDevolucion = 'REEMBOLSO';
    this.descripcionDetallada = '';
    this.fotosDevolucion = [];
    this.previewFotos = [];
    this.mensajeExitoDevolucion = '';
    this.mensajeErrorDevolucion = '';
  }

  /**
   * Navega entre pasos del wizard
   */
  irAPaso(paso: number): void {
    if (paso < 1 || paso > 4) return;

    // Validaciones antes de avanzar
    if (paso > this.pasoActualDevolucion) {
      if (this.pasoActualDevolucion === 1 && this.itemsSeleccionados.size === 0) {
        this.mostrarModal('Selección requerida', 'Debes seleccionar al menos un producto para devolver', 'warning');
        return;
      }
      if (this.pasoActualDevolucion === 2 && !this.motivoDevolucion) {
        this.mostrarModal('Motivo requerido', 'Debes seleccionar un motivo para la devolución', 'warning');
        return;
      }
    }

    this.pasoActualDevolucion = paso;
  }

  /**
   * Selecciona o deselecciona un item para devolución
   */
  toggleItemSeleccion(item: Item): void {
    const producto = this.obtenerProducto(item.productoId);
    if (!producto) return;

    if (this.itemsSeleccionados.has(item.id)) {
      this.itemsSeleccionados.delete(item.id);
    } else {
      const itemDevolucion: ItemDevolucion = {
        itemId: item.id,
        productoId: item.productoId,
        cantidad: 1,
        precio_unitario: producto.precio_ahora,
        motivo_item: ''
      };
      this.itemsSeleccionados.set(item.id, itemDevolucion);
    }
      setTimeout(() => {
  }, 0);
    console.log('📦 Items seleccionados:', this.itemsSeleccionados.size);
  }

  /**
   * Verifica si un item está seleccionado
   */
  isItemSeleccionado(itemId: number): boolean {
    return this.itemsSeleccionados.has(itemId);
  }

  /**
   * Obtiene el motivo de un item específico
   */
  getMotivoItem(itemId: number): string {
    return this.itemsSeleccionados.get(itemId)?.motivo_item || '';
  }

  /**
   * Actualiza el motivo de un item
   */
  actualizarMotivoItem(itemId: number, motivo: string): void {
    const item = this.itemsSeleccionados.get(itemId);
    if (item) {
      item.motivo_item = motivo;
    }
  }

  getCantidadItem(itemId: number): number {
    return this.itemsSeleccionados.get(itemId)?.cantidad || 1;
  }

  incrementarCantidad(itemId: number, maxCantidad: number): void {
    const item = this.itemsSeleccionados.get(itemId);
    if (item && item.cantidad < maxCantidad) {
      item.cantidad++;
    }
  }

  decrementarCantidad(itemId: number): void {
    const item = this.itemsSeleccionados.get(itemId);
    if (item && item.cantidad > 1) {
      item.cantidad--;
    }
  }

  /**
   * Maneja la selección de archivos de fotos
   */
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files.length + this.fotosDevolucion.length > 3) {
      this.mostrarModal('Límite de fotos', 'Puedes subir máximo 3 fotos', 'warning');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        this.mostrarModal('Tipo no válido', 'Solo se permiten archivos de imagen', 'warning');
        continue;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.mostrarModal('Archivo muy grande', 'Cada foto debe ser menor a 5MB', 'warning');
        continue;
      }

      this.fotosDevolucion.push(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewFotos.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    console.log('📸 Fotos agregadas:', this.fotosDevolucion.length);
  }

  /**
   * Elimina una foto del preview
   */
  eliminarFoto(index: number): void {
    this.fotosDevolucion.splice(index, 1);
    this.previewFotos.splice(index, 1);
  }

  /**
   * Calcula el total a devolver
   */
  calcularTotalDevolver(): number {
    let total = 0;
    this.itemsSeleccionados.forEach((itemDev) => {
      total += itemDev.cantidad * itemDev.precio_unitario;
    });
    return total;
  }

  /**
   * Envía la solicitud de devolución
   */
  async enviarSolicitudDevolucion(): Promise<void> {
    if (!this.ordenDevolucion) return;

    this.procesandoDevolucion = true;
    this.mensajeErrorDevolucion = '';
    this.mensajeExitoDevolucion = '';
    this.spinner.show();

    try {
      // 1. Subir fotos si hay
      const urlsFotos: string[] = [];
      for (const foto of this.fotosDevolucion) {
        try {
          const url = await this.subirFotoDevolucion(foto);
          urlsFotos.push(url);
        } catch (err) {
          console.error('Error al subir foto:', err);
        }
      }

      // 2. Crear objeto de devolución
      const devolucion: Partial<Devolucion> = {
        ordenId: this.ordenDevolucion.id,
        usuarioId: this._sso.usuario.id,
        motivo: this.motivoDevolucion,
        tipo_devolucion: this.tipoDevolucion,
        descripcion_detallada: this.descripcionDetallada,
        url_foto_1: urlsFotos[0] || undefined,
        url_foto_2: urlsFotos[1] || undefined,
        url_foto_3: urlsFotos[2] || undefined,
        activo: true
      };

      // 3. Registrar devolución
      this._apiserv.RegistrarDevolucion(devolucion).subscribe({
        next: (response: any) => {
          if (response.exito && response.devolucionId) {
            // 4. Registrar items
            const items = Array.from(this.itemsSeleccionados.values()).map(item => ({
              ...item,
              devolucionId: response.devolucionId
            }));

            this._apiserv.RegistrarItemsDevolucion(items).subscribe({
              next: () => {
                this.mensajeExitoDevolucion = '¡Solicitud de devolución enviada exitosamente!';
                this.procesandoDevolucion = false;
                this.pasoActualDevolucion = 4;
                this.spinner.hide();
                this.mostrarModalExitoEnvio = true;

                setTimeout(() => {
                  this.mostrarModalExitoEnvio = false;
                  this.cerrarModalDevoluciones();
                  this.carga(); // Recargar datos
                }, 3500);
              },
        error: (err) => {
          console.error('❌ Error al registrar items:', err);
          // Cancelar la devolución para que no quede huérfana en PENDIENTE
          this._apiserv.CancelarDevolucion(response.devolucionId, this.ordenDevolucion!.usuarioId).subscribe({
            next: () => console.log('🔄 Devolución huérfana cancelada automáticamente'),
            error: (e) => console.error('❌ No se pudo cancelar devolución huérfana:', e)
          });
          this.mensajeErrorDevolucion = 'Error al registrar los productos. Por favor intenta nuevamente.';
          this.procesandoDevolucion = false;
          this.spinner.hide();
        }
            });
          } else {
            this.mensajeErrorDevolucion = response.mensaje || 'Error al registrar la devolución';
            this.procesandoDevolucion = false;
            this.spinner.hide();
          }
        },
        error: (err) => {
          console.error('❌ Error al registrar devolución:', err);
          this.mensajeErrorDevolucion = err.error?.mensaje || 'Error al procesar la solicitud de devolución';
          this.procesandoDevolucion = false;
          this.spinner.hide();
        }
      });

    } catch (error) {
      console.error('❌ Error general:', error);
      this.mensajeErrorDevolucion = 'Error al procesar la solicitud de devolución';
      this.procesandoDevolucion = false;
      this.spinner.hide();
    }
  }

  /**
   * Sube una foto de devolución a Cloudinary o al servidor
   */
  private async subirFotoDevolucion(foto: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', foto);
      formData.append('tipo', 'devolucion');

      this._apiserv.SubirFotoDevolucion(formData).subscribe({        next: (response: any) => {
          if (response.url) {
            resolve(response.url);
          } else {
            reject('No se recibió URL de la imagen');
          }
        },
          error: (err: any) => {
          console.error('Error al subir foto:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * Verifica si se puede solicitar devolución para una orden
   */
  puedeDevolver(orden: Orden): boolean {
    // Verificar que esté verificada
    const estado = this.obtener(this.ListaEstadosOrden, orden.estadoOrdenId);
    if (!estado || !estado.descripcion.toLowerCase().includes('verificad')) {
      return false;
    }

    // Verificar plazo de 15 días
    const diasTranscurridos = this.calcularDiasTranscurridos(orden.fecha);
    return diasTranscurridos <= 15;
  }

  /**
   * Calcula los días transcurridos desde una fecha
   */
  calcularDiasTranscurridos(fecha: string): number {
    const fechaOrden = new Date(fecha);
    const hoy = new Date();
    const diferencia = hoy.getTime() - fechaOrden.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene los días restantes para devolver
   */
  diasRestantesParaDevolver(orden: Orden): number {
    const diasTranscurridos = this.calcularDiasTranscurridos(orden.fecha);
    return Math.max(0, 15 - diasTranscurridos);
  }

  /**
   * Obtiene los motivos según el tipo de devolución seleccionado
   */
  getMotivos(): string[] {
    return this.tipoDevolucion === 'REEMBOLSO' ? this.motivosReembolso : this.motivosCambio;
  }
}
