export interface Item{
    id: number,
    estadoItemId: number,  
    usuarioId: number,
    productoId: number,
    ordenId: number | null,
    cantidad: number,
    fecha: string,
}
