using System;

namespace Entidad
{
    public class Entidad_ItemDevolucion
    {
        // ============================================
        // PROPIEDADES BÁSICAS (de la tabla item_devolucion)
        // ============================================
        public int id { get; set; }
        public int devolucionId { get; set; }
        public int itemId { get; set; } 
        public int productoId { get; set; }
        public int cantidad { get; set; }
        public decimal precio_unitario { get; set; }
        public string motivo_item { get; set; }
        public bool activo { get; set; }  

        // ============================================
        // ✅ PROPIEDADES EXTENDIDAS (para vistas JOIN)
        // Estas propiedades se llenan en consultas que hacen JOIN
        // ============================================

        public string nombre_producto { get; set; }
        public string url_imagen { get; set; }
    }
}