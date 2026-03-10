using System;

namespace Entidad
{
    public class Entidad_Usuario
    {
        public int id { get; set; }
        public int estadoUsuarioId { get; set; }
        public int rolId { get; set; }
        public string nombre { get; set; }
        public string apellido { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string telefono { get; set; }
        public string direccion { get; set; }

        public string fotoPerfil { get; set; }      
        public string twitter { get; set; }        
        public string instagram { get; set; }      
        public string facebook { get; set; }       
        public int maxintentos { get; set; }
        public int intentosfallidos { get; set; }
        public bool? aprobado { get; set; }
        public DateTime? fecha_aprobacion { get; set; }
        public int? aprobado_por { get; set; }
    }
}