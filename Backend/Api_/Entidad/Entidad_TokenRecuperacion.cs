using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entidad
{
    public class Entidad_TokenRecuperacion
    {
        public int id { get; set; }
        public string email { get; set; }
        public string token { get; set; }
        public DateTime fecha_creacion { get; set; }
        public DateTime fecha_expiracion { get; set; }
        public bool usado { get; set; }
        public DateTime? fecha_uso { get; set; }
        public string ip_solicitud { get; set; }
    }

    // DTO para solicitar recuperación
    public class SolicitudRecuperacionDTO
    {
        public string email { get; set; }
    }

    // DTO para restablecer contraseña
    public class RestablecerPasswordDTO
    {
        public string token { get; set; }
        public string nuevaPassword { get; set; }
    }
}