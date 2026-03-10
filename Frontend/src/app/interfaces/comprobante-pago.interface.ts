export interface ComprobantePago {
    id: number;
    ordenId: number;
    url_comprobante: string;
    numero_referencia: string;
    direccion_entrega: string;
    telefono_contacto: string;
    observaciones: string;
    fecha_subida: string;
    verificado: boolean;
    fecha_verificacion?: string;
    verificado_por?: number;
    motivo_rechazo?: string;  // ✅ AGREGADO: Campo para almacenar el motivo del rechazo
}
