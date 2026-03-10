namespace ASOSIEC.Constants
{
    /// <summary>
    /// CONSTANTES de Estados de Usuario
    /// 
    /// ⚠️ IMPORTANTE: Estos valores corresponden EXACTAMENTE a los IDs de la tabla EstadoUsuario en la BD
    /// Si cambias los IDs en la BD, DEBES actualizar estos valores aquí
    /// 
    /// Tabla BD: EstadoUsuario
    /// Campos: id, nombre
    /// </summary>
    public static class EstadosUsuario
    {
        /// <summary>
        /// Usuario PENDIENTE de aprobación
        /// BD: id = 1, nombre = "Pendiente"
        /// </summary>
        public const int PENDIENTE = 1;

        /// <summary>
        /// Usuario ACTIVO - puede usar el sistema
        /// BD: id = 2, nombre = "Activo"
        /// </summary>
        public const int ACTIVO = 2;

        /// <summary>
        /// Usuario BLOQUEADO - por intentos fallidos o por admin
        /// BD: id = 3, nombre = "Bloqueado"
        /// </summary>
        public const int BLOQUEADO = 3;

        /// <summary>
        /// Usuario INACTIVO - deshabilitado temporalmente
        /// BD: id = 4, nombre = "Inactivo"
        /// </summary>
        public const int INACTIVO = 4;

        /// <summary>
        /// Usuario ELIMINADO - borrado lógico
        /// BD: id = 5, nombre = "Eliminado"
        /// </summary>
        public const int ELIMINADO = 5;

        /// <summary>
        /// Obtiene el nombre del estado basado en el ID
        /// </summary>
        public static string ObtenerNombre(int estadoId)
        {
            return estadoId switch
            {
                PENDIENTE => "Pendiente",
                ACTIVO => "Activo",
                BLOQUEADO => "Bloqueado",
                INACTIVO => "Inactivo",
                ELIMINADO => "Eliminado",
                _ => "Desconocido"
            };
        }

        /// <summary>
        /// Verifica si un estado permite login
        /// </summary>
        public static bool PermiteLogin(int estadoId)
        {
            return estadoId == ACTIVO;
        }
    }
}
