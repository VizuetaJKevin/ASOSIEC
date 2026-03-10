export interface Usuario{
    id: number,
    estadoUsuarioId: number,  // ✅ ACTUALIZADO - El backend ahora devuelve esto
    companiaId: number,
    rolId: number,
    nombre: string,
    apellido: string,
    email: string,
    direccion?: string;  // ✅ NUEVO - Campo de dirección
    password: string,
    telefono?: string;
    fotoPerfil?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    maxintentos: number,
    intentosfallidos: number,
    aprobado: boolean;
    fecha_aprobacion?: Date;
    aprobado_por?: number;

}
