import { Component, OnInit, ViewChild, inject } from "@angular/core";
import { CarritoService } from "../carrito.service";
import { MatTable } from "@angular/material/table";
import { ApiService } from "src/app/Services/Api.service";
import { userCredentialResponse } from "src/app/interfaces/userCredential.interface";
import { LoginService } from "src/app/Services/login.service";
import Swal from "sweetalert2";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { Router } from "@angular/router";
import { carrito } from "src/app/interfaces/carrito";

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.css']
})
export class CheckOutComponent implements OnInit {

  private _Api_service = inject(ApiService);
  private Login_Service = inject(LoginService);
  private _fb = inject(FormBuilder);
  private _router = inject(Router);
  envio:number=40;
  displayedColumns: string[] = ['Producto', 'Nombre', 'precio', 'cantidad', 'Eliminar'];
  @ViewChild(MatTable) table!: MatTable<carrito>;
  ELEMENT_DATA: carrito[] = []

  formulario:FormGroup=this._fb.group({
    id :[0,[Validators.required]],
    estadoId :[4,[Validators.required]],
    usuarioId :[this.user.id,[Validators.required]],
    companiaId :[1,[Validators.required]],
    nombre :[this.user.nombre,[Validators.required]],
    apellido :[this.user.apellido,[Validators.required]],
    email :[this.user.email,[Validators.required]],
    costo_envio :[this.envio,[Validators.required]],
    total :[0,[Validators.required]],
    token_orden :[""],
    direccion_1 :["norte",[Validators.required]],
    direccion_2 :["norte",[Validators.required]],
    fecha :[""],
  })


  get user():userCredentialResponse{
    return this.Login_Service.usuario;
  }
  get total():number{
    return  this.ELEMENT_DATA.map(p =>Number(p.precio)).reduce((prev, curr) => prev + curr, 0);
  }
  constructor() {}
  ngOnInit(): void {
    this.carga();
  }

  carga() {
    if (this.user.rolid === 2) {
      this._Api_service.ConsultarItemsUsuarioId(this.user.id).subscribe({
        next: (resp) => {
          console.log(resp);
          this.ELEMENT_DATA = resp.map((item) => {
            return {
              ...item,
              cantidad: item.entidad_Item.cantidad,
            };
          });
        },
      });
    }
  }

  comprar() {
    moment.locale('Es');
    let fecha = moment().format('');
    this.formulario.get("fecha")?.setValue(fecha);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();

      // Mostrar SweetAlert en caso de formulario no válido
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Aún no has completado los datos requeridos.',
      });

      return;
    }

    this.formulario.get("token_orden")?.setValue(this.generateToken(this.formulario.value.email));
    this.formulario.get("total")?.setValue(this.total + this.envio);

    console.log(this.formulario.value);

    this._Api_service.RegistrarOrden(this.formulario.value).subscribe({
      next: (resp) => {
        if (resp) {
          this._router.navigateByUrl("procesando");
        }
      }
    });
  }

  Eliminar(id:number){
    this._Api_service.EliminaItems(id).subscribe({
        next:(resp)=>{
          Swal.fire(
            'Eliminado!',
            '',
            'success'
        )
      this.carga();
      this._Api_service.items();
      }
    })
  }


  private generateToken(email: string): string {
    const chars = '0123456789';
    const randomValues = new Uint32Array(15);
    window.crypto.getRandomValues(randomValues);
    let transactionId = '';
    for (let i = 0; i < randomValues.length; i++) {
      const randomIndex = randomValues[i] % chars.length;
      transactionId += chars.charAt(randomIndex);
    }
    return transactionId;
  }

}
