// carrito.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private productosEnCarrito: any[] = [];
  private carritoSubject = new BehaviorSubject<any[]>([]);
  private productosComprados: any[] = [];

  constructor() {
    // Recupera productos comprados del almacenamiento local al inicio
    const storedProductosComprados = localStorage.getItem('productosComprados');
    if (storedProductosComprados) {
      this.productosComprados = JSON.parse(storedProductosComprados);
    }
  }

  agregarAlCarrito(producto: any) {
    const index = this.productosEnCarrito.findIndex((p) => p.id === producto.id);

    if (index !== -1) {
      // Si el producto ya está en el carrito, actualiza la cantidad
      this.productosEnCarrito[index].cantidad += 1;
    } else {
      // Si el producto no está en el carrito, agrégalo
      this.productosEnCarrito.push({ ...producto, cantidad: 1 });
    }

    this.carritoSubject.next([...this.productosEnCarrito]);
  }

  actualizarCarrito(carrito: any[]) {
    this.productosEnCarrito = carrito;
    this.carritoSubject.next([...this.productosEnCarrito]);
  }

  finalizarCompra() {
    // Agrega productos comprados al array persistente
    this.productosComprados.push(...this.productosEnCarrito);

    // Guarda productos comprados en el almacenamiento local
    localStorage.setItem('productosComprados', JSON.stringify(this.productosComprados));

    // Limpia el carrito actual
    this.productosEnCarrito = [];
    this.carritoSubject.next([...this.productosEnCarrito]);
  }

  actualizarProductosComprados(productos: any[]) {
    // Actualiza productos comprados sin agregar nuevos
    this.productosComprados = productos;

    // Guarda productos comprados en el almacenamiento local
    localStorage.setItem('productosComprados', JSON.stringify(this.productosComprados));
  }

  obtenerCarrito() {
    return this.carritoSubject.asObservable();
  }

  obtenerProductosComprados() {
    // Obtener productos comprados del localStorage
    const storedProductosComprados = localStorage.getItem('productosComprados');
    if (storedProductosComprados) {
      this.productosComprados = JSON.parse(storedProductosComprados);
    }
    return this.productosComprados;
  }

  obtenerCantidadEnCarrito() {
    return this.productosEnCarrito.length;
  }


  obtenerCantidadTotalEnCarrito() {
    return this.productosEnCarrito.reduce(
      (total, producto) => total + producto.cantidad,
      0
    );
  }
}
