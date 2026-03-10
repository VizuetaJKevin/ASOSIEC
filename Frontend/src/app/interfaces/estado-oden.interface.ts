export interface EstadoOrden {
  id: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
  orden_flujo?: number;
}
