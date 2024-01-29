

using System;

namespace Entidad
{
    public class Entidad_Item
    {
        public int id { get; set; }
        public int estadoId { get; set; }
        public int usuarioId { get; set; }
        public int productoId { get; set; }
        public int? ordenId { get; set; }
        public int cantidad { get; set; }
        public DateTime fecha { get; set; }
    }
    public class Entidad_carrito
    {
        public int id { get; set; }
        public string img { get; set; }
        public string Nombre { get; set; }
        public decimal precio { get; set; }
        public int stock { get; set; }
        public string descripcion { get; set; }
        public Entidad_Item Entidad_Item { get; set; }

    }
}
