namespace ASOSIEC.Constants
{
    /// <summary>
    /// CONSTANTES de Estados de Item (productos dentro de una orden)
    /// 
    /// Tabla BD: EstadoItem
    /// Campos: id, nombre
    /// </summary>
    public static class EstadosItem
    {
        /// <summary>
        /// Item PENDIENTE - esperando procesamiento
        /// BD: id = 1, nombre = "Pendiente"
        /// </summary>
        public const int PENDIENTE = 1;

        /// <summary>
        /// Item CONFIRMADO - confirmado por vendedor
        /// BD: id = 2, nombre = "Confirmado"
        /// </summary>
        public const int CONFIRMADO = 2;

        /// <summary>
        /// Item EN PREPARACIÓN
        /// BD: id = 3, nombre = "En Preparación"
        /// </summary>
        public const int EN_PREPARACION = 3;

        /// <summary>
        /// Item ENVIADO
        /// BD: id = 4, nombre = "Enviado"
        /// </summary>
        public const int ENVIADO = 4;

        /// <summary>
        /// Item ENTREGADO
        /// BD: id = 5, nombre = "Entregado"
        /// </summary>
        public const int ENTREGADO = 5;

        /// <summary>
        /// Item CANCELADO
        /// BD: id = 6, nombre = "Cancelado"
        /// </summary>
        public const int CANCELADO = 6;

        /// <summary>
        /// Obtiene el nombre del estado
        /// </summary>
        public static string ObtenerNombre(int estadoId)
        {
            return estadoId switch
            {
                PENDIENTE => "Pendiente",
                CONFIRMADO => "Confirmado",
                EN_PREPARACION => "En Preparación",
                ENVIADO => "Enviado",
                ENTREGADO => "Entregado",
                CANCELADO => "Cancelado",
                _ => "Desconocido"
            };
        }

        /// <summary>
        /// Verifica si el item puede modificarse
        /// </summary>
        public static bool PuedeModificarse(int estadoId)
        {
            return estadoId == PENDIENTE || estadoId == CONFIRMADO;
        }
    }
}
