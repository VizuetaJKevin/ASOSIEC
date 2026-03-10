import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/Api.service';
import { producto } from 'src/app/interfaces/producto.interface';
import moment from 'moment';
import { LoginService } from 'src/app/services/login.service';
import { Item } from 'src/app/interfaces/items.interface';
import Swal from 'sweetalert2';
import { CarritoService } from '../../client/carrito/carrito.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnInit {
  public listaproductos: producto[] = [];
  public productosOferta: producto[] = [];
  public cargando: boolean = true;

  readonly ESTADO_DISPONIBLE = 1;
  readonly ESTADO_AGOTADO = 2;
  readonly ESTADO_DESCONTINUADO = 3;
  readonly CATEGORIA_OFERTA = 6; // ✅ ID de la categoría "Oferta"

  constructor(
    private apiService: ApiService,
    private sso: LoginService,
    private carritoService: CarritoService,
    public router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.apiService.ConsultarProducto().subscribe({
      next: (lista) => {
        // ✅ Filtrar solo productos de la categoría "Oferta" (ID 6) y que no estén descontinuados
        this.listaproductos = lista.filter((p) =>
          p.estadoProductoId !== this.ESTADO_DESCONTINUADO
        );

        this.productosOferta = lista.filter((p) =>
          p.categoria_producto_Id === this.CATEGORIA_OFERTA &&
          p.estadoProductoId !== this.ESTADO_DESCONTINUADO
        );

        this.cargando = false;
        console.log(`🎉 Productos en oferta cargados: ${this.productosOferta.length}`);
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
  navigateToProductos() {
    // Si necesitas lógica extra antes de navegar (ej: tracking, validación)
    this.router.navigate(['/productos']);
  }
  calcularDescuento(precioAntes: number, precioAhora: number): number {
    if (precioAntes <= precioAhora) return 0;
    return Math.round(((precioAntes - precioAhora) / precioAntes) * 100);
  }

  // ✅ MÉTODO COMPLETO CON VALIDACIÓN DE STOCK
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

    const producto = this.productosOferta.find(p => p.id === productoId);

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

    // ✅ VALIDACIÓN: Verificar si ya tiene la cantidad máxima en el carrito
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

  // ✅ MÉTODO AUXILIAR: Registrar el item en el carrito
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
}
