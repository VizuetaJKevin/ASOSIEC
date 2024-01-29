// carrito.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from './carrito.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Item } from 'src/app/interfaces/items.interface';
import { carrito } from 'src/app/interfaces/carrito';
import { userCredentialResponse } from 'src/app/interfaces/userCredential.interface';
import { LoginService } from '../../../Services/login.service';
import { ApiService } from 'src/app/Services/Api.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements OnInit {
  productosEnCarrito: carrito[] = [];
  totalValue: number = 0;
  private service = inject(ApiService);
  private _Api_service = inject(ApiService);
  private Login_Service = inject(LoginService);
  private _fb = inject(FormBuilder);
  private _router = inject(Router);
  envio: number = 40;
  formulario: FormGroup = this._fb.group({
    id: [0, [Validators.required]],
    estadoId: [4, [Validators.required]],
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
      .map((p) => p.precio * p.entidad_Item.cantidad)
      .reduce((prev, curr) => prev + curr, 0);
  }

  get user(): userCredentialResponse {
    return this.Login_Service.usuario;
  }

  ngOnInit() {
    this.carga();
  }

  get itemsTotal(): number {
    return this.service.totalItems;
  }

  carga() {
    this.productosEnCarrito = [];
    if (this.user.rolid === 2) {
      this._Api_service.ConsultarItemsUsuarioId(this.user.id).subscribe({
        next: (resp) => {
          console.log(resp);
          this.productosEnCarrito = resp;
          this.actualizarTotal();
          // Asegúrate de que Angular detecte los cambios
          this.cdr.detectChanges();
        },
      });
    }
  }

  eliminarProducto(id: number) {
    this._Api_service.EliminaItems(id).subscribe({
      next: (resp) => {
        Swal.fire('Eliminado!', '', 'success');
        this.carga();
        this._Api_service.items();
        console.log(this.productosEnCarrito.length);

        if (
          this.productosEnCarrito.length == 0 ||
          this.productosEnCarrito.length == null
        ) {
          this.productosEnCarrito = [];
        }
      },
    });
  }

  incrementarCantidad(item: Item,stock:number) {
    if (item.cantidad < stock) {
      item.cantidad++;
      this.actualizarTotal();
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Límite alcanzado',
        text: 'Has alcanzado el número máximo de items en stock.',
      });
    }
  }

  decrementarCantidad(item: Item) {
    if (item.cantidad > 1) {
      item.cantidad--;
      this.actualizarTotal();
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
}
