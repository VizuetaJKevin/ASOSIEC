
import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from 'src/app/Services/Api.service';
import { producto } from 'src/app/interfaces/producto.interface';
import * as moment from 'moment';
import { LoginService } from 'src/app/Services/login.service';
import { Item } from 'src/app/interfaces/items.interface';
import { CarritoService } from '../../client/carrito/carrito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public listaproductos: producto[] = [];
  router: any;

  constructor(
    private apiService: ApiService,
    private sso: LoginService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.apiService.ConsultarProducto().subscribe({
      next: (lista) => {
        this.listaproductos = lista.filter((p) => p.categoria_producto_Id == 3);
      },
    });
  }

  agregarAlCarrito(productoId: number) {
    const usuarioId = this.sso.usuario.id;

    if (usuarioId) {
      moment.locale('Es');
      const fecha = moment().format();

      const item: Item = {
        id: 0,
        estadoId: 4,
        usuarioId: usuarioId,
        productoId: productoId,
        ordenId: null,
        cantidad: 1,
        fecha: fecha,
      };

      this.apiService.RegistrarItems(item).subscribe({
        next: (resp) => {
          if (resp) {
            Swal.fire('¡Su producto se ha agregado al carrito!', '', 'success');
            this.apiService.items();
          } else {
            Swal.fire('Ya en el carrito!', '', 'success');
          }
        },
      });

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Inicie sesión para comprar',
      });
    }
  }
}
