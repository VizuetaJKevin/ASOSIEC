export interface PerfilUsuario {
  id: number;
  estadoUsuarioId: number;
  rolId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string; 
  fotoPerfil?: string;
  redesSociales?: RedesSociales;
  estadisticas?: EstadisticasUsuario;
}

export interface RedesSociales {
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

export interface EstadisticasUsuario {
  productosComprados7Dias: number;
  totalGastado: number;
  comprasPorMes?: ComprasPorMes[];
}

export interface ComprasPorMes {
  mes: string;
  cantidad: number;
  monto: number;
}

export interface CambioContrasena {
  usuarioId: number;
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

export interface MensajeUsuario {
  id?: number;
  remitenteId: number;
  destinatarioId: number;
  asunto: string;
  mensaje: string;
  leido?: boolean;
  fechaEnvio?: Date;
  nombreRemitente?: string;
  emailRemitente?: string;
}
