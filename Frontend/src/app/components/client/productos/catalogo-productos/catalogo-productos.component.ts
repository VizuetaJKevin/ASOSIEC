import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/Api.service';
import { producto } from 'src/app/interfaces/producto.interface';
import moment from 'moment';
import { LoginService } from 'src/app/services/login.service';
import { Item } from 'src/app/interfaces/items.interface';
import Swal from 'sweetalert2';
import { CarritoService } from '../../carrito/carrito.service';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-catalogo-productos',
    templateUrl: './catalogo-productos.component.html',
    styleUrls: ['./catalogo-productos.component.css'],
    standalone: false
})
export class CatalogoProductosComponent implements OnInit, OnDestroy {
  public listaproductos: producto[] = [];
  public filtroNombre = new FormControl('');
  public categoriaActual: number | null = null;
  public cargando: boolean = true;
  private destroy$ = new Subject<void>();

  readonly ESTADO_DISPONIBLE = 1;
  readonly ESTADO_AGOTADO = 2;
  readonly ESTADO_DESCONTINUADO = 3;

  readonly CATEGORIAS: { [key: number]: { nombre: string; icono: string; ruta: string } } = {
    1: { nombre: 'Bisutería', icono: '💎', ruta: 'joyeria' },
    2: { nombre: 'Decoración', icono: '🏠', ruta: 'decoracion' },
    3: { nombre: 'Textiles', icono: '🧵', ruta: 'textiles' },
    4: { nombre: 'Alimentos', icono: '🍯', ruta: 'alimentos' },
    5: { nombre: 'Cerámica', icono: '🏺', ruta: 'ceramica' }
  };

