using System;

namespace Entidad
{
    public class Entidad_Devolucion
    {
        // ============================================
        // PROPIEDADES BÁSICAS (de la tabla devolucion)
        // ============================================
        public int id { get; set; }
        public int ordenId { get; set; }
        public int usuarioId { get; set; }
        public int estadoDevolucionId { get; set; }
        public string motivo { get; set; }
        public string tipo_devolucion { get; set; } 
        public string descripcion_detallada { get; set; }
        public string url_foto_1 { get; set; }
        public string url_foto_2 { get; set; }
        public string url_foto_3 { get; set; }
        public string numero_seguimiento { get; set; }
        public DateTime fecha_solicitud { get; set; }
        public DateTime? fecha_respuesta { get; set; }
        public int? respondido_por { get; set; }
        public string respuesta_admin { get; set; }
        public bool activo { get; set; }

        // ============================================
        // ✅ PROPIEDADES EXTENDIDAS (para vistas JOIN)
        // Estas propiedades se llenan en consultas que hacen JOIN
        // con otras tablas (estado_devolucion, Orden, Usuario)
        // ============================================
        public string estado_codigo { get; set; }
        public string estado_descripcion { get; set; }
        public string token_orden { get; set; }
        public decimal? total_orden { get; set; }
        public string nombre_usuario { get; set; }
        public string apellido_usuario { get; set; }
        public string email_usuario { get; set; }
    }
}