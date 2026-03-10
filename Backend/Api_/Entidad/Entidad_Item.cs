using System;

namespace Entidad
{
    public class Entidad_Item
    {
        public int id { get; set; }
        public int estadoItemId { get; set; }
        public int usuarioId { get; set; }
        public int productoId { get; set; }
        public int? ordenId { get; set; }
        public int cantidad { get; set; }
        public DateTime fecha { get; set; }
    }

    // ✅ CLASE ENTIDAD_CARRITO ACTUALIZADA CON INFORMACIÓN DEL VENDEDOR
    public class Entidad_carrito
    {
        public int id { get; set; }
        public string img { get; set; }
        public string Nombre { get; set; }                    // Campo C# con mayúscula
        public string nombre_producto { get; set; }           // Campo adicional para compatibilidad
        public decimal precio { get; set; }
        public int stock { get; set; }
        public string descripcion { get; set; }
        public int categoria_producto_Id { get; set; }        // ID de categoría
        public int vendedorId { get; set; }                   // ✅ AGREGADO: ID del vendedor
        public string nombre_vendedor { get; set; }           // ✅ AGREGADO: Nombre comercial del vendedor
        public Entidad_Item Entidad_Item { get; set; }
    }
}