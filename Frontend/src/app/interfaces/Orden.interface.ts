export interface Orden{
    id: number,
    estadoOrdenId: number,  // ✅ ACTUALIZADO - El backend ahora devuelve esto
    usuarioId: number,
    companiaId: number,
    nombre: string,
    apellido: string,
    email: string,
    costo_envio: number,
    total: number,
    token_orden: string,
    direccion_1: string,
    direccion_2: string,
    fecha: string,
}
