using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entidad
{
    public class Entidad_Vendedor
    {
        public int id { get; set; }
        public int usuarioId { get; set; }
        public int estadoUsuarioId { get; set; }
        public string nombre_comercial { get; set; }
        public string descripcion { get; set; }
        public string telefono { get; set; }
        public DateTime fecha_registro { get; set; }
    }

    // DTO para mostrar vendedor con datos de usuario
    public class Entidad_VendedorCompleto
    {
        public int id { get; set; }
        public int usuarioId { get; set; }
        public int estadoUsuarioId { get; set; }
        public string nombre_comercial { get; set; }
        public string descripcion { get; set; }
        public string telefono { get; set; }
        public DateTime fecha_registro { get; set; }

        // Datos del usuario
        public string nombre_usuario { get; set; }
        public string apellido_usuario { get; set; }
        public string email_usuario { get; set; }
    }
}














































































