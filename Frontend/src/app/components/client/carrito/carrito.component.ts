import { Router } from '@angular/router';
import { CarritoService } from './carrito.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Item } from 'src/app/interfaces/items.interface';
import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CheckoutComponent } from 'src/app/components/client/checkout/checkout.component';
import { carrito } from 'src/app/interfaces/carrito';
import { userCredentialResponse } from 'src/app/interfaces/userCredential.interface';
import { LoginService } from '../../../services/login.service';
import { ApiService } from 'src/app/services/Api.service';

/**
 * ✅ COMPONENTE MIGRADO A CLOUDINARY
 * - Las imágenes ahora se cargan desde Cloudinary (URLs HTTP)
 * - Soporte para rutas locales antiguas como fallback
 * - Manejo de errores mejorado con console warnings
 */

@Component({
    selector: 'app-carrito',
    templateUrl: './carrito.component.html',
    styleUrls: ['./carrito.component.css'],
    standalone: false
})
export class CarritoComponent implements OnInit {
  @ViewChild('checkoutModal') checkoutModal!: CheckoutComponent;
  productosEnCarrito: carrito[] = [];
  totalValue: number = 0;

  mostrarDetalles: boolean = false;
  productoSeleccionado: carrito | null = null;

  private service = inject(ApiService);
  private _Api_service = inject(ApiService);
  private Login_Service = inject(LoginService);
  private _fb = inject(FormBuilder);
  private _router = inject(Router);
  envio: number = 3;


  readonly CATEGORIAS: { [key: number]: string } = {
    1: 'Bisutería',
    2: 'Decoración',
    3: 'Textiles',
    4: 'Alimentos',
    5: 'Cerámica',
    6: 'Oferta'
  };




  formulario: FormGroup = this._fb.group({
    id: [0, [Validators.required]],
    estadoOrdenId: [2, [Validators.required]],
    usuarioId: [this.user.id, [Validators.required]],
    companiaId: [1, [Validators.required]],
    nombre: [this.user.nombre, [Validators.required]],
    apellido: [this.user.apellido, [Validators.required]],
    email: [this.user.email, [Validators.required]],
    costo_envio: [this.envio, [Validators.required]],
    total: [0, [Validators.required]],
    token_orden: [''],
    direccion_1: ['norte', [Validators.required]],
    direccion_2: ['norte', [Validators.required]],
    fecha: [''],
  });

  constructor(
    private carritoService: CarritoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get total(): number {
    return this.productosEnCarrito
      .map((p) => this.obtenerPrecio(p) * p.Entidad_Item.cantidad)
      .reduce((prev, curr) => prev + curr, 0);
  }

  get user(): userCredentialResponse {
    return this.Login_Service.usuario;
  }

  ngOnInit() {
    this.carga();

    this.carritoService.carritoActualizado$.subscribe(() => {
      console.log('🔔 Carrito actualizado, recargando...');
      this.carga();
    });
  }

  get itemsTotal(): number {
    return this.service.totalItems;
  }

  carga() {
    this.productosEnCarrito = [];
    if (this.user.rolid === 2) {
      this._Api_service.ConsultarItemsUsuarioId(this.user.id).subscribe({
        next: (resp) => {
          console.log('📦 Productos recibidos del backend:', resp);
          this.productosEnCarrito = resp;

          if (resp.length > 0) {
            console.log('🔍 Ejemplo de producto:', resp[0]);
            console.log('   - nombre_producto:', resp[0].nombre_producto);
            console.log('   - Nombre:', resp[0].Nombre);
            console.log('   - nombre:', resp[0].nombre);
            console.log('   - categoria_producto_Id:', resp[0].categoria_producto_Id);
            console.log('   - url_Img:', resp[0].url_Img);
          }

          this.actualizarTotal();
          this.cdr.detectChanges();
        },
      });
    }
  }

  obtenerNombreProducto(producto: carrito): string {
    return producto.nombre_producto || producto.Nombre || producto.nombre || 'Producto sin nombre';
  }

  obtenerPrecio(producto: carrito): number {
    return producto.precio_ahora || producto.precio || 0;
  }

  obtenerRutaImagen(producto: carrito): string {
    const nombreImagen = producto.url_Img || producto.img || 'default.png';

    // ✅ Si la URL ya es de Cloudinary (comienza con http/https), devolverla directamente
    if (nombreImagen.startsWith('http')) {
      console.log('✅ Usando imagen de Cloudinary:', nombreImagen);
      return nombreImagen;
    }

    // ✅ Si es una ruta local antigua (fallback)
    const rutaCompleta = `assets/Images/productos/${nombreImagen}`;
    console.log('🖼️ Usando ruta local:', rutaCompleta);
    return rutaCompleta;
  }

  obtenerImagen(producto: carrito): string {
    return producto.url_Img || producto.img || 'default.png';
  }

  obtenerNombreCategoria(categoriaId: number): string {
    return this.CATEGORIAS[categoriaId] || 'Sin categoría';
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.warn('⚠️ Error cargando imagen:', imgElement.src);
    imgElement.src = 'assets/Images/productos/default.png';
  }

  abrirDetalles(producto: carrito) {
    this.productoSeleccionado = producto;
    this.mostrarDetalles = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalles() {
    this.mostrarDetalles = false;
    this.productoSeleccionado = null;
    document.body.style.overflow = 'auto';
  }

  eliminarProducto(id: number) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Se quitará este producto de tu carrito',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._Api_service.EliminaItems(id).subscribe({
          next: (resp) => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El producto se eliminó del carrito',
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });

