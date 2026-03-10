import { Item } from "./items.interface";

export interface carrito {
  // ✅ Campos del producto desde la BD
  id: number;
  estadoProductoId: number;
  vendedorId: number;
  categoria_producto_Id: number;
  nombre_producto: string;
  descripcion: string;
  marcaId?: number;
  stock: number;
  estrellas: number;
  url_Img: string;
  precio_ahora: number;
  precio_antes: number;

  // ✅ Campos alternativos para compatibilidad con backend (C#)
  img?: string;          // Alias de url_Img
  nombre?: string;       // Alias de nombre_producto
  Nombre?: string;       // Alias desde C# (Entidad_carrito.Nombre)
  precio?: number;       // Alias de precio_ahora

  // ✅ NUEVO: Información del vendedor
  nombre_vendedor?: string;
  nombre_comercial?: string;

  // ✅ Item del carrito
  Entidad_Item: Item;
}

// Mantener export alternativo por si se usa en otros lados
export interface CarritoInterface extends carrito {}
