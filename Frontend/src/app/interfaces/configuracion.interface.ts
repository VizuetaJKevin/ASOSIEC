export interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  descripcion: string;
  tipo: 'STRING' | 'NUMBER' | 'BOOLEAN';
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  modificado_por: number | null;
}
