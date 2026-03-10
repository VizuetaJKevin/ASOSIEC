namespace ASOSIEC.Constants
{
    /// <summary>
    /// CONSTANTES de Roles de Usuario
    /// 
    /// ⚠️ IMPORTANTE: Estos valores corresponden EXACTAMENTE a los IDs de la tabla Rol en la BD
    /// Si cambias los IDs en la BD, DEBES actualizar estos valores aquí
    /// 
    /// Tabla BD: Rol
    /// Campos: id, nombre
    /// </summary>
    public static class Roles
    {
        /// <summary>
        /// ROL ADMINISTRADOR - Control total del sistema
        /// BD: id = 1, nombre = "Admin"
        /// </summary>
        public const int ADMIN = 1;

        /// <summary>
        /// ROL CLIENTE - Comprador en el e-commerce
        /// BD: id = 2, nombre = "Cliente"
        /// </summary>
        public const int CLIENTE = 2;

        /// <summary>
        /// ROL VENDEDOR - Puede vender productos en la plataforma
        /// BD: id = 3, nombre = "Vendedor"
        /// </summary>
        public const int VENDEDOR = 3;

        /// <summary>
        /// Nombres de roles para JWT Claims
        /// </summary>
        public static class Nombres
        {
            public const string ADMIN = "Admin";
            public const string CLIENTE = "Cliente";
            public const string VENDEDOR = "Vendedor";
        }

        /// <summary>
        /// Obtiene el nombre del rol basado en el ID
        /// </summary>
        public static string ObtenerNombre(int rolId)
        {
            return rolId switch
            {
                ADMIN => Nombres.ADMIN,
                CLIENTE => Nombres.CLIENTE,
                VENDEDOR => Nombres.VENDEDOR,
                _ => "Desconocido"
            };
        }

        /// <summary>
        /// Verifica si un rol es administrador
        /// </summary>
        public static bool EsAdmin(int rolId)
        {
            return rolId == ADMIN;
        }

        /// <summary>
        /// Verifica si un rol es vendedor
        /// </summary>
        public static bool EsVendedor(int rolId)
        {
            return rolId == VENDEDOR;
        }

        /// <summary>
        /// Verifica si un rol es cliente
        /// </summary>
        public static bool EsCliente(int rolId)
        {
            return rolId == CLIENTE;
        }

        /// <summary>
        /// Verifica si un rol puede vender productos
        /// </summary>
        public static bool PuedeVender(int rolId)
        {
            return rolId == ADMIN || rolId == VENDEDOR;
        }
    }
}
