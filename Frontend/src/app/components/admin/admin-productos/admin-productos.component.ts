import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { producto } from "src/app/interfaces/producto.interface";
import { ApiService } from "src/app/services/Api.service";
import { LoginService } from "src/app/services/login.service";
import { EstadoProducto } from "src/app/interfaces/estado-producto.interface";
import { MatDialog } from "@angular/material/dialog";
import { categoria_prod } from "src/app/interfaces/categoria_prod.interface";
import { vendedorProducto } from "src/app/interfaces/vendedorProducto.interface";
import { EstadosService } from "src/app/services/estados.service";
import Swal from "sweetalert2";
import { UploadService } from 'src/app/services/upload.service';


@Component({
    selector: 'app-admin-productos',
    templateUrl: './admin-productos.component.html',
    styleUrls: ['./admin-productos.component.css'],
    standalone: false
})
export class AdminProductosComponent implements OnInit {

  // ✅ Mapeo de categorías con iconos
  readonly CATEGORIAS: { [key: number]: { nombre: string; icono: string } } = {
    1: { nombre: 'Bisutería', icono: '💎' },
    2: { nombre: 'Decoración', icono: '🏠' },
    3: { nombre: 'Textiles', icono: '🧵' },
    4: { nombre: 'Alimentos', icono: '🍯' },
    5: { nombre: 'Cerámica', icono: '🏺' },
    6: { nombre: 'Oferta', icono: '✨' }
  };

  // ✅ Columnas dinámicas (se ajustarán según el rol)
  displayedColumns: string[] = [];

  private _fb = inject(FormBuilder);
  private _apiserv = inject(ApiService);
  public _Sso = inject(LoginService);
  private _estadosService = inject(EstadosService);
  private _uploadService = inject(UploadService);


  // public ListaProductos: producto[] = [];
  public ListaEstadosProducto: EstadoProducto[] = [];
  public Listacategoria_prod: categoria_prod[] = [];
  public ListaVendedores: vendedorProducto[] = [];
  public producto!: producto | null;
  public todosLosProductos: producto[] = [];
  //Listas filtradas separadas por estado (nombres diferentes para evitar conflicto)
  private listaProductosPendientes: producto[] = [];
  private listaProductosDisponibles: producto[] = [];
  private listaProductosAgotados: producto[] = [];
  private listaProductosDescontinuados: producto[] = [];
  private listaProductosRechazados: producto[] = [];

  public esVendedor: boolean = false;
  public esAdmin: boolean = false;
  public vendedorId: number = 0;
  public tabActiva: number = 0;
  public totalPendientes: number = 0;
  public totalDisponibles: number = 0;
  public totalAgotados: number = 0;
  public totalDescontinuados: number = 0;
  public totalRechazados: number = 0;
  public cargando: boolean = true;

  // Filtros de búsqueda
  public filtroNombre: string = '';
  public filtroVendedor: string = '';

  // Ordenamiento (sortable)
  public columnaOrdenamiento: string = 'nombre_producto';
  public ordenAscendente: boolean = true;

  // Paginación
  public paginaActual: number = 0;
  public productosPorPagina: number = 10;
  public opcionesPaginacion: number[] = [5, 10, 25, 50];

  // ✅ Control de modales
  public mostrarModalAgregar: boolean = false;
  public mostrarModalEditar: boolean = false;
  public formularioProducto: FormGroup;
  public modoEdicion: boolean = false;

  // ✅ Manejo de imágenes
  public imagenSeleccionada: File | null = null;
  public previsualizacionImagen: string | null = null;
  public subiendoImagen: boolean = false;

