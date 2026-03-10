using System;

namespace Entidad
{
    public class Entidad_AuditLog
    {
        public int id { get; set; }
        public DateTime fecha_evento { get; set; }

        // Usuario
        public int? usuario_id { get; set; }
        public string usuario_email { get; set; }
        public string usuario_nombre { get; set; }
        public string usuario_rol { get; set; }

        // Operación
        public string tipo_operacion { get; set; }
        public string entidad { get; set; }
        public int? entidad_id { get; set; }
        public string accion { get; set; }
        public string tabla_afectada { get; set; }

        // Cambios
        public string valores_anteriores { get; set; }
        public string valores_nuevos { get; set; }

        // Request metadata
        public string ip_address { get; set; }
        public string user_agent { get; set; }
        public string endpoint { get; set; }
        public string metodo_http { get; set; }

        // Estado
        public bool exito { get; set; }
        public string codigo_error { get; set; }
        public string mensaje_error { get; set; }
        public string datos_adicionales { get; set; }
    }

    public class Entidad_AuditConfiguration
    {
        public int id { get; set; }
        public string entidad { get; set; }
        public bool auditar_insert { get; set; }
        public bool auditar_update { get; set; }
        public bool auditar_delete { get; set; }
        public bool auditar_select { get; set; }
        public string campos_sensibles { get; set; }
        public string campos_auditables { get; set; }
        public bool activo { get; set; }
        public DateTime fecha_creacion { get; set; }
        public DateTime fecha_actualizacion { get; set; }
    }
}