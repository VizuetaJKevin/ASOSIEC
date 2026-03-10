namespace Entidad
{
    public class Entidad_Producto
    {
        public int id { get; set; }
        public int estadoProductoId { get; set; }
        public int vendedorId { get; set; }
        public int categoria_producto_Id { get; set; }
        public string nombre_producto { get; set; }
        public string descripcion { get; set; }
        public int? marcaId { get; set; }
        public int stock { get; set; }
        public int estrellas { get; set; }
        public string url_Img { get; set; }
        public decimal precio_ahora { get; set; }
        public decimal precio_antes { get; set; }
        public bool aprobado { get; set; }
        public DateTime? fecha_aprobacion { get; set; }
        public int? aprobado_por { get; set; }
        public string motivo_rechazo { get; set; }
    }
}