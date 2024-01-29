import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { categoria_prod } from "src/app/interfaces/categoria_prod.interface";
import { Estado } from "src/app/interfaces/estado.interface";
import { marca } from "src/app/interfaces/marca.interface";
import { producto } from "src/app/interfaces/producto.interface";
import { ApiService } from "src/app/Services/Api.service";
import { LoginService } from "src/app/Services/login.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-adm-productos',
  templateUrl: './adm-productos.component.html',
  styleUrls: ['./adm-productos.component.css']
})
export class AdmProductosComponent implements OnInit {

  displayedColumns: string[] = ['Id', 'Stock', 'Nombre','Marca' ,'Precio','Opciones'];
  private _fb=inject(FormBuilder);
  private _apiserv=inject(ApiService);
  private _Sso=inject(LoginService);
  public ListaProductos:producto[]=[];
  public ListaEstados:Estado[]=[];
  public Listacategoria_prod:categoria_prod[]=[];
  public ListaMarcas:marca[]=[];
  public producto!:producto|null;
  formulario:FormGroup=this._fb.group({
      id:[0],
      estadoId:[1],
      companiaId:[1],
      marca_producto_Id:[0,[Validators.required]],
      categoria_producto_Id:[0,[Validators.required]],
      nombre_producto:['',[Validators.required]],
      descripcion:['',[Validators.required]],
      stock:["",[Validators.required]],
      estrellas:[5],
      url_Img:["",[Validators.required]],
      precio_ahora:["",[Validators.required]],
      precio_antes:["",[Validators.required]]
  })
  formulario2:FormGroup=this._fb.group({
    id:[0],
    estadoId:[1],
    companiaId:[1],
    marca_producto_Id:[0,[Validators.required]],
    categoria_producto_Id:[0,[Validators.required]],
    nombre_producto:['',[Validators.required]],
    descripcion:['',[Validators.required]],
    stock:["",[Validators.required]],
    estrellas:[5],
    url_Img:["",[Validators.required]],
    precio_ahora:["",[Validators.required]],
    precio_antes:["",[Validators.required]]
})


  ngOnInit(): void {
      this.carga();

  }

  carga(){
      this._apiserv.ConsultarProducto().subscribe(reps=>{
          this.ListaProductos=reps;

      })
      this._Sso.ConsultarEstados().subscribe(reps=>{
          this.ListaEstados=reps.slice(0,2);
          console.log(reps);

      })
      this._apiserv.ConsultarMarca_Producto().subscribe(reps=>{
          this.ListaMarcas=reps;
          console.log(reps);

      })
      this._apiserv.ConsultarCategoria_Producto().subscribe(reps=>{
          this.Listacategoria_prod=reps;
          console.log(reps);

      })
  }

  registrar(){
      if (this.formulario.invalid) {
       return
      }
      this.formulario.get('companiaId')?.setValue(1);
      this._apiserv.RegistrarProducto(this.formulario.value).subscribe({
       next:(resp)=>{
           Swal.fire(
               'Registrado!',
               '',
               'success'
           )
           this.formulario.reset();
       }
      })
   }
   editar(producto:producto){
       this.producto=producto;
       this.formulario.get('id')?.setValue(this.producto.id);
       this.formulario.get('estadoId')?.setValue(this.producto.estadoId);
       this.formulario.get('companiaId')?.setValue(this.producto.companiaId);
       this.formulario.get('marca_producto_Id')?.setValue(this.producto.marca_producto_Id);
       this.formulario.get('categoria_producto_Id')?.setValue(this.producto.categoria_producto_Id);
       this.formulario.get('nombre_producto')?.setValue(this.producto.nombre_producto);
       this.formulario.get('descripcion')?.setValue(this.producto.descripcion);
       this.formulario.get('stock')?.setValue(this.producto.stock);
       this.formulario.get('estrellas')?.setValue(this.producto.estrellas);
       this.formulario.get('url_Img')?.setValue(this.producto.url_Img);
       this.formulario.get('precio_ahora')?.setValue(this.producto.precio_ahora);
       this.formulario.get('precio_antes')?.setValue(this.producto.precio_antes);
   }
   eliminar(id:number){
       if (id!=null) {
           this._apiserv.EliminarProducto(id).subscribe({
               next:(resp)=>{
                   Swal.fire(
                      'Eliminado!',
                      '',
                      'success'
                  )
                  this.carga();
              }
          })
       }
   }
   Actualizar(){
       if (this.formulario.invalid) {
           return
          }
          this._apiserv.ActualizarProducto(this.formulario.value).subscribe({
           next:(resp)=>{
               Swal.fire(
                   'Actualizado!',
                   '',
                   'success'
               )
               this.producto=null;
               this.carga();
           }
          })
   }
  obtenerNombreMarca(marcaId: number): string {
      if (this.ListaMarcas.length>0){
          return this.ListaMarcas.find(p=>p.id===marcaId)!.nombre_marca
      }
      return ''
  }
}