  constructor() {
    // Inicializar formulario vacío
    this.formularioProducto = this._fb.group({
      id: [0],
      estadoProductoId: [1, Validators.required],
      vendedorId: [1, Validators.required],
      categoria_producto_Id: [null, Validators.required],
      nombre_producto: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      marcaId: [null],
      stock: [1, [Validators.required, Validators.min(0)]],
      estrellas: [0],
      url_Img: ['', Validators.required],
      precio_ahora: [0, [Validators.required, Validators.min(0)]],
      precio_antes: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.inicializarVista();
    this.configurarListenersFormulario();
  }

  // ✅ Método para obtener la ruta correcta de la imagen según la categoría
  obtenerRutaImagen(producto: producto): string {
    const nombreImagen = producto.url_Img || 'placeholder.jpg';

    // ✅ Si la URL ya es de Cloudinary, devolverla directamente
    if (nombreImagen.startsWith('http')) {
      return nombreImagen;
    }

    // ✅ Si es una ruta local antigua
    return `assets/Images/productos/${nombreImagen}`;
  }

  // ✅ Método para manejar errores de carga de imagen
  manejarErrorImagen(event: any): void {
    // Establecer imagen por defecto si falla la carga
    event.target.src = 'assets/Images/productos/placeholder.jpg';
    console.warn('Error al cargar imagen, usando placeholder');
  }

  // ✅ Obtener icono de categoría
  obtenerIconoCategoria(categoriaId: number): string {
    return this.CATEGORIAS[categoriaId]?.icono || '📦';
  }

  // ✅ Obtener nombre de categoría
  obtenerNombreCategoria(categoriaId: number): string {
    return this.CATEGORIAS[categoriaId]?.nombre || 'Sin categoría';
  }

  configurarListenersFormulario() {
    // ✅ LISTENER 1: Cuando cambia el ESTADO
    this.formularioProducto.get('estadoProductoId')?.valueChanges.subscribe(nuevoEstado => {
      console.log('╔═══════════════════════════════════════');
      console.log('🔔 EVENTO: Estado cambió');
      console.log('📊 Nuevo estado:', nuevoEstado);
      console.log('📦 Stock actual:', this.formularioProducto.get('stock')?.value);

      // AGOTADO (2) → Stock = 0
      if (nuevoEstado == 2 || nuevoEstado === '2') {
        console.log('➡️ Ejecutando: poner stock en 0');
        this.formularioProducto.get('stock')?.setValue(0, { emitEvent: false });
        console.log('✅ Stock después del cambio:', this.formularioProducto.get('stock')?.value);
      }

      // DISPONIBLE (1) con stock 0 → Stock = 1
      if ((nuevoEstado == 1 || nuevoEstado === '1') && this.formularioProducto.get('stock')?.value == 0) {
        console.log('➡️ Ejecutando: poner stock en 1');
        this.formularioProducto.get('stock')?.setValue(1, { emitEvent: false });
        console.log('✅ Stock después del cambio:', this.formularioProducto.get('stock')?.value);
      }

      console.log('╚═══════════════════════════════════════');
    });

    // ✅ LISTENER 2: Cuando cambia el STOCK
    this.formularioProducto.get('stock')?.valueChanges.subscribe(nuevoStock => {
      console.log('╔═══════════════════════════════════════');
      console.log('🔔 EVENTO: Stock cambió');
      console.log('📦 Nuevo stock:', nuevoStock);
      console.log('📊 Estado actual:', this.formularioProducto.get('estadoProductoId')?.value);

      const estadoActual = this.formularioProducto.get('estadoProductoId')?.value;

      // Stock = 0 y estado es DISPONIBLE (1) → Cambiar a AGOTADO (2)
      if (nuevoStock == 0 && (estadoActual == 1 || estadoActual === '1')) {
        console.log('➡️ Ejecutando: cambiar estado a AGOTADO (2)');
        this.formularioProducto.get('estadoProductoId')?.setValue(2, { emitEvent: false });
        console.log('✅ Estado después del cambio:', this.formularioProducto.get('estadoProductoId')?.value);
      }

      // Stock > 0 y estado es AGOTADO (2) → Cambiar a DISPONIBLE (1)
      if (nuevoStock > 0 && (estadoActual == 2 || estadoActual === '2')) {
        console.log('➡️ Ejecutando: cambiar estado a DISPONIBLE (1)');
        this.formularioProducto.get('estadoProductoId')?.setValue(1, { emitEvent: false });
        console.log('✅ Estado después del cambio:', this.formularioProducto.get('estadoProductoId')?.value);
      }

      console.log('╚═══════════════════════════════════════');
    });
  }

    async inicializarVista() {
      this.cargando = true;
      this.esVendedor = this._Sso.esVendedor();
      this.esAdmin = this._Sso.esAdmin();

      // ✅ AJUSTAR COLUMNAS SEGÚN ROL
      if (this.esVendedor) {
        this.displayedColumns = ['Id', 'Stock', 'Nombre', 'Precio', 'Opciones'];
      } else {
        this.displayedColumns = ['Id', 'Stock', 'Nombre', 'Vendedor', 'Precio', 'Opciones'];
      }

      console.log(`🔍 Rol: ${this.esAdmin ? 'Admin' : this.esVendedor ? 'Vendedor' : 'Otro'}`);
      console.log(`📊 Columnas: ${this.displayedColumns}`);

      if (this.esVendedor) {
        await this.cargarProductosVendedor();
      } else {
        await this.cargarProductosAdmin();
      }

      // ✅ Actualizar contadores y cargar productos de la pestaña inicial
      this.actualizarContadores();
      this.cargarProductosPorPestana();

      this.cargando = false;
    }

  async cargarProductosVendedor() {
    try {
      console.log(`🔍 Buscando vendedor para usuario ID: ${this._Sso.usuario.id}`);

      const vendedorPerfil = await this._Sso.ConsultarVendedorPorUsuario(this._Sso.usuario.id).toPromise();

      if (!vendedorPerfil) {
        console.error('❌ No se encontró perfil de vendedor');
        Swal.fire({
          icon: 'warning',
          title: 'Perfil no encontrado',
          html: `
            <p>No se encontró tu perfil de vendedor.</p>
            <p><strong>Usuario ID:</strong> ${this._Sso.usuario.id}</p>
            <p>Contacta al administrador para que apruebe tu cuenta.</p>
          `,
          confirmButtonText: 'Entendido'
        });
        this.cargando = false;
        return;
      }

      this.vendedorId = vendedorPerfil.id;
      console.log(`✅ Vendedor ID encontrado: ${this.vendedorId}`);

      await this.cargarDatosAuxiliares();

      this._apiserv.ConsultarProductosPorVendedor(this.vendedorId).subscribe({
        next: (productos) => {
          this.todosLosProductos = productos;
          console.log(`✅ Productos del vendedor cargados: ${productos.length}`);

          // ✅ Filtrar productos en listas separadas y actualizar contadores
          this.actualizarContadores();
          this.cargarProductosPorPestana();
        },
        error: (error) => {
          console.error('❌ Error al cargar productos del vendedor:', error);
          Swal.fire('Error', 'No se pudieron cargar tus productos', 'error');
        }
      });

    } catch (error: any) {
      console.error('❌ Error al obtener perfil de vendedor:', error);

      let mensajeError = 'No se pudo cargar tu perfil de vendedor';

      if (error.status === 500) {
        mensajeError = `Tu cuenta de vendedor no ha sido creada aún. El administrador debe aprobar tu solicitud primero.`;
      } else if (error.status === 404) {
        mensajeError = 'No existe un perfil de vendedor para tu usuario.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: `
          <p>${mensajeError}</p>
          <p><strong>Usuario ID:</strong> ${this._Sso.usuario.id}</p>
          <p><small>Código de error: ${error.status || 'Desconocido'}</small></p>
        `,
        confirmButtonText: 'Entendido'
      });

      this.cargando = false;
    }
  }

  async cargarProductosAdmin() {
    this.cargarDatosAuxiliares();

    this._apiserv.ConsultarProductoAdmin().subscribe({
      next: (productos) => {
        this.todosLosProductos = productos;
        console.log(`✅ Productos cargados (Admin): ${productos.length}`);

        // ✅ Filtrar productos en listas separadas y actualizar contadores
        this.actualizarContadores();
        this.cargarProductosPorPestana();
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      }
    });
  }

  cargarDatosAuxiliares() {
    this._estadosService.ConsultarEstadosProducto().subscribe(reps => {
      this.ListaEstadosProducto = reps.filter(e => e.activo === true);
      console.log('✅ Estados de productos cargados:', this.ListaEstadosProducto);
    });

    this._apiserv.ConsultarCategoria_Producto().subscribe(reps => {
      this.Listacategoria_prod = reps;
      console.log('✅ Categorías cargadas:', this.Listacategoria_prod);
    });

    this._apiserv.ConsultarVendedorProducto().subscribe(reps => {
      this.ListaVendedores = reps;
      console.log('✅ Vendedores cargados:', this.ListaVendedores);
    });
  }

  // ============================================
  // ✅ NUEVOS MÉTODOS PARA APROBACIÓN DE PRODUCTOS
  // ============================================

  /**
   * 🚨 FIX: Cambio de pestaña sin saltos de scroll
   * Preserva la posición del scroll al cambiar entre pestañas
   */
  onTabChange(tabIndex: number): void {
    console.log(`🔄 Cambiando a pestaña: ${tabIndex}`);

    // Guardar la posición actual del scroll ANTES del cambio
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Actualizar la pestaña activa
    this.tabActiva = tabIndex;

    // Cargar productos de la nueva pestaña
    this.cargarProductosPorPestana();

    // Usar setTimeout para asegurar que Angular termine de renderizar
    // antes de restaurar la posición del scroll
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'instant' // Sin animación para evitar más saltos
      });
    }, 0);
  }

  /**
   * Cargar productos según pestaña activa
   * ✅ SIMPLIFICADO: Ahora solo resetea paginación, el filtrado lo hace el getter productosFiltrados
   */
  cargarProductosPorPestana(): void {
    // ✅ Solo resetear paginación al cambiar de pestaña
    this.paginaActual = 0;

    console.log(`🔄 Cambiando a pestaña: ${this.tabActiva}`);
  }


  /**
   * Actualizar contadores de badges en pestañas y filtrar productos por estado
   * ✅ CORREGIDO: Ahora también llena las listas separadas
   */
    actualizarContadores(): void {
      console.log('🔄 Actualizando contadores y filtrando productos...');

      // ✅ Filtrar productos por estado en listas separadas
      this.listaProductosPendientes = this.todosLosProductos.filter(p => p.estadoProductoId === 4);
      this.listaProductosDisponibles = this.todosLosProductos.filter(p => p.estadoProductoId === 1);
      this.listaProductosAgotados = this.todosLosProductos.filter(p => p.estadoProductoId === 2);
      this.listaProductosDescontinuados = this.todosLosProductos.filter(p => p.estadoProductoId === 3);
      this.listaProductosRechazados = this.todosLosProductos.filter(p => p.estadoProductoId === 5);

      // ✅ Calcular contadores basándose en las listas filtradas
      this.totalPendientes = this.listaProductosPendientes.length;
      this.totalDisponibles = this.listaProductosDisponibles.length;
      this.totalAgotados = this.listaProductosAgotados.length;
      this.totalDescontinuados = this.listaProductosDescontinuados.length;
      this.totalRechazados = this.listaProductosRechazados.length;

      console.log(`📊 Contadores actualizados:`, {
        pendientes: this.totalPendientes,
        disponibles: this.totalDisponibles,
        agotados: this.totalAgotados,
        descontinuados: this.totalDescontinuados,
        rechazados: this.totalRechazados,
        total: this.todosLosProductos.length
      });
    }
  /**
   * Aprobar producto (solo admin)
   */
  aprobarProducto(producto: producto): void {
    Swal.fire({
      title: '¿Aprobar este producto?',
      html: `
        <div class="text-start">
          <p><strong>Producto:</strong> ${producto.nombre_producto}</p>
          <p><strong>Vendedor:</strong> ${this.obtenerNombreVendedor(producto.vendedorId)}</p>
          <p><strong>Precio:</strong> $${producto.precio_ahora}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(`✅ Aprobando producto ${producto.id}`);

        this._apiserv.AprobarProducto(producto.id, this._Sso.usuario.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire({
                icon: 'success',
                title: 'Producto aprobado',
                text: 'El producto ahora está disponible para la venta',
                timer: 2000,
                showConfirmButton: false
              });

              // ✅ Recargar productos desde el servidor
              if (this.esVendedor) {
                this.cargarProductosVendedor();
              } else {
                this.cargarProductosAdmin();
              }
            } else {
              Swal.fire('Error', resp.mensaje || 'No se pudo aprobar el producto', 'error');
            }
          },
          error: (error) => {
            console.error('❌ Error al aprobar producto:', error);
            Swal.fire('Error', 'Error al comunicarse con el servidor', 'error');
          }
        });
      }
    });
  }

  /**
   * Rechazar producto (solo admin)
   */
  rechazarProducto(producto: producto): void {
    Swal.fire({
      title: 'Rechazar producto',
      html: `
        <div class="text-start mb-3">
          <p><strong>Producto:</strong> ${producto.nombre_producto}</p>
          <p><strong>Vendedor:</strong> ${this.obtenerNombreVendedor(producto.vendedorId)}</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Explica por qué se rechaza este producto...',
      inputAttributes: {
        'aria-label': 'Motivo del rechazo'
      },
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Debes indicar un motivo de rechazo';
        }
        if (value.trim().length < 10) {
          return 'El motivo debe tener al menos 10 caracteres';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(`❌ Rechazando producto ${producto.id}`);
        console.log(`📝 Motivo: ${result.value}`);

        this._apiserv.RechazarProducto(producto.id, this._Sso.usuario.id, result.value).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire({
                icon: 'success',
                title: 'Producto rechazado',
                text: 'El vendedor será notificado del rechazo',
                timer: 2000,
                showConfirmButton: false
              });

              // ✅ Recargar productos desde el servidor
              if (this.esVendedor) {
                this.cargarProductosVendedor();
              } else {
                this.cargarProductosAdmin();
              }
            } else {
              Swal.fire('Error', resp.mensaje || 'No se pudo rechazar el producto', 'error');
            }
          },
          error: (error) => {
            console.error('❌ Error al rechazar producto:', error);
            Swal.fire('Error', 'Error al comunicarse con el servidor', 'error');
          }
        });
      }
    });
  }

  // ============================================
  // MÉTODOS DE MODALES (CONTINUACIÓN)
  // ============================================

  // ✅ ABRIR MODAL AGREGAR
  abrirModalAgregar() {
    if (this.esVendedor && this.vendedorId === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Perfil no disponible',
        text: 'No se pudo cargar tu perfil de vendedor. Recarga la página o contacta al administrador.',
      });
      return;
    }

    if (this.ListaEstadosProducto.length === 0 || this.Listacategoria_prod.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos no cargados',
        text: 'Espera a que se carguen todos los datos necesarios.',
      });
      return;
    }

    this.modoEdicion = false;
    const vendedorIdInicial = this.esVendedor ? this.vendedorId : (this.ListaVendedores[0]?.id || 1);

    // ✅ CAMBIO: Vendedores crean productos en estado PENDIENTE (4), Admin puede elegir
    const estadoInicial = this.esVendedor ? 4 : 1;

    this.formularioProducto.reset({
      id: 0,
      estadoProductoId: estadoInicial,  // ✅ PENDIENTE para vendedores
      vendedorId: vendedorIdInicial,
      categoria_producto_Id: null,
      nombre_producto: '',
      descripcion: '',
      marcaId: null,
      stock: 1,
      estrellas: 0,
      url_Img: '',
      precio_ahora: 0,
      precio_antes: 0
    });

    // ✅ Limpiar imagen seleccionada
    this.imagenSeleccionada = null;
    this.previsualizacionImagen = null;

    if (this.esVendedor) {
      this.formularioProducto.get('vendedorId')?.disable();
      // ✅ NUEVO: Vendedor NO puede cambiar el estado al crear (siempre PENDIENTE)
      this.formularioProducto.get('estadoProductoId')?.disable();
    } else {
      this.formularioProducto.get('vendedorId')?.enable();
      this.formularioProducto.get('estadoProductoId')?.enable();
    }

    this.mostrarModalAgregar = true;
  }

  // ✅ ABRIR MODAL EDITAR
  abrirModalEditar(producto: producto) {
    if (this.esVendedor && producto.vendedorId !== this.vendedorId) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'Solo puedes editar tus propios productos',
      });
      return;
    }

    // ✅ NUEVO: Vendedor NO puede editar productos PENDIENTES o RECHAZADOS
    if (this.esVendedor && (producto.estadoProductoId === 4 || producto.estadoProductoId === 5)) {
      const mensaje = producto.estadoProductoId === 4
        ? 'Este producto está pendiente de aprobación por el administrador. No puedes editarlo hasta que sea aprobado.'
        : `Este producto fue rechazado. Motivo: ${producto.motivo_rechazo || 'No especificado'}. Contacta al administrador.`;

      Swal.fire({
        icon: 'warning',
        title: 'Producto no editable',
        html: mensaje,
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.modoEdicion = true;

    this.formularioProducto.patchValue({
      id: producto.id,
      estadoProductoId: producto.estadoProductoId,
      vendedorId: producto.vendedorId,
      categoria_producto_Id: producto.categoria_producto_Id,
      nombre_producto: producto.nombre_producto,
      descripcion: producto.descripcion,
      marcaId: producto.marcaId || null,
      stock: producto.stock,
      estrellas: producto.estrellas,
      url_Img: producto.url_Img,
      precio_ahora: producto.precio_ahora,
      precio_antes: producto.precio_antes
    });

    // ✅ Limpiar selección de nueva imagen
    this.imagenSeleccionada = null;
    this.previsualizacionImagen = null;

    if (this.esVendedor) {
      this.formularioProducto.get('vendedorId')?.disable();
      // ✅ NUEVO: Vendedor puede cambiar el estado solo entre Disponible, Agotado, Descontinuado
      this.formularioProducto.get('estadoProductoId')?.enable();
    } else {
      this.formularioProducto.get('vendedorId')?.enable();
      this.formularioProducto.get('estadoProductoId')?.enable();
    }

    this.mostrarModalEditar = true;
  }

  // ✅ CERRAR MODALES
  cerrarModal() {
    this.mostrarModalAgregar = false;
    this.mostrarModalEditar = false;
    this.formularioProducto.reset();
    this.imagenSeleccionada = null;
    this.previsualizacionImagen = null;
  }

  // ============================================
  // ✅ MÉTODOS PARA MANEJO DE IMÁGENES
  // ============================================

  /**
   * Manejar selección de archivo de imagen
   */
onImagenSeleccionada(event: any) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  // Validar archivo
  const validation = this._uploadService.validateImageFile(file);

  if (!validation.valid) {
    Swal.fire({
      icon: 'error',
      title: 'Archivo no válido',
      text: validation.error
    });
    event.target.value = ''; // Limpiar input
    return;
  }

  this.imagenSeleccionada = file;

  // Crear previsualización
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.previsualizacionImagen = e.target.result;
  };
  reader.readAsDataURL(file);

  // ✅ AGREGAR ESTO: Marcar que hay imagen para habilitar el botón
  this.formularioProducto.get('url_Img')?.setValue('pending_upload');

  console.log('✅ Imagen seleccionada:', file.name);
}

  /**
   * Limpiar imagen seleccionada
   */
    limpiarImagen() {
      this.imagenSeleccionada = null;
      this.previsualizacionImagen = null;
      // ✅ AGREGAR ESTO: Limpiar el valor del formulario
      this.formularioProducto.get('url_Img')?.setValue('');
    }

  // ✅ GUARDAR PRODUCTO (AGREGAR O EDITAR) - CON CLOUDINARY
  async guardarProducto() {
    if (this.formularioProducto.invalid) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // ✅ Si hay imagen seleccionada, subirla primero
    if (this.imagenSeleccionada) {
      this.subiendoImagen = true;

      try {
        const uploadResponse = await this._uploadService
          .uploadProductImage(this.imagenSeleccionada)
          .toPromise();

        if (uploadResponse && uploadResponse.success && uploadResponse.url) {
          this.formularioProducto.get('url_Img')?.setValue(uploadResponse.url);
          console.log('✅ Imagen subida a Cloudinary:', uploadResponse.url);
          console.log('🔍 VALOR EN FORMULARIO:', this.formularioProducto.get('url_Img')?.value);
        } else {
          throw new Error('No se recibió URL de la imagen');
        }

        this.subiendoImagen = false;
      } catch (error) {
        console.error('❌ Error al subir imagen:', error);
        this.subiendoImagen = false;
        Swal.fire('Error', 'No se pudo subir la imagen. Intenta nuevamente.', 'error');
        return;
      }
    }

    // ✅ Si está editando y NO hay nueva imagen, verificar que tenga URL
    if (this.modoEdicion && !this.imagenSeleccionada) {
      const urlActual = this.formularioProducto.get('url_Img')?.value;
      if (!urlActual) {
        Swal.fire('Error', 'El producto debe tener una imagen', 'error');
        return;
      }
    }

    // ✅ Si está agregando y NO hay imagen seleccionada
    if (!this.modoEdicion && !this.imagenSeleccionada) {
      Swal.fire('Error', 'Debes seleccionar una imagen para el producto', 'error');
      return;
    }

    const productoData = {
      ...this.formularioProducto.getRawValue()
    };

    // ✅ VALIDACIÓN: Vendedores siempre crean productos en estado PENDIENTE
    if (!this.modoEdicion && this.esVendedor) {
      productoData.estadoProductoId = 4; // PENDIENTE
      console.log('📌 Producto de vendedor forzado a estado PENDIENTE (4)');
    }

    // ✅ VALIDACIÓN: Vendedor NO puede cambiar a estados reservados (4 o 5)
    if (this.modoEdicion && this.esVendedor) {
      if (productoData.estadoProductoId === 4 || productoData.estadoProductoId === 5) {
        Swal.fire({
          icon: 'error',
          title: 'Estado no permitido',
          text: 'No puedes cambiar el producto a estado Pendiente o Rechazado',
        });
        return;
      }
    }

    console.log('📦 Producto a guardar:', productoData);
    console.log('🔍 URL que se enviará:', productoData.url_Img);

    if (this.modoEdicion) {
      // EDITAR
      this._apiserv.ActualizarProducto(productoData).subscribe({
        next: (resp) => {
          Swal.fire({
            title: '¡Actualizado!',
            text: 'El producto ha sido actualizado correctamente',
            icon: 'success',
            confirmButtonColor: '#667eea'
          });
          this.cerrarModal();

          // ✅ Recargar productos desde el servidor
          if (this.esVendedor) {
            this.cargarProductosVendedor();
          } else {
            this.cargarProductosAdmin();
          }
        },
        error: (error) => {
          console.error('❌ Error al actualizar:', error);
          Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
        }
      });
    } else {
      // AGREGAR
      this._apiserv.RegistrarProducto(productoData).subscribe({
        next: (resp) => {
          // ✅ Mensaje diferente para vendedor vs admin
          const mensaje = this.esVendedor
            ? 'Tu producto ha sido enviado y está pendiente de aprobación por el administrador.'
            : 'El producto ha sido agregado correctamente';

          const titulo = this.esVendedor ? '¡Producto Enviado!' : '¡Registrado!';

          Swal.fire({
            title: titulo,
            text: mensaje,
            icon: 'success',
            confirmButtonColor: '#667eea'
          });
          this.cerrarModal();

          // ✅ Recargar productos desde el servidor
          if (this.esVendedor) {
            this.cargarProductosVendedor();
          } else {
            this.cargarProductosAdmin();
          }
        },
        error: (error) => {
          console.error('❌ Error al registrar:', error);
          Swal.fire('Error', 'No se pudo registrar el producto', 'error');
        }
      });
    }
  }

  // ✅ ELIMINAR PRODUCTO
  eliminar(id: number) {
    const producto = this.todosLosProductos.find(p => p.id === id);

    if (!producto) {
      Swal.fire('Error', 'Producto no encontrado', 'error');
      return;
    }

    if (this.esVendedor && producto.vendedorId !== this.vendedorId) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'Solo puedes eliminar tus propios productos',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar "${producto.nombre_producto}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._apiserv.EliminarProducto(id).subscribe({
          next: (resp) => {
            Swal.fire('¡Eliminado!', 'El producto ha sido eliminado', 'success');

            // ✅ Recargar productos desde el servidor
            if (this.esVendedor) {
              this.cargarProductosVendedor();
            } else {
              this.cargarProductosAdmin();
            }
          },
          error: (error) => {
            console.error('❌ Error al eliminar:', error);
            Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
          }
        });
      }
    });
  }

  obtenerNombreVendedor(vendedorId: number): string {
    if (this.ListaVendedores.length > 0) {
      const vendedor = this.ListaVendedores.find(p => p.id === vendedorId);
      return vendedor ? vendedor.nombre_comercial : 'Vendedor no encontrado';
    }
    return 'Cargando...';
  }

  // ✅ GETTERS para stats (evitar arrow functions en template)
  get productosDisponibles(): number {
    return this.todosLosProductos.filter(p => p.estadoProductoId === 1).length;
  }

  get productosAgotados(): number {
    return this.todosLosProductos.filter(p => p.estadoProductoId === 2).length;
  }

  get productosStockBajo(): number {
    return this.todosLosProductos.filter(p => p.stock < 5).length;
  }

  /**
   * Retorna los estados de producto que puede ver/usar el usuario actual
   * - VENDEDOR: Solo puede ver/cambiar entre Disponible (1), Agotado (2), Descontinuado (3)
   * - ADMIN: Puede ver todos los estados
   */
  get estadosPermitidos(): EstadoProducto[] {
    if (this.esVendedor) {
      // Vendedor solo puede usar: Disponible, Agotado, Descontinuado
      return this.ListaEstadosProducto.filter(estado =>
        estado.id === 1 || estado.id === 2 || estado.id === 3
      );
    } else {
      // Admin puede usar todos los estados
      return this.ListaEstadosProducto;
    }
  }

  /**
   * Productos filtrados por nombre y vendedor
   * ✅ MODIFICADO: Ahora filtra directamente según la pestaña activa
   */
  get productosFiltrados(): producto[] {
    // ✅ Seleccionar productos según la pestaña activa
    let productos: producto[] = [];

    switch (this.tabActiva) {
      case 0: // PENDIENTES
        productos = [...this.listaProductosPendientes];
        break;
      case 1: // DISPONIBLES
        productos = [...this.listaProductosDisponibles];
        break;
      case 2: // AGOTADOS
        productos = [...this.listaProductosAgotados];
        break;
      case 3: // DESCONTINUADOS
        productos = [...this.listaProductosDescontinuados];
        break;
      case 4: // RECHAZADOS
        productos = [...this.listaProductosRechazados];
        break;
      default:
        productos = [...this.todosLosProductos];
    }

    // Filtrar por nombre
    if (this.filtroNombre.trim()) {
      const filtro = this.filtroNombre.toLowerCase().trim();
      productos = productos.filter(p =>
        p.nombre_producto.toLowerCase().includes(filtro) ||
        p.descripcion.toLowerCase().includes(filtro)
      );
    }

    // Filtrar por vendedor (solo para admins)
    if (!this.esVendedor && this.filtroVendedor.trim()) {
      const filtro = this.filtroVendedor.toLowerCase().trim();
      productos = productos.filter(p => {
        const nombreVendedor = this.obtenerNombreVendedor(p.vendedorId).toLowerCase();
        return nombreVendedor.includes(filtro);
      });
    }

    return productos;
  }

  /**
   * Productos filtrados y ordenados
   */
  get productosOrdenados(): producto[] {
    const productos = [...this.productosFiltrados];

    productos.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.columnaOrdenamiento) {
        case 'nombre_producto':
          valorA = a.nombre_producto.toLowerCase();
          valorB = b.nombre_producto.toLowerCase();
          break;
        case 'categoria':
          valorA = this.obtenerNombreCategoria(a.categoria_producto_Id);
          valorB = this.obtenerNombreCategoria(b.categoria_producto_Id);
          break;
        case 'stock':
          valorA = a.stock;
          valorB = b.stock;
          break;
        case 'precio':
          valorA = a.precio_ahora;
          valorB = b.precio_ahora;
          break;
        case 'vendedor':
          valorA = this.obtenerNombreVendedor(a.vendedorId).toLowerCase();
          valorB = this.obtenerNombreVendedor(b.vendedorId).toLowerCase();
          break;
        case 'estado':
          valorA = a.estadoProductoId;
          valorB = b.estadoProductoId;
          break;
        default:
          valorA = a.nombre_producto.toLowerCase();
          valorB = b.nombre_producto.toLowerCase();
      }

      if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
      if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
      return 0;
    });

    return productos;
  }

  /**
   * Productos paginados (filtrados, ordenados y paginados)
   */
  get productosPaginados(): producto[] {
    const inicio = this.paginaActual * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    return this.productosOrdenados.slice(inicio, fin);
  }

  /**
   * Total de páginas
   */
  get totalPaginas(): number {
    return Math.ceil(this.productosOrdenados.length / this.productosPorPagina);
  }

  /**
   * Información de paginación para mostrar
   */
  get infoPaginacion(): string {
    const total = this.productosOrdenados.length;
    if (total === 0) return 'No hay productos';

    const inicio = this.paginaActual * this.productosPorPagina + 1;
    const fin = Math.min((this.paginaActual + 1) * this.productosPorPagina, total);
    return `Mostrando ${inicio}-${fin} de ${total} productos`;
  }

  /**
   * Ordenar por columna (toggle ascendente/descendente)
   */
  ordenarPor(columna: string): void {
    if (this.columnaOrdenamiento === columna) {
      // Toggle orden si es la misma columna
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      // Nueva columna, orden ascendente por defecto
      this.columnaOrdenamiento = columna;
      this.ordenAscendente = true;
    }

    // Resetear a primera página al ordenar
    this.paginaActual = 0;
  }

  /**
   * Obtener ícono de ordenamiento
   */
  obtenerIconoOrden(columna: string): string {
    if (this.columnaOrdenamiento !== columna) {
      return 'unfold_more'; // Ícono neutro
    }
    return this.ordenAscendente ? 'arrow_upward' : 'arrow_downward';
  }

  /**
   * Verificar si la columna está siendo ordenada
   */
  esColumnaOrdenada(columna: string): boolean {
    return this.columnaOrdenamiento === columna;
  }

  // ============================================
  // ✅ NUEVO: MÉTODOS PARA PAGINACIÓN
  // ============================================

  /**
   * Ir a una página específica
   */
  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      // No hacemos scroll automático - el usuario controla donde está
    }
  }

  /**
   * Cambiar cantidad de productos por página
   */
  cambiarProductosPorPagina(cantidad: number): void {
    this.productosPorPagina = cantidad;
    this.paginaActual = 0; // Resetear a primera página
  }

  /**
   * Obtener array de números de página para mostrar
   */
  obtenerPaginasVisibles(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const visibles: number[] = [];

    if (total <= 7) {
      // Mostrar todas las páginas si son 7 o menos
      for (let i = 0; i < total; i++) {
        visibles.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      visibles.push(0); // Primera página siempre

      if (actual > 3) {
        visibles.push(-1); // Elipsis
      }

      const inicio = Math.max(1, actual - 1);
      const fin = Math.min(total - 2, actual + 1);

      for (let i = inicio; i <= fin; i++) {
        visibles.push(i);
      }

      if (actual < total - 4) {
        visibles.push(-1); // Elipsis
      }

      visibles.push(total - 1); // Última página siempre
    }

    return visibles;
  }

  // ============================================
  // ✅ NUEVO: MÉTODOS PARA FILTROS
  // ============================================

  /**
   * Limpiar todos los filtros
   */
  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroVendedor = '';
    this.paginaActual = 0;
  }

  /**
   * Aplicar filtros (llamar cuando cambian los inputs)
   */
  aplicarFiltros(): void {
    this.paginaActual = 0; // Resetear a primera página
  }
}
