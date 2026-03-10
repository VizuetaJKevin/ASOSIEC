export interface Devolucion {
    id: number;
    ordenId: number;
    usuarioId: number;
    estadoDevolucionId: number;
    motivo: string;
    tipo_devolucion: 'REEMBOLSO' | 'CAMBIO';
    descripcion_detallada?: string;
    url_foto_1?: string;
    url_foto_2?: string;
    url_foto_3?: string;
    numero_seguimiento?: string;
    fecha_solicitud: string;
    fecha_respuesta?: string;
    respondido_por?: number;
    respuesta_admin?: string;
    activo: boolean;
    // Campos adicionales del JOIN
    estado_descripcion?: string;
    estado_codigo?: string;
    token_orden?: string;
    total_orden?: number;
    nombre_usuario?: string;
    apellido_usuario?: string;
    email_usuario?: string;
}

export interface EstadoDevolucion {
    id: number;
    codigo: string;
    descripcion: string;
    activo: boolean;
}

export interface ItemDevolucion {
    id?: number;
    devolucionId?: number;
    itemId: number;
    productoId: number;
    cantidad: number;
    precio_unitario: number;
    motivo_item?: string;
    // Campos adicionales del JOIN
    nombre_producto?: string;
    url_imagen?: string;
}

export interface VerificacionDevolucion {
    puede_devolver: boolean;
    motivo_no_puede?: string;
    dias_restantes?: number;
}
