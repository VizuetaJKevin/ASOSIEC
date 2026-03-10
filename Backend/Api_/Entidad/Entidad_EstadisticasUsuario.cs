namespace Entidad
{
    public class Entidad_EstadisticasUsuario
    {
        public int productosComprados7Dias { get; set; }
        public decimal totalGastado { get; set; }
        public List<ComprasPorMes> comprasPorMes { get; set; }
    }

    public class ComprasPorMes
    {
        public string mes { get; set; }
        public int cantidad { get; set; }
        public decimal monto { get; set; }
    }
}