  constructor(
    private apiService: ApiService,
    private sso: LoginService,
    private carritoService: CarritoService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Escuchar cambios en la ruta
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const categoria = params.get('categoria');
        this.actualizarCategoria(categoria);
        this.cargarProductos();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private actualizarCategoria(rutaCategoria: string | null): void {
    if (!rutaCategoria || rutaCategoria === 'todos') {
      this.categoriaActual = null;
      return;
    }

    // Buscar ID de categoría por su ruta
    const categoriaId = Object.keys(this.CATEGORIAS).find(
      key => this.CATEGORIAS[+key].ruta === rutaCategoria
    );

    this.categoriaActual = categoriaId ? +categoriaId : null;
  }

  cargarProductos(): void {
    this.cargando = true;
    this.apiService.ConsultarProducto().subscribe({
      next: (lista) => {
        this.listaproductos = lista.filter((p) =>
          p.estadoProductoId !== this.ESTADO_DESCONTINUADO
        );

        this.cargando = false;
        console.log(`📦 Total de productos cargados: ${this.listaproductos.length}`);
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos'
        });
      }
    });
  }

  navegarACategoria(categoriaId: number | null): void {
    if (categoriaId === null) {
      this.router.navigate(['/productos/todos']);
    } else {
      const categoria = this.CATEGORIAS[categoriaId];
      if (categoria) {
        this.router.navigate([`/productos/${categoria.ruta}`]);
      }
    }
  }

  contarPorCategoria(categoriaId: number): number {
    return this.listaproductos.filter(p => p.categoria_producto_Id === categoriaId).length;
  }

  obtenerNombreCategoria(categoriaId: number): string {
    const categoria = this.CATEGORIAS[categoriaId];
    return categoria ? `${categoria.icono} ${categoria.nombre}` : 'Sin categoría';
  }

  obtenerTituloSeccion(): string {
    if (this.categoriaActual === null) {
      return '🪴 Todos los Productos';
    }
    const categoria = this.CATEGORIAS[this.categoriaActual];
    return categoria ? `${categoria.icono} ${categoria.nombre}` : 'Productos';
  }

  obtenerSubtituloSeccion(): string {
    if (this.categoriaActual === null) {
      return 'Explora nuestra colección completa de artesanías ecuatorianas';
    }
    const categoria = this.CATEGORIAS[this.categoriaActual];
    return categoria ? `Descubre nuestra selección de ${categoria.nombre.toLowerCase()}` : '';
  }

  estaDisponible(producto: producto): boolean {
    return producto.estadoProductoId === this.ESTADO_DISPONIBLE && producto.stock > 0;
  }

  estaAgotado(producto: producto): boolean {
    return producto.estadoProductoId === this.ESTADO_AGOTADO || producto.stock === 0;
  }

  obtenerTextoEstado(producto: producto): string {
    if (this.estaAgotado(producto)) {
      return 'Agotado';
    } else if (this.estaDisponible(producto)) {
      return 'Disponible';
    }
    return '';
  }

  obtenerClaseBadge(producto: producto): string {
    if (this.estaAgotado(producto)) {
      return 'badge-agotado';
    } else if (this.estaDisponible(producto)) {
      return 'badge-disponible';
    }
    return '';
  }

  agregarAlCarrito(productoId: number): void {
    const usuarioId = this.sso.usuario.id;

    if (!usuarioId) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar productos al carrito',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const producto = this.listaproductos.find(p => p.id === productoId);

    if (!producto) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Producto no encontrado'
      });
      return;
    }

    if (this.estaAgotado(producto)) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto agotado',
        html: `
          <p><strong>${producto.nombre_producto}</strong> no está disponible en este momento.</p>
          <p class="text-muted">Te notificaremos cuando vuelva a estar en stock.</p>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    this.apiService.ConsultarItemsUsuarioId(usuarioId).subscribe({
      next: (itemsEnCarrito) => {
        const itemExistente = itemsEnCarrito.find(item => item.Entidad_Item.productoId === productoId);

        if (itemExistente) {
          if (itemExistente.Entidad_Item.cantidad >= producto.stock) {
            Swal.fire({
              icon: 'warning',
              title: '¡Límite alcanzado!',
              html: `
                <p>Ya tienes <strong>${itemExistente.Entidad_Item.cantidad} unidades</strong> de <strong>${producto.nombre_producto}</strong> en tu carrito.</p>
                <p class="text-muted">Stock disponible: ${producto.stock} unidades</p>
              `,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#667eea',
              timer: 3500,
              toast: true,
              position: 'top-end'
            });
            return;
          }
        }

        this.registrarItemEnCarrito(producto, usuarioId);
      },
      error: (err) => {
        console.error('❌ Error al verificar items en carrito:', err);
        this.registrarItemEnCarrito(producto, usuarioId);
      }
    });
  }

  private registrarItemEnCarrito(producto: producto, usuarioId: number): void {
    moment.locale('Es');
    const fecha = moment().format();

    const item: Item = {
        id: 0,
        estadoItemId: 1,
        usuarioId: usuarioId,
        productoId: producto.id,
        ordenId: null,
        cantidad: 1,
        fecha: fecha,
    };

    this.apiService.RegistrarItems(item).subscribe({
        next: (resp) => {
            if (resp && resp.success === true) {
                this.apiService.items();
                this.carritoService.notificarCambio();

                Swal.fire({
                    icon: 'success',
                    title: '¡Producto agregado!',
                    text: `${producto.nombre_producto} se agregó al carrito`,
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Ya está en el carrito',
                    text: 'Este producto ya fue agregado anteriormente',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        },
        error: (err) => {
            console.error('❌ Error al agregar al carrito:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo agregar el producto al carrito.',
                confirmButtonColor: '#667eea'
            });
        }
    });
  }

  limpiarFiltro(): void {
    this.filtroNombre.setValue('');
  }

  limpiarTodosFiltros(): void {
    this.filtroNombre.setValue('');
    this.router.navigate(['/productos/todos']);
  }

  get productosFiltrados(): producto[] {
    let productos = this.listaproductos;

    if (this.categoriaActual !== null) {
      productos = productos.filter(p => p.categoria_producto_Id === this.categoriaActual);
    }

    const filtro = this.filtroNombre.value?.toLowerCase() || '';
    if (filtro) {
      productos = productos.filter(p =>
        p.nombre_producto.toLowerCase().includes(filtro) ||
        p.descripcion.toLowerCase().includes(filtro)
      );
    }

    return productos;
  }

  calcularDescuento(precioAntes: number, precioAhora: number): number {
    if (precioAntes <= precioAhora) return 0;
    return Math.round(((precioAntes - precioAhora) / precioAntes) * 100);
  }

  esCategoriaActiva(rutaCategoria: string): boolean {
    return this.router.url === `/productos/${rutaCategoria}`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Images/placeholder-product.png';
  }
}
