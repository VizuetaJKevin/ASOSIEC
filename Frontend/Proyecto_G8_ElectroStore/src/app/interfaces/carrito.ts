import { Item } from "./items.interface";

export interface carrito{
  id: number,
  img:string,
  nombre: string,
  precio: number,
  stock: number,
  descripcion: string,
  entidad_Item: Item
}
