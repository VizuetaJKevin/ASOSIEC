using System;

namespace Entidad
{
    public class Entidad_ComprobantePago
    {
        public int id { get; set; }
        public int ordenId { get; set; }
        public string url_comprobante { get; set; } = "";
        public string numero_referencia { get; set; } = "";
        public string direccion_entrega { get; set; }
        public string telefono_contacto { get; set; }
        public string observaciones { get; set; } = "";
        public string motivo_rechazo { get; set; } = "";

        // Campos de control (usados por el controller pero no se envían al SP de registro)
        public DateTime fecha_subida { get; set; }
        public bool verificado { get; set; }
        public DateTime? fecha_verificacion { get; set; }
        public int? verificado_por { get; set; }
    }
}