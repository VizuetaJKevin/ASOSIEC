namespace ASOSIEC.Constants
{
    /// <summary>
    /// CONSTANTES de Estados de Producto
    /// 
    /// Tabla BD: EstadoProducto
    /// Campos: id, nombre
    /// </summary>
    public static class EstadosProducto
    {
        /// <summary>
        /// Producto PENDIENTE de aprobación
        /// BD: id = 1, nombre = "Pendiente"
        /// </summary>
        public const int PENDIENTE = 1;

        /// <summary>
        /// Producto APROBADO - visible en la tienda
        /// BD: id = 2, nombre = "Aprobado"
        /// </summary>
        public const int APROBADO = 2;

        /// <summary>
        /// Producto RECHAZADO - no aprobado por admin
        /// BD: id = 3, nombre = "Rechazado"
        /// </summary>
        public const int RECHAZADO = 3;

        /// <summary>
        /// Producto AGOTADO - sin stock
        /// BD: id = 4, nombre = "Agotado"
        /// </summary>
        public const int AGOTADO = 4;

        /// <summary>
        /// Producto DESCONTINUADO - ya no se vende
        /// BD: id = 5, nombre = "Descontinuado"
        /// </summary>
        public const int DESCONTINUADO = 5;

        /// <summary>
        /// Obtiene el nombre del estado
        /// </summary>
        public static string ObtenerNombre(int estadoId)
        {
            return estadoId switch
            {
                PENDIENTE => "Pendiente",
                APROBADO => "Aprobado",
                RECHAZADO => "Rechazado",
                AGOTADO => "Agotado",
                DESCONTINUADO => "Descontinuado",
                _ => "Desconocido"
            };
        }

        /// <summary>
        /// Verifica si el producto está visible para venta
        /// </summary>
        public static bool EstaDisponibleParaVenta(int estadoId)
        {
            return estadoId == APROBADO;
        }
    }
}
