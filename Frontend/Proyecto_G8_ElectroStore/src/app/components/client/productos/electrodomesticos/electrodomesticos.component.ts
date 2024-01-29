import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/Services/Api.service';
import { producto } from 'src/app/interfaces/producto.interface';
import * as moment from 'moment';
import { LoginService } from 'src/app/Services/login.service';
import { Item } from 'src/app/interfaces/items.interface';
import Swal from 'sweetalert2';
import { CarritoService } from '../../carrito/carrito.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-electrodomesticos',
  templateUrl: './electrodomesticos.component.html',
  styleUrls: ['./electrodomesticos.component.css']
})
export class ElectrodomesticosComponent implements OnInit {
  public listaproductos: producto[] = [];
  public filtroNombre = new FormControl('');

  constructor(
    private apiService: ApiService,
    private sso: LoginService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.apiService.ConsultarProducto().subscribe({
      next: (lista) => {
        this.listaproductos = lista.filter((p) => p.categoria_producto_Id == 1);
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
