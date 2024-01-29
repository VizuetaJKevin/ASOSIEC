import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Item } from "../interfaces/items.interface";
import { Orden } from '../interfaces/Orden.interface';
import { producto } from "../interfaces/producto.interface";
import { categoria_prod } from "../interfaces/categoria_prod.interface";
import { marca } from "../interfaces/marca.interface";
import { LoginService } from "./login.service";
import { carrito } from "../interfaces/carrito";

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl: string = environment.api;
    private http = inject(HttpClient);
    private sso = inject(LoginService);
    private headers: HttpHeaders = new HttpHeaders();
    private setHeaders() {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        })
        this.headers = headers;
    }
    totalItems:number=0;
    items(){
        this.ConsultarItemsUsuarioId(this.sso.usuario.id).subscribe({
            next:(resp)=>{
                this.totalItems=resp==null?0:resp.length;
            }
            ,error:(rx)=>{
                this.totalItems=0;
            }
        })
    }



    //Marca_Producto
    ConsultarMarca_Producto():Observable<marca[]>{
        this.setHeaders();
        return this.http.get<marca[]>(`${ this.baseUrl }ConsultarMarcaProducto`,{ headers:this.headers, responseType:'json' })
    }
    RegistrarMarca_Producto(Marca_Producto:marca):Observable<boolean>{
        this.setHeaders();
        return  this.http.post<boolean>(`${ this.baseUrl }Resgitar_marca_producto`,Marca_Producto,{ headers:this.headers, responseType:'json' })
    }
    ActualizarMarca_Producto(Marca_Producto:marca):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }Actualizar_marca_producto`,Marca_Producto,{ headers:this.headers, responseType:'json' })
    }
    EliminarMarca_Producto(id:number):Observable<boolean>{
        this.setHeaders();
        return  this.http.delete<boolean>(`${ this.baseUrl }Eliminar_marca_producto/${id}`,{ headers:this.headers, responseType:'json' })
    }

    //categoria_producto
    ConsultarCategoria_Producto():Observable<categoria_prod[]>{
        this.setHeaders();
        return this.http.get<categoria_prod[]>(`${ this.baseUrl }ConsultarCategoriaProducto`,{ headers:this.headers, responseType:'json' })
    }
    RegistrarCategoria_Producto(Categoria_Producto:categoria_prod):Observable<boolean>{
        this.setHeaders();
        return  this.http.post<boolean>(`${ this.baseUrl }RegistrarCategoriaProducto`,Categoria_Producto,{ headers:this.headers, responseType:'json' })
    }
    ActualizarCategoria_Producto(Categoria_Producto:categoria_prod):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }ActualizarCategoriaProducto`,Categoria_Producto,{ headers:this.headers, responseType:'json' })
    }
    EliminarCategoria_Producto(id:number):Observable<boolean>{
        this.setHeaders();
        return  this.http.delete<boolean>(`${ this.baseUrl }EliminarCategoriaProducto/${id}`,{ headers:this.headers, responseType:'json' })
    }

    //Producto
    ConsultarProducto():Observable<producto[]>{
        this.setHeaders();
        return this.http.get<producto[]>(`${ this.baseUrl }ConsultarProducto`,{ headers:this.headers, responseType:'json' })
    }
    RegistrarProducto(producto:producto):Observable<boolean>{
        this.setHeaders();
        return  this.http.post<boolean>(`${ this.baseUrl }RegistrarProducto`,producto,{ headers:this.headers, responseType:'json' })
    }
    ActualizarProducto(producto:producto):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }ActualizarProducto`,producto,{ headers:this.headers, responseType:'json' })
    }
    EliminarProducto(id:number):Observable<boolean>{
        this.setHeaders();
        return  this.http.delete<boolean>(`${ this.baseUrl }EliminarProducto/${id}`,{ headers:this.headers, responseType:'json' })
    }

    //Orden
    ConsultarOrden():Observable<Orden[]>{
        this.setHeaders();
        return this.http.get<Orden[]>(`${ this.baseUrl }Consultar_orden`,{ headers:this.headers, responseType:'json' })
    }
    consultarOrdenToken(token:string):Observable<Orden>{
        return this.http.get<Orden>(`${ this.baseUrl }ConsultarOrden/${token}`,{ headers:this.headers, responseType:'json' })
    }
    ConsultarOrdenUsuarioId(id:number):Observable<Orden[]>{
        this.setHeaders();
        return this.http.get<Orden[]>(`${ this.baseUrl }ConsultarOrdenUserId/${id}`,{ headers:this.headers, responseType:'json' })
    }

    RegistrarOrden(Orden:Orden):Observable<boolean>{
        localStorage.setItem('tokenOrden', Orden.token_orden);
        this.setHeaders();
        return  this.http.post<boolean>(`${ this.baseUrl }Resgitar_orden`,Orden,{ headers:this.headers, responseType:'json' })
    }



    ActualizarOrden(Orden:Orden):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }Actualizar_orden`,Orden,{ headers:this.headers, responseType:'json' })
    }
    EliminaOrden(id:number):Observable<boolean>{
        this.setHeaders();
        return  this.http.delete<boolean>(`${ this.baseUrl }Eliminar_orden/${id}`,{ headers:this.headers, responseType:'json' })
    }

    //Items
    ConsultarItems():Observable<Item[]>{
        this.setHeaders();
        return this.http.get<Item[]>(`${ this.baseUrl }ConsultarItem`,{ headers:this.headers, responseType:'json' })
    }
    ConsultarItemsUsuarioId(id:number):Observable<carrito[]>{
        this.setHeaders();
        return this.http.get<carrito[]>(`${ this.baseUrl }ConsultarItemId/${id}`,{ headers:this.headers, responseType:'json' })
    }

    RegistrarItems(Items:Item):Observable<boolean>{
        this.setHeaders();
        return  this.http.post<boolean>(`${ this.baseUrl }Resgitar_Item`,Items,{ headers:this.headers, responseType:'json' })
    }

    Actualizar_ItemUserId(userid:number,ordenId:number):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }Actualizar_ItemUserId/${userid}/${ordenId}`,{ headers:this.headers, responseType:'json' })
    }

    ActualizarItems(Items:Item):Observable<boolean>{
        this.setHeaders();
        return  this.http.put<boolean>(`${ this.baseUrl }Actualizar_items`,Items,{ headers:this.headers, responseType:'json' })
    }
    EliminaItems(id:number):Observable<boolean>{
        this.setHeaders();
        return  this.http.delete<boolean>(`${ this.baseUrl }Eliminar_Item/${id}`,{ headers:this.headers, responseType:'json' })
    }
    ConsultarmisproductosUsuarioId(id:number):Observable<Item[]>{
        this.setHeaders();
        return this.http.get<Item[]>(`${ this.baseUrl }Consultarmisproductosid/${id}`,{ headers:this.headers, responseType:'json' })
    }

}
