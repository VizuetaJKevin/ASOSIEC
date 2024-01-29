namespace Entidad
{
    public class Entidad_Producto
    {
        public int id { get; set; }
        public int estadoId { get; set; }
        public int companiaId { get; set; }
        public int marca_producto_Id { get; set; }
        public int categoria_producto_Id { get; set; }
        public string nombre_producto { get; set; }
        public string descripcion { get; set; }
        public int stock { get; set; }
        public int estrellas { get; set; }
        public string url_Img { get; set; }
        public decimal precio_ahora { get; set; }
        public decimal precio_antes { get; set; }
    }
}
