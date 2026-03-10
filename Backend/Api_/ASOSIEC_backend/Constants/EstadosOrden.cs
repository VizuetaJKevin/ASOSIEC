namespace ASOSIEC.Constants
{
    /// <summary>
    /// CONSTANTES de Estados de Orden
    /// 
    /// Tabla BD: EstadoOrden
    /// Campos: id, nombre
    /// </summary>
    public static class EstadosOrden
    {
        /// <summary>
        /// Orden PENDIENTE - esperando pago
        /// BD: id = 1, nombre = "Pendiente"
        /// </summary>
        public const int PENDIENTE = 1;

        /// <summary>
        /// Orden PAGADA - pago confirmado
        /// BD: id = 2, nombre = "Pagada"
        /// </summary>
        public const int PAGADA = 2;

        /// <summary>
        /// Orden EN PREPARACIÓN - siendo preparada
        /// BD: id = 3, nombre = "En Preparación"
        /// </summary>
        public const int EN_PREPARACION = 3;

        /// <summary>
        /// Orden ENVIADA - en camino al cliente
        /// BD: id = 4, nombre = "Enviada"
        /// </summary>
        public const int ENVIADA = 4;

        /// <summary>
        /// Orden ENTREGADA - recibida por el cliente
        /// BD: id = 5, nombre = "Entregada"
        /// </summary>
        public const int ENTREGADA = 5;

        /// <summary>
        /// Orden CANCELADA - cancelada por cliente o admin
        /// BD: id = 6, nombre = "Cancelada"
        /// </summary>
        public const int CANCELADA = 6;

        /// <summary>
        /// Orden con DEVOLUCIÓN - producto devuelto
        /// BD: id = 7, nombre = "Devolución"
        /// </summary>
        public const int DEVOLUCION = 7;

        /// <summary>
        /// Obtiene el nombre del estado
        /// </summary>
        public static string ObtenerNombre(int estadoId)
        {
            return estadoId switch
            {
                PENDIENTE => "Pendiente",
                PAGADA => "Pagada",
                EN_PREPARACION => "En Preparación",
                ENVIADA => "Enviada",
                ENTREGADA => "Entregada",
                CANCELADA => "Cancelada",
                DEVOLUCION => "Devolución",
                _ => "Desconocido"
            };
        }

        /// <summary>
        /// Verifica si la orden puede ser cancelada
        /// </summary>
        public static bool PuedeCancelarse(int estadoId)
        {
            return estadoId == PENDIENTE || estadoId == PAGADA;
        }

        /// <summary>
        /// Verifica si la orden está completada
        /// </summary>
        public static bool EstaCompletada(int estadoId)
        {
            return estadoId == ENTREGADA;
        }

        /// <summary>
        /// Verifica si la orden está activa (no cancelada ni devuelta)
        /// </summary>
        public static bool EstaActiva(int estadoId)
        {
            return estadoId != CANCELADA && estadoId != DEVOLUCION;
        }
    }
}
