using System;

namespace Entidad
{
    public class Entidad_Orden
    {
        public int id { get; set; }
        public int estadoOrdenId { get; set; }
        public int usuarioId { get; set; }
        public string nombre { get; set; }
        public string apellido { get; set; }
        public string email { get; set; }
        public decimal costo_envio { get; set; }
        public decimal total { get; set; }
        public string token_orden { get; set; }
        public string direccion_1 { get; set; }
        public string direccion_2 { get; set; }
        public DateTime fecha { get; set; }
    }
}