            this.carga();
            this._Api_service.items();
            this.carritoService.notificarCambio();

            if (this.productosEnCarrito.length == 0 || this.productosEnCarrito.length == null) {
              this.productosEnCarrito = [];
            }
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el producto'
            });
          }
        });
      }
    });
  }

  incrementarCantidad(item: Item, stock: number) {
    if (item.cantidad < stock) {
      item.cantidad++;
      this.actualizarTotal();

      this._Api_service.ActualizarItems({
        ...item,
        cantidad: item.cantidad
      }).subscribe({
        next: (resp: boolean) => {
          console.log('✅ Cantidad actualizada en BD:', item.cantidad);
        },
        error: (err: any) => {
          console.error('❌ Error actualizando cantidad:', err);
          item.cantidad--;
          this.actualizarTotal();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la cantidad',
            timer: 2000,
            toast: true,
            position: 'top-end'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Límite alcanzado',
        text: `Solo hay ${stock} unidades disponibles`,
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  }

  decrementarCantidad(item: Item) {
    if (item.cantidad > 1) {
      item.cantidad--;
      this.actualizarTotal();

      this._Api_service.ActualizarItems({
        ...item,
        cantidad: item.cantidad
      }).subscribe({
        next: (resp: boolean) => {
          console.log('✅ Cantidad actualizada en BD:', item.cantidad);
        },
        error: (err: any) => {
          console.error('❌ Error actualizando cantidad:', err);
          item.cantidad++;
          this.actualizarTotal();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la cantidad',
            timer: 2000,
            toast: true,
            position: 'top-end'
          });
        }
      });
    }
  }

  private actualizarTotal() {
    this.totalValue = this.total;
  }

  private generateToken(email: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + email;
    const randomValues = new Uint32Array(15);
    window.crypto.getRandomValues(randomValues);
    let transactionId = '';
    for (let i = 0; i < randomValues.length; i++) {
      const randomIndex = randomValues[i] % chars.length;
      transactionId += chars.charAt(randomIndex);
    }
    return transactionId;
  }

  finalizarCompra() {
    moment.locale('Es');
    let fecha = moment().format();
    this.formulario.get('fecha')?.setValue(fecha);
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.formulario
      .get('token_orden')
      ?.setValue(this.generateToken(this.formulario.value.email));
    this.formulario.get('total')?.setValue(this.total + this.envio);
    this._Api_service.RegistrarOrden(this.formulario.value).subscribe({
      next: (resp) => {
        if (resp) {
          this._router.navigateByUrl('/procesando');
        }
      },
    });
  }

  abrirCheckoutModal() {
    if (this.productosEnCarrito.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Carrito vacío',
        text: 'Agrega productos antes de continuar',
        confirmButtonColor: '#667eea'
      });
      return;
    }
    this.checkoutModal.abrir(this.productosEnCarrito);
  }
}
