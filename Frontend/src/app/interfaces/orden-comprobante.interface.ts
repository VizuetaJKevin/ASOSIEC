import { Orden } from './Orden.interface';
import { ComprobantePago } from './comprobante-pago.interface';
import { Usuario } from './usuario.interface';

export interface OrdenConComprobante {
    orden: Orden;
    comprobante: ComprobantePago | null;
    usuario: Usuario | null;
}
