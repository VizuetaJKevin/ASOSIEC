export interface producto {
  id: number;
  estadoProductoId: number;
  vendedorId: number;
  categoria_producto_Id: number;
  nombre_producto: string;
  descripcion: string;
  marcaId?: number | null;
  stock: number;
  estrellas: number;
  url_Img: string;
  precio_ahora: number;
  precio_antes: number;
  aprobado?: boolean;
  fecha_aprobacion?: Date;
  aprobado_por?: number;
  motivo_rechazo?: string;
  vendedorNombre?: string;
}
