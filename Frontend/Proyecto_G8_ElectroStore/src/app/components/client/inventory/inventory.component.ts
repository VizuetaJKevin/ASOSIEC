import { Component, OnInit, inject } from '@angular/core';
import { Estado } from 'src/app/interfaces/estado.interface';
import { Item } from 'src/app/interfaces/items.interface';
import { marca } from 'src/app/interfaces/marca.interface';
import { producto } from 'src/app/interfaces/producto.interface';
import { ApiService } from 'src/app/Services/Api.service';
import { LoginService } from 'src/app/Services/login.service';
import { Orden } from 'src/app/interfaces/Orden.interface';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent implements OnInit{

  displayedColumns: string[] = ['N_Orden','Total','Fecha','Estado','Productos'];
  private service = inject(ApiService);
  public ListaProductos:producto[]=[];
  public ListaItem:Item[]=[];
  public ListaEstado:Estado[]=[];
  public ListaMarcas:marca[]=[];
  public ListaOrden:Orden[]=[];
  private _apiserv=inject(ApiService);
  private _sso=inject(LoginService);
  ngOnInit(): void {
    if (this._sso.usuario.id!=0) {
      this.carga();
    }
  }
  private carga(){
    this._sso.ConsultarEstados().subscribe(reps=>{
      this.ListaEstado=reps;
    })
    this._apiserv.ConsultarProducto().subscribe(reps=>{
      this.ListaProductos=reps;
    })
    this._apiserv.ConsultarMarca_Producto().subscribe(reps=>{
        this.ListaMarcas=reps;
    })
    this._apiserv.ConsultarmisproductosUsuarioId(this._sso.usuario.id).subscribe(reps=>{
      this.ListaItem=reps;
    })
    this._apiserv.ConsultarOrdenUsuarioId(this._sso.usuario.id).subscribe(reps=>{
      this.ListaOrden=reps;
    })
  }
  obtener(lista:any[],id: number): any {
    const elementoEncontrado = lista.find(p => p.id === id);
    return elementoEncontrado ? elementoEncontrado : '';
  }
  obtenerItems(idOrden: number): Item[] {
    const elementoEncontrado = this.ListaItem.filter(p => p.ordenId === idOrden);
    return elementoEncontrado ? elementoEncontrado : []
  }

}